# Nota de análisis: hallazgos y reglas propuestas

## Alcance

Revisión puntual del código y de una conversación local asociada al repositorio. La conversación detectó que el período fijo del encabezado no coincidía con las fechas generadas por la API; el código ya se corrigió para derivar el período de los movimientos. Una sola conversación no permite afirmar que un comportamiento sea recurrente.

## Arquitectura

**Hecho:** `frontend/src/App.tsx` consume `GET /api/metrics` y calcula los KPI y los datos mensuales en el cliente. `backend/app/routes.py` también expone endpoints de resumen, facetas, categorías, comparaciones, alertas y segmentos B2B/B2C.

**Regla propuesta:** al agregar o cambiar un endpoint, especificar si lo consume el frontend. No presentar una ruta disponible en backend como una capacidad visible del dashboard sin verificar la integración.

## Datos y periodos

**Hecho:** `backend/app/routes.py` genera movimientos para doce meses y calcula sus años a partir de la fecha actual. `frontend/src/App.tsx` usa `formatPeriod` para mostrar el rango recibido; `frontend/src/lib/financial-utils.test.ts` cubre rangos entre años y la lista vacía.

**Regla propuesta:** derivar etiquetas temporales de los datos recibidos, no de un año fijo, y probar tanto rangos que cruzan el año como datos vacíos.

**Hecho:** `frontend/src/lib/mock-data.ts` contiene movimientos de 2024, pero no hay referencias de runtime a `mockMovements`; la pantalla consume la API.

**Regla propuesta:** antes de tratar un fixture como fuente de la interfaz, comprobar sus referencias. Si queda sin uso, mantener explícito que es solo un fixture o retirarlo cuando deje de servir a pruebas u otros consumidores.

## DX y pruebas

**Hecho:** los scripts npm, incluido `test`, están en `frontend/package.json`; la raíz no tiene `package.json`. En esta revisión, las pruebas funcionaron dentro del contenedor con `docker compose exec -T frontend npm test -- src/lib/financial-utils.test.ts`; en el host no estaba instalado Vitest.

**Regla propuesta:** documentar el directorio y entorno requeridos para cada comando de frontend. Ejecutar los scripts desde `frontend` con dependencias instaladas o desde el servicio `frontend` de Compose.

## Configuración de agentes

**Hecho:** `AGENTS.md` indica revisar `.agents/rules`, `.agents/skills` y `memory-bank`; esas rutas no existen en el estado revisado.

**Regla propuesta:** las instrucciones deben marcar como opcionales las rutas que pueden faltar, o incluirlas en el repositorio si son requisitos obligatorios para trabajar.

## Flujo Git

**Hecho:** después de enmendar un commit que ya se había publicado, `git status --short --branch` reportó `main...origin/main [ahead 1, behind 1]`.

**Regla propuesta:** antes de reescribir commits publicados en `main`, comprobar el estado remoto y coordinarlo con quienes compartan la rama. Preferir un commit nuevo; si se autoriza reescritura, verificar el resultado antes de actualizar el remoto.

## Fase 3: reglas implementadas y probadas

Se incorporaron cuatro reglas en [`.agents/rules`](./.agents/rules), enlazadas
desde [AGENTS.md](./AGENTS.md). Cada una incluye nombre, alcance, justificación,
guía específica y una tarea pequeña de validación. Las reglas se leen a través
de `AGENTS.md`; no son hooks ni verificaciones automáticas.

| Regla | Tarea real | Resultado |
| --- | --- | --- |
| [Documentación](./.agents/rules/documentation.md) | Añadir comandos de pruebas y aclarar el consumidor de la API en ambos README. | Enlaces locales comprobados; comandos ejecutados en Compose. |
| [Frontend](./.agents/rules/frontend-data.md) | Añadir tres regresiones: KPI vacíos, series vacías y período de un solo mes. | 10 pruebas aprobadas, incluidas las existentes de cruce de año. |
| [Backend](./.agents/rules/backend-api.md) | Añadir cuatro casos de filtros inválidos y uno de intervalo sin datos a `/api/metrics`. | 20 pruebas aprobadas; entradas inválidas devuelven 422 y un intervalo sin datos devuelve `[]`. |
| [Git y verificación](./.agents/rules/git-verification.md) | Revisar estado inicial, cambios y whitespace; preparar únicamente archivos de esta fase para un commit dedicado. | Estado inicial limpio y sincronizado; `git diff --check` aprobado. |

### Comandos ejecutados

Desde la raíz, usando los servicios de Compose que ya estaban en ejecución:

```bash
docker compose exec -T frontend npm test -- src/lib/financial-utils.test.ts
docker compose exec -T backend python -m pytest tests/test_routes.py -q
git diff --check
```

También se comprobaron con `pathlib` los enlaces locales de `AGENTS.md` y ambos
README, las cinco secciones requeridas de cada regla y sus referencias desde
`AGENTS.md`.

### Refinamientos y límites

- Se concretaron los comandos con directorio y entorno, en lugar de indicar
  solamente «ejecutar las pruebas».
- Las fechas del nuevo caso sin datos se derivan de la respuesta de la API,
  evitando depender de un año fijo.
- Las carpetas de skills y memoria se marcaron como opcionales; no se crearon
  directorios vacíos ni se añadió un segundo sistema de instrucciones.
- No se modificó código de producción ni se añadieron dependencias. Se validaron
  utilidades y contratos HTTP, no la interacción visual en el navegador.
- Pytest emitió una advertencia de deprecación de Starlette sobre `httpx` en
  `TestClient`. No impidió las pruebas; cambiar dependencias queda fuera de esta fase.
- El commit de esta fase es local; no se hace push sin una solicitud explícita.

## Banco de memoria: creación y verificación

Se creó [memory-bank](./memory-bank/README.md) con tres documentos:

- [Producto](./memory-bank/README.md): capacidades observadas, contrato de datos
  sintéticos y límites de las afirmaciones, con referencias al código.
- [Stack](./memory-bank/tech-context.md): lenguajes, dependencias declaradas,
  contenedores, proxy y comandos, distinguiendo rangos de versiones instaladas.
- [Estado](./memory-bank/current-state.md): resultados de la fase de reglas,
  gaps conocidos y siguientes prioridades explícitamente propuestas, no aprobadas.

Se actualizaron `AGENTS.md` y ambos README para descubrir el banco.
La revisión del código tomó como base el commit `eac7765`; no se atribuyen al
producto datos reales, funciones de UI no conectadas ni un roadmap aprobado.

### Validación de esta fase

- Se contrastaron las afirmaciones con `App.tsx`, utilidades y tipos financieros,
  la fila de KPI, rutas del backend, manifests, configuración de Vite, Dockerfiles,
  Compose y los resultados previamente registrados.
- Se ejecutó una comprobación con Python (`pathlib` y expresiones regulares) de
  existencia de enlaces locales y anclas de encabezados en el banco, `AGENTS.md`,
  ambos README y este registro.
- Se ejecutó `git diff --check` sin errores.
- No se modificó código de aplicación, pruebas ni dependencias. No se repitieron
  pruebas de aplicación ni una validación de navegador: los 10 y 20 casos citados
  pertenecen a la ejecución de la fase de reglas documentada arriba.
- Se prepara un commit dedicado a esta documentación; no se hace push.

## Fase 4: diagnóstico de ejecución y exploración de la API

Revisión realizada el 2026-11-10 en la rama `feature/frontend-specs`, antes de
redactar specs. Se inició el backend y se abrió Swagger UI en `/docs`; el
contrato se contrastó con `/openapi.json` y con respuestas reales de las rutas.

### Diagnóstico del error de carga

- La página del frontend respondió `200` y el backend respondió `200` en su
  puerto publicado, pero `GET /api/metrics` a través del proxy de Vite devolvió
  `502`.
- Los logs de Vite mostraron `getaddrinfo ENOTFOUND backend`. `docker compose
  ps -a` mostró el backend en `Exited (0)` y el frontend todavía activo. Los
  logs del backend registraban un apagado normal, sin excepción de aplicación.
- Se inició de nuevo el servicio con `docker compose up -d backend`. La primera
  petición al proxy, hecha inmediatamente después del arranque, aún devolvió
  `502` mientras Uvicorn iniciaba (`ECONNREFUSED`). La siguiente petición al
  proxy respondió `200`; los logs de Uvicorn confirmaron `GET /api/metrics`
  con `200 OK`. La causa observada fue el backend detenido, no un fallo del
  contrato de métricas.

### Contrato observado en Swagger

Todas las operaciones listadas abajo respondieron `200` en la exploración. Los
conteos son muestras de la ejecución y pueden variar con el calendario o los
parámetros; los datos son sintéticos y usan semilla `42`.

| Endpoint | Forma de respuesta | Parámetros de query |
| --- | --- | --- |
| `GET /health` | Objeto `{ status }`. | Ninguno. |
| `GET /api/metrics` | `FinancialMovement[]`: `create_date`, `amount`, `operation_type`, `category`, `business_type`. La muestra tuvo 360 elementos. | `start_date`, `end_date` (fechas inclusivas); `category` (`suppliers`, `sales`, `operational`, `administrative`, `others`); `operation_type` (`income`, `outcome`). Todos opcionales. |
| `GET /api/metrics/facets` | Objeto `{ operation_types, business_types, categories, min_date, max_date }`. | Ninguno. |
| `GET /api/metrics/summary` | `MetricsSummaryItem[]`, cada elemento `{ period, income, outcome, net }`. La muestra mensual tuvo 12 elementos. | `group_by` (`day`, `week`, `month`; predeterminado `month`); `start_date`, `end_date`, `category`, `operation_type`, `business_type`. Los demás son opcionales; los enums de tipo de operación, categoría y negocio son los indicados arriba. |
| `GET /api/metrics/categories/top` | `TopCategoryItem[]`, cada elemento `{ category, operation_type, total_amount }`. La muestra predeterminada tuvo 4 elementos. | `operation_type` (`income`, `outcome`; predeterminado `outcome`); `limit` (1-20; predeterminado 5); `start_date`, `end_date`, `business_type` (`B2B`, `B2C`), opcionales. |
| `GET /api/metrics/comparison` | Objeto `{ current_period, previous_period, delta_abs, delta_pct }`; `delta_pct` puede ser nulo. | `start_date` y `end_date` requeridos; `business_type` (`B2B`, `B2C`) opcional. Compara el neto del período con el período anterior de igual duración. |
| `GET /api/metrics/alerts` | `MetricsAlert[]`, cada elemento `{ period, outcome_total, baseline_average, increase_ratio }`. La muestra predeterminada tuvo 4 elementos. | `threshold` (mínimo 0; predeterminado 0.3); `group_by` (`day`, `week`, `month`; predeterminado `month`); `start_date`, `end_date`, `business_type` (`B2B`, `B2C`), opcionales. |
| `GET /api/metrics/b2b` y `GET /api/metrics/b2c` | `FinancialMovement[]`; las muestras tuvieron 203 y 157 elementos, respectivamente. | `start_date`, `end_date`, `category`, `operation_type`; todos opcionales. El segmento queda fijado por la ruta. |

La respuesta observada de facetas ofreció ambos tipos de operación y ambos
segmentos, las cinco categorías, y fechas mínima `2025-11-01` y máxima
`2026-10-28`. Esas fechas corresponden a esta ejecución, no a valores fijos del
contrato.

### Comandos y alcance

```bash
docker compose up -d backend
curl -fsS http://127.0.0.1:8000/openapi.json -o /tmp/financial-dashboard-openapi.json
curl -fsS http://127.0.0.1:8000/docs -o /dev/null
```

Se abrió `http://localhost:8000/docs` con el navegador del entorno. Se
consultaron `/health`, `/api/metrics`, `/api/metrics/facets`,
`/api/metrics/summary?group_by=month`, `/api/metrics/categories/top`,
`/api/metrics/comparison?start_date=2026-01-01&end_date=2026-01-31`,
`/api/metrics/alerts`, `/api/metrics/b2b` y `/api/metrics/b2c`.
Esta fase registra exploración de API y diagnóstico operativo: no se modificó
código, no se escribieron specs y no se hizo push.
Se ejecutó `git diff --check` sin errores; no se repitieron pruebas de aplicación.

## Fase 5: tipos TypeScript para contratos de la API

Se crearon `frontend/specs/api-types.ts` y `frontend/specs/param-types.ts` para
las respuestas de facetas, alertas y categorías, además de los parámetros de
query para alertas y categorías. Los tipos reutilizan `OperationType`,
`Category` y `BusinessType` de `frontend/src/lib/financial-types.ts`; las
propiedades llevan JSDoc con su significado, valores válidos y formato cuando
aplica. No se usaron los tipos `any` ni `object`.

El contrato se contrastó con `/openapi.json`: `MetricsFacets` requiere los cinco
campos declarados; `MetricsAlert` contiene `period`, `outcome_total`,
`baseline_average` e `increase_ratio`; `TopCategoryItem` contiene `category`,
`operation_type` y `total_amount`. `AlertsParams` refleja `threshold`,
`group_by`, fechas y `business_type`; `TopCategoriesParams` refleja
`operation_type`, `limit`, fechas y `business_type`. Se excluyó `category` de
`TopCategoriesParams` porque ese endpoint no lo publica como parámetro.

### Verificación

Desde la raíz, en el contenedor `frontend`:

```bash
docker compose exec -T frontend ./node_modules/.bin/tsc --ignoreConfig --strict --noEmit --target ES2023 --moduleResolution bundler --module esnext specs/api-types.ts specs/param-types.ts
docker compose exec -T frontend ./node_modules/.bin/eslint specs/api-types.ts specs/param-types.ts
git diff --check
```

Los tres comandos terminaron sin errores. Se canceló el primer intento de
`npx tsc` desde la raíz porque `npx` ofreció instalar el paquete ajeno
`tsc@2.0.4`; el host tampoco tiene `frontend/node_modules/.bin/tsc`. El primer
intento en el contenedor indicó que TypeScript 6 requiere `--ignoreConfig`
cuando se especifican archivos directamente; el comando final lo añadió y
pasó. No se ejecutó el build de la aplicación: su `tsconfig.app.json` incluye
solo `src`, por lo que se verificaron los archivos de specs explícitamente con
el compilador estricto. No se modificó código de la aplicación ni se hizo push.

## Fase 6: especificación de componentes

Se creó `frontend/specs/components.md` con componentes, props enlazadas a los
tipos de la Fase 2, estados de carga/error/vacío, ubicación y comportamiento
responsive para las tres funcionalidades del PM.

Se resolvieron explícitamente estas brechas y decisiones antes de implementar:

- El backend calcula hoy el promedio de todos los períodos anteriores, no el
  promedio móvil de tres períodos solicitado. La spec requiere ajustar la
  semántica backend de `baseline_average` y conservar períodos previos como
  contexto cuando haya un filtro de fechas.
- `facets` es global y no filtra por negocio. Se usa como catálogo común; las
  filas disponibles para cada segmento salen de sus respuestas de top categorías.
- El endpoint de top categorías no retorna el total del grupo. Se consultan
  hasta 20 categorías (el union actual tiene cinco) para derivar denominador y
  porcentaje antes de mostrar las cinco principales.
- Se define una página recargable `/comparison`; el proyecto aún no tiene
  enrutador, por lo que la implementación deberá añadir navegación de rutas.

La validación de esta fase es documental: se contrastaron los componentes con
`App.tsx`, los componentes del dashboard, los tipos de la Fase 2 y los contratos
en `backend/app/routes.py`. No se modificó código de aplicación ni se ejecutaron
pruebas runtime. `git diff --cached --check` terminó sin errores y se comprobaron
las referencias locales a tipos y código. El primer `git add` falló porque se
usaron rutas desde la raíz mientras el terminal estaba en `frontend`; se repitió
con rutas relativas correctas. No se hicieron cambios de runtime ni push.

## Fase 7: README del contrato de datos

Se creó `frontend/specs/README.md` como handoff autónomo de las tres
funcionalidades. Documenta endpoints contrastados con `/docs`, tipos request y
response de TypeScript, valores y restricciones de query, estados de UI y al
menos dos casos límite por funcionalidad.

El README conserva explícitas las decisiones de `components.md`: media móvil de
tres períodos pendiente en backend, facetas globales sin filtro por negocio,
denominador de ingresos derivado de todas las categorías devueltas y ruta
`/comparison` pendiente de navegación.

### Verificación

Desde el contenedor `frontend`:

```bash
npx tsc --noEmit
```

El comando terminó con código 0 y sin errores de tipos. Esta fase solo modificó
documentación; no se ejecutaron pruebas runtime ni se conectaron endpoints.
`git diff --cached --check` pasó y se comprobaron con `test -f` los cuatro
enlaces locales a componentes, tipos y utilidades financieras.

## Restauración de estados y accesibilidad del dashboard

Se restauraron en `frontend/src/App.tsx` el anuncio de carga, la alerta y el
reintento ante errores, los encabezados de secciones y el cálculo de KPI,
período y series a partir de los movimientos recibidos. La petición se cancela
al desmontar el componente; no se usan datos de respaldo ante un fallo.
Se mantuvieron los cambios existentes en las gráficas, el título del documento
y las demás modificaciones del árbol de trabajo.

### Verificación

Como los servicios de Compose estaban detenidos y Vitest no estaba instalado en
el host, se ejecutó la imagen existente en un contenedor temporal con el código
montado en modo lectura y copiado dentro del contenedor:

```bash
docker run --rm -v /workspaces/ai-eng-financial-dashboard-context-project/frontend:/source:ro --workdir /app ai-eng-financial-dashboard-context-project-frontend sh -c 'cp -a /source/. /app/ && npm test -- src/App.test.tsx src/lib/financial-utils.test.ts && npm run build && npm run lint'
git diff --check
```

Pasaron 11 pruebas, el build y lint. La nueva prueba comprueba el HTML inicial
del estado de carga; no verifica el flujo de reintento en un navegador. Vite
advirtió que el bundle supera 500 kB minificado. No se realizó una auditoría
Lighthouse ni una prueba manual con teclado o lector de pantalla.

## Verificación de accesibilidad en navegador

Se ejecutó Chromium con Playwright y axe-core en un contenedor temporal,
con respuestas sintéticas interceptadas para probar datos y fallo de API sin
modificar servicios compartidos. Se verificó con Tab y Enter la apertura de las
dos tablas y el reintento tras un error 503; también se revisaron títulos,
estados ARIA y cinco iconos decorativos, que tienen `aria-hidden="true"`.

Axe no detectó infracciones WCAG 2 A/AA, 2.1 A/AA o 2.2 AA en los estados
de datos, tablas abiertas y error. Dejó el contraste de textos SVG y leyendas
para revisión manual. La medición de colores computados mostró inicialmente
3,14:1 en los ejes; se corrigieron las variables de color y se comprobó un
mínimo de 5,18:1 en 16 etiquetas de ejes y leyendas evaluadas.

Se repitieron 11 pruebas de frontend, build y lint en un contenedor temporal:
pasaron; el build mantuvo el aviso de bundle superior a 500 kB. No se probó
con un lector de pantalla real ni se ejecutó Lighthouse; estos resultados no
certifican conformidad WCAG completa.

## Rendimiento React y accesibilidad

Se revisó el dashboard con la skill `vercel-react-best-practices`, teniendo en
cuenta que usa Vite y no Next.js. Las dos gráficas se cargan mediante
`React.lazy` y `Suspense`: mantienen sus esqueletos durante la carga y cada una
tiene un límite de error independiente con aviso y opción de recargar la página.
La solicitud de datos sigue siendo independiente de la carga de las gráficas.
`formatPeriod` busca las fechas extremas en una pasada en vez de ordenar una
copia; la prueba nueva cubre un rango desordenado sin alterar la entrada.

Se exploraron `testing`, `performance` y `accessibility` con `npx skills find`.
Como skill adicional se reutilizó la copia local de
[`accessibility`](https://skills.sh/addyosmani/web-quality-skills/accessibility):
es pertinente para las transiciones nuevas de carga y error, y permite validar
que la optimización no dependa exclusivamente de señales visuales. La búsqueda
mostró aproximadamente 69.600 instalaciones y el repositorio de origen tenía
3.076 estrellas durante la consulta. También se aplicó su recomendación de
respetar movimiento reducido: los esqueletos dejan de animarse con esa preferencia.
No se instalaron ni incluyeron skills en el commit.

El HTML ya contiene idioma, título y viewport; Inter está declarada con fuentes
de respaldo del sistema, sin incorporar una descarga de fuentes. No se
introdujeron APIs exclusivas de Next.js ni se modificó el límite de advertencia.
El build inicial emitió un archivo JS principal de 587,63 kB (175,87 kB gzip)
y advirtió que superaba 500 kB. Tras los cambios, el archivo de entrada mide
188,45 kB (60,10 kB gzip), con imports estáticos adicionales de 40,76 y
1,20 kB; Recharts está en un chunk de 342,29 kB. Ya no aparece la advertencia.
Las gráficas siguen solicitándose al abrir el dashboard: dividir archivos no
demuestra una reducción equivalente de descarga total ni una mejora medida de
tiempos reales.

### Verificación

Desde la raíz, con Compose en ejecución:

```bash
docker compose exec -T frontend npm test
docker compose exec -T frontend npm run lint
docker compose exec -T frontend npm run build
git diff --check
```

Pasaron 12 pruebas, lint y build. El build generado se sirvió temporalmente
con `python -m http.server 4173 --directory frontend/dist --bind 127.0.0.1`
y se probó con Chromium, Playwright y axe usando datos sintéticos interceptados.
Se comprobó la carga diferida de ambas gráficas, los KPI, la apertura de una
tabla con teclado, un fallo de descarga de una gráfica y su recuperación con
el botón de recarga, y el reintento con teclado ante un error 503 de API.
Con `prefers-reduced-motion: reduce` se comprobó que la animación del esqueleto
es `none`. Axe no reportó infracciones en carga, datos y error de gráfica;
dejó una comprobación incompleta en cada uno de los dos últimos estados.
No se ejecutaron Lighthouse ni pruebas con lector de pantalla, ni se midieron
Web Vitals; la automatización no certifica conformidad WCAG completa.