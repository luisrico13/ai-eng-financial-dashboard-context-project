# Especificación de componentes

## Alcance y convenciones

Esta especificación cubre las tres funcionalidades solicitadas por producto. Es
un contrato para una implementación posterior; no afirma que las vistas ya
existan. Las props reutilizan los tipos de [api-types.ts](./api-types.ts) y
[param-types.ts](./param-types.ts). Se conserva la estructura visual actual:
`DashboardHeader`, tarjetas `Card`, estados `Skeleton` y gráficos Recharts.
Como la interfaz actual está en inglés, las nuevas etiquetas también se
mantienen en inglés.

Los importes se formatean con las utilidades financieras existentes. El backend
actual genera datos sintéticos; la interfaz no debe presentarlos como datos
bancarios reales.

## Funcionalidad 1: rango de fechas

### `DateRangeControls`

Props:

```ts
interface DateRangeControlsProps {
  range: DateRangeFilter;
  facets: FacetsResponse;
  onChange: (range: DateRangeFilter) => void;
  disabled?: boolean;
}
```

- Renderiza dos controles nativos `type="date"`, etiquetados `Start date` y
  `End date`, inmediatamente bajo el encabezado del dashboard y antes de los
  KPI. Sus valores de formulario y query son strings `YYYY-MM-DD`.
- Muestra junto a los controles `Available: {min_date} – {max_date}` usando las
  fechas de `FacetsResponse`. Establece esos límites como `min` y `max` de ambos
  inputs; el inicio no puede superar el fin y el fin no puede preceder al inicio.
- Las dos fechas son opcionales. Un campo vacío se representa como `undefined`
  en `DateRangeFilter` y se omite de la query; no se envían strings vacíos.
  También se permite filtrar con solo inicio o solo fin.
- Los cambios válidos se aplican inmediatamente, sin botón Apply. Un rango
  inválido muestra un error junto a los controles y no dispara una petición.
- La pantalla principal obtiene `FacetsResponse` una vez y usa el mismo rango
  para `GET /api/metrics` y `GET /api/metrics/alerts`. KPI, período, ambos
  gráficos y alertas deben corresponder al mismo rango. Sin fechas, se muestran
  todos los datos disponibles.
- Reutiliza el mismo control en la página comparativa; allí el rango filtra las
  peticiones de categorías B2B y B2C.
- Si falla la carga de facetas, conserva visibles los datos que sí cargaron,
  muestra `Date range unavailable` en lugar de las fechas de referencia y deja
  disponibles los inputs sin límites derivados del servidor.

## Funcionalidad 2: alertas de anomalías

### `AlertsTable`

Props:

```ts
interface AlertsTableProps {
  alerts: AlertsResponse;
  threshold: number;
  onThresholdChange: (threshold: number) => void;
  loading: boolean;
  error?: string;
  onRetry?: () => void;
}
```

- Se coloca debajo de los dos gráficos del dashboard principal.
- Incluye un input numérico `Alert threshold` con `min=0.01`, `max=1`, `step=0.01`
  y valor inicial `0.3`. El valor del control es un ratio; se muestra también su
  equivalente porcentual (por ejemplo, `0.30` como `30%`). Solo se confirma y
  consulta un valor dentro del rango.
- Para cada cambio válido, el padre consulta
  `GET /api/metrics/alerts?threshold=...&group_by=month`, añadiendo las fechas
  activas. La tabla usa una sola granularidad mensual, coherente con los
  gráficos existentes.
- Presenta una tabla accesible con cuatro columnas: `Period`, `Outcome`,
  `3-period average` e `Increase`. `outcome_total` y `baseline_average` se
  formatean como importes; `increase_ratio` se multiplica por 100 y se muestra
  como porcentaje.
- Estados: skeleton durante la carga; error en línea con acción de reintento;
  tabla si hay filas; si `alerts` está vacío, muestra explícitamente `No
  anomalies found for this date range and threshold.` La tabla no desaparece.
- En pantallas estrechas, la tabla puede desplazarse horizontalmente sin
  colapsar las columnas ni ocultar sus encabezados.

### Brecha del contrato de alertas

El requisito pide la media aritmética de los tres períodos anteriores. Hoy,
`GET /api/metrics/alerts` calcula `baseline_average` con todos los períodos
anteriores de la respuesta agrupada, no con una ventana de tres. El frontend no
puede reconstruir la media correcta a partir de `AlertsResponse`, porque el
endpoint solo devuelve los períodos que ya superaron el umbral.

Antes de implementar el panel, el backend debe conservar la forma de
`AlertEntry`, pero definir `baseline_average` como la media de los tres períodos
mensuales completos inmediatamente anteriores y calcular `increase_ratio` con
esa media. Si se eligió un rango de fechas, puede devolver alertas solo dentro
del rango, pero debe usar los tres períodos anteriores al inicio como contexto
para la primera fila. Sin tres períodos previos o con una media igual a cero, no
se genera una alerta. La condición de alerta es `increase_ratio > threshold`.
La restricción UI de `0.01–1.0` es más estricta que el contrato backend actual,
que solo declara un mínimo de cero.

## Funcionalidad 3: comparación B2B vs B2C

### `BusinessComparisonPage`

- Es una página distinta en `/comparison`, con navegación accesible desde la
  vista principal y un enlace de regreso al dashboard. La aplicación actual no
  tiene router; la implementación debe añadir navegación que permita abrir y
  recargar directamente esta ruta, no limitarse a ocultar y mostrar secciones
  en la misma página.
- Carga una vez `GET /api/metrics/facets` para obtener el rango global disponible
  y la lista canónica de categorías; el endpoint no recibe rango ni segmento.
  Comparte `DateRangeControls`; al cambiar fechas, actualiza ambas secciones y
  el gráfico en conjunto.
- Para cada segmento consulta
  `GET /api/metrics/categories/top?operation_type=income&limit=20&business_type=B2B`
  y la misma query con `business_type=B2C`, agregando las fechas si existen.
  `limit=20` recupera todos los valores posibles del union actual de categorías
  (cinco como máximo); cada respuesta viene ordenada por importe descendente.
- Cada tabla muestra como máximo las cinco primeras filas de `TopCategoriesResponse`
  que pertenecen a `FacetsResponse.categories`. No inventa filas con valor cero.
  El total de ingresos del segmento es la suma de todos los `total_amount`
  devueltos; el porcentaje de cada fila es `total_amount / totalIncome * 100`.
  Si el total es cero, muestra `—` para el porcentaje.
- Presenta las secciones B2B y B2C en paralelo en escritorio y apiladas en
  móvil. Cada tabla tiene `Category`, `Income` y `% of segment income`.
- Bajo ambas tablas muestra un único gráfico de barras con dos valores: ingreso
  total B2B e ingreso total B2C. Usa la misma escala, tooltip de importe y
  etiquetas accesibles. El gráfico no compara beneficio ni outcome.
- Estados: carga independiente por sección; error identificado para el segmento
  afectado con reintento; estado vacío explícito para un grupo sin ingresos.
  El gráfico requiere ambos totales válidos; si uno falla, muestra un error en
  el área del gráfico en vez de comparar un valor parcial.

### Props de los componentes de comparación

```ts
interface BusinessCategoryTableProps {
  businessType: BusinessType;
  entries: TopCategoriesResponse;
  availableCategories: FacetsResponse["categories"];
  totalIncome: number;
  loading: boolean;
  error?: string;
}

interface RevenueComparisonChartProps {
  totals: Record<BusinessType, number>;
  loading: boolean;
  error?: string;
}
```

`BusinessComparisonPage` obtiene los datos y deriva los totales; las tablas y el
gráfico reciben datos tipados, no realizan peticiones HTTP.

### Alcance de facetas

El endpoint actual de facetas devuelve una lista global de categorías y no
acepta `business_type`. Esta especificación usa esa lista como catálogo
autorizado y usa cada respuesta de categorías filtrada por segmento para
determinar las filas con ingresos de ese segmento. No presenta la lista global
como si fueran facetas independientes de B2B y B2C. Si producto requiere que la
faceta misma varíe por segmento, habrá que ampliar el endpoint backend.