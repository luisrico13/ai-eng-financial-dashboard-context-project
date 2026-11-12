# Contrato de datos del frontend

Este documento es el handoff para implementar las tres funcionalidades del
dashboard. Describe el contrato verificado, no una implementación terminada.
Las rutas se contrastaron con el OpenAPI de FastAPI en
[Swagger UI](http://localhost:8000/docs). El backend actual genera movimientos
sintéticos; no son datos bancarios reales.

## Tipos compartidos

Importa los tipos existentes; no dupliques sus unions ni declares `any` o
`object`:

| Tipo | Definición |
| --- | --- |
| `DateRangeFilter` | Fechas opcionales `start_date` y `end_date`, strings `YYYY-MM-DD`. |
| `FacetsResponse` | `operation_types: OperationType[]`, `business_types: BusinessType[]`, `categories: Category[]`, `min_date: string`, `max_date: string`. Las fechas usan `YYYY-MM-DD`. |
| `FinancialMovement` | `create_date: string` (`YYYY-MM-DD`), `amount: number`, `operation_type: OperationType`, `category: Category`, `business_type: BusinessType`. |
| `AlertsParams` | `DateRangeFilter` más `threshold`, `group_by` y `business_type` opcionales. |
| `AlertEntry` / `AlertsResponse` | Una anomalía y el arreglo de anomalías. |
| `TopCategoriesParams` | `DateRangeFilter` más `operation_type`, `limit` y `business_type` opcionales. |
| `CategoryEntry` / `TopCategoriesResponse` | Una categoría agregada y el arreglo de resultados. |
| `OperationType` | `income` o `outcome`. |
| `Category` | `suppliers`, `sales`, `operational`, `administrative` u `others`. |
| `BusinessType` | `B2B` o `B2C`. |

Las definiciones viven en [api-types.ts](./api-types.ts),
[param-types.ts](./param-types.ts) y
[financial-types.ts](../src/lib/financial-types.ts). Los parámetros vacíos u
opcionales se omiten de la URL; no se serializan como `""` ni `null`.

## Funcionalidad 1: filtro de fechas

### Endpoints y contrato

| Endpoint | Request/query usado por esta funcionalidad | Response |
| --- | --- | --- |
| `GET /api/metrics/facets` | Sin query. | `FacetsResponse`; `min_date` y `max_date` son fechas `YYYY-MM-DD`. |
| `GET /api/metrics` | `DateRangeFilter`; fechas opcionales. | `FinancialMovement[]`. |

`GET /api/metrics` también admite `category` (los cinco valores de `Category`)
y `operation_type` (`income` o `outcome`), ambos opcionales. El filtro de fechas
no los envía. `start_date` y `end_date` son inclusivos y se pueden enviar
independientemente. El servidor valida que sean fechas; el frontend limita ambos
inputs al rango global de `FacetsResponse` y no envía un rango invertido.

### Comportamiento y casos límite

- Coloca `Start date` y `End date` bajo el encabezado principal, antes de los
  KPI. Muestra `Available: {min_date} – {max_date}` como referencia.
- Cambia los datos en cuanto el rango sea válido. Envía las fechas seleccionadas
  a `/api/metrics`; KPI, período, ambos gráficos y alertas deben usar el mismo
  rango. Con ambos campos vacíos, omite ambos parámetros y muestra todo el
  dataset.
- **Sin fechas:** mostrar el rango disponible de facetas, sin selección activa;
  KPI y gráficos muestran todos los datos.
- **Solo inicio o solo fin:** enviar solo ese parámetro y mostrar el subconjunto
  inclusivo que devuelve la API; el otro input permanece vacío.
- **Inicio posterior al fin o fecha fuera de `min_date`/`max_date`:** mostrar
  validación junto al campo y no enviar una petición nueva.
- **Rango válido sin movimientos:** `/api/metrics` devuelve `[]`; mostrar KPI en
  cero y el estado vacío existente en cada gráfico. No mostrar un error de API.
- **Fallo de `/api/metrics/facets`:** mostrar `Date range unavailable`, mantener
  los inputs utilizables sin límites del servidor y no inventar fechas de
  referencia. Un fallo de métricas se muestra como error, no como lista vacía.

## Funcionalidad 2: alertas de anomalías

### Endpoint y contrato

`GET /api/metrics/alerts` devuelve `AlertsResponse` (`AlertEntry[]`). Cada
elemento tiene:

| Campo | Tipo/semántica |
| --- | --- |
| `period` | `string`; con `group_by=month`, formato `YYYY-MM`. |
| `outcome_total` | `number`; total de outcomes del período. |
| `baseline_average` | `number`; media usada como referencia. |
| `increase_ratio` | `number`; ratio relativo, por ejemplo `0.3` equivale a `30%`. |

`AlertsParams` recoge estos parámetros:

| Query | Tipo y valores válidos | Default/restricción API | Uso en la UI principal |
| --- | --- | --- | --- |
| `threshold` | `number`, ratio decimal. | `0.3`; mínimo `0`, sin máximo declarado. | Input restringido a `0.01–1.0`, paso `0.01`; enviar solo valores válidos. |
| `group_by` | `day`, `week` o `month`. | `month`. | Fijo en `month`, coherente con los gráficos existentes. |
| `start_date` | Fecha string `YYYY-MM-DD`. | Opcional; inclusiva. | Incluir si el filtro de fechas está activo. |
| `end_date` | Fecha string `YYYY-MM-DD`. | Opcional; inclusiva. | Incluir si el filtro de fechas está activo. |
| `business_type` | `B2B` o `B2C`. | Opcional. | Omitir en el dashboard principal, que muestra el total de ambos grupos. |

Muestra la tabla bajo los gráficos con `Period`, `Outcome`, `3-period average` e
`Increase`. Formatea los importes con el formateador financiero existente y
muestra `increase_ratio * 100` como porcentaje. Si `AlertsResponse` es `[]`, la
tabla permanece visible con `No anomalies found for this date range and
threshold.`

### Brecha que debe cerrarse antes de implementar

El backend actual agrupa los movimientos después de aplicar el rango y calcula
`baseline_average` usando todos los períodos anteriores disponibles en ese
resumen. No calcula una ventana móvil de tres períodos. Como la respuesta solo
incluye anomalías, el frontend no puede reconstruir el promedio de los tres
períodos desde `AlertsResponse`.

Para satisfacer el brief, el backend debe definir `baseline_average` como la
media aritmética de los tres períodos mensuales completos inmediatamente
anteriores y calcular `increase_ratio` con ese valor. Al filtrar fechas, debe
usar períodos anteriores al inicio como contexto, pero devolver solo alertas
dentro del rango seleccionado. Si aún no existen tres períodos previos o la
media es cero, no emitir alerta. La condición actual de inclusión es
`increase_ratio > threshold` y debe conservarse.

### Casos límite y UI

- **Ninguna anomalía supera el umbral:** mostrar el mensaje de estado vacío; no
  ocultar la tabla ni representar esto como error.
- **Menos de tres períodos previos o baseline cero:** no dividir por cero ni
  mostrar una alerta sin baseline; si no quedan filas, mostrar el estado vacío.
- **Rango corto al inicio del dataset:** usar los tres períodos anteriores como
  contexto y mostrar solo las anomalías dentro del rango solicitado.
- **Umbral fuera de `0.01–1.0`:** conservar el último valor válido, mostrar un
  error junto al input y no consultar la API.
- **Fallo HTTP:** mostrar error y reintento; no sustituirlo por el estado vacío.

## Funcionalidad 3: comparación B2B vs B2C

### Endpoints y contrato

| Endpoint | Request/query | Response |
| --- | --- | --- |
| `GET /api/metrics/facets` | Sin query. | `FacetsResponse`; catálogo global de categorías y segmentos. |
| `GET /api/metrics/categories/top` | `TopCategoriesParams`. | `TopCategoriesResponse` (`CategoryEntry[]`). |

`CategoryEntry` contiene `category: Category`, `operation_type: OperationType` y
`total_amount: number`. `TopCategoriesParams` acepta:

| Query | Tipo y valores válidos | Default/restricción API | Valor de la comparación |
| --- | --- | --- | --- |
| `operation_type` | `income` o `outcome`. | `outcome`. | Enviar `income`. |
| `limit` | Entero. | Entre `1` y `20`; default `5`. | Enviar `20` para obtener todos los valores posibles del union actual; mostrar como máximo los primeros `5`. |
| `start_date` | Fecha string `YYYY-MM-DD`. | Opcional; inclusiva. | Compartida con la otra sección. |
| `end_date` | Fecha string `YYYY-MM-DD`. | Opcional; inclusiva. | Compartida con la otra sección. |
| `business_type` | `B2B` o `B2C`. | Opcional. | Hacer una petición para cada valor. |

Carga `/api/metrics/facets` una vez y las dos peticiones a categorías con los
mismos parámetros de fecha. Usa `FacetsResponse.categories` como catálogo
global y valida contra él las filas de cada respuesta. El endpoint de facetas
no acepta `business_type`; la disponibilidad de categorías con ingresos para
cada segmento la determina su respuesta de `/categories/top`.

El endpoint top no retorna el total del grupo por separado. Con el union actual
de cinco categorías y `limit=20`, la respuesta incluye todos los totales de
ingresos posibles. Calcula `totalIncome` como la suma de todos los
`total_amount`, muestra las cinco primeras filas por monto y calcula cada
porcentaje como `total_amount / totalIncome * 100`. No sumes únicamente las
filas visibles si el límite de visualización se cambia a menos de cinco.

### Vista y casos límite

- Implementa una página distinta en `/comparison`, con navegación de ida y
  regreso y soporte de carga directa/recarga. El proyecto no tiene router
  instalado; la implementación debe incorporar navegación de rutas.
- Muestra dos tablas paralelas en escritorio y apiladas en móvil. Cada tabla
  tiene `Category`, `Income` y `% of segment income`. Bajo ambas, muestra un
  único gráfico de barras con los totales de ingresos B2B y B2C, misma escala,
  tooltip de importe y etiquetas accesibles.
- Reutiliza el filtro de fechas. Con ambos campos vacíos, compara todo el
  dataset; con uno o ambos campos definidos, aplica el mismo rango inclusivo a
  las dos solicitudes.
- **Un segmento tiene menos de cinco categorías de ingreso:** muestra solo las
  filas devueltas, ordenadas por monto; no inventes categorías con importe cero.
- **Un segmento no tiene ingresos:** tabla con estado vacío y total `0`; muestra
  `—` para porcentajes cuyo denominador es cero. El gráfico sigue comparando
  ambos totales, incluido el cero.
- **Ambos segmentos no tienen movimientos en el rango:** ambas tablas muestran
  su estado vacío y el gráfico presenta dos totales cero; no producir `NaN` o
  porcentajes infinitos.
- **Falla una petición de segmento:** mostrar el error y reintento en la sección
  afectada; no presentar el gráfico como comparación completa con un total
  parcial.
- **Rango inválido:** reutilizar el error del filtro compartido y no iniciar
  ninguna petición nueva.

## Estado actual y límites

La pantalla actual solo consume `GET /api/metrics` sin parámetros. Las facetas,
alertas y la comparación descritas aquí aún no están conectadas a componentes.
No cambies los contratos TypeScript para ocultar las brechas de backend; solicita
una actualización del API para la media móvil de tres períodos. Conserva los
estados de error distintos de los estados vacíos y no presentes los datos
sintéticos como información financiera real.