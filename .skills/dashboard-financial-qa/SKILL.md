---
name: dashboard-financial-qa
description: Verifica la coherencia de movimientos, periodo, KPI y tablas del dashboard financiero, incluidos estados de carga y error.
---

# QA del dashboard financiero

## Objetivo

Detectar discrepancias entre la respuesta de `GET /api/metrics` y el periodo,
los KPI y las series que muestra este dashboard. Usar esta skill al modificar o
validar la carga de movimientos, fechas, agregaciones o estados de la pantalla.
Complementa las reglas de frontend y las skills generales de React y
accesibilidad; no las sustituye.

## Entradas

- El cambio o flujo que se quiere verificar y su alcance.
- El estado de Git, las reglas de `.agents/rules` y `memory-bank/current-state.md`.
- `frontend/src/App.tsx`, `frontend/src/lib/financial-types.ts`,
  `frontend/src/lib/financial-utils.ts` y las pruebas relacionadas.
- Opcionalmente, un navegador disponible y datos sinteticos de prueba. No usar
  ni registrar informacion financiera real.

## Procedimiento

1. Identificar la fuente y el consumidor: la pantalla consulta
   `/api/metrics`; no atribuirle otras rutas del backend ni reemplazar fallos
   con `mockMovements`. Revisar el contrato antes de suponer campos o formatos.
2. Seleccionar pruebas segun el cambio. Para fechas o agregaciones, cubrir
   lista vacia, un mes, diciembre/enero, fechas del primer dia del mes y ausencia
   de ingresos. Comparar fechas ISO de calendario en UTC y una zona horaria
   occidental; el mes no debe cambiar segun la zona del navegador.
3. Calcular expectativas de forma independiente: ingresos y gastos son la suma
   de sus movimientos; beneficio es ingresos menos gastos; margen es
   beneficio/ingresos por 100, o cero sin ingresos. Comparar tambien el periodo,
   el orden por anio y mes y los valores de las tablas con el mismo conjunto
   sintetico. Usar el formato USD/en-US existente; no inferir conversiones.
4. Verificar los estados afectados. En navegador, cuando este disponible,
   comprobar carga, datos, error de API y reintento; para cambios en carga
   diferida, comprobar tambien el fallo y recuperacion de una grafica. Si se
   intercepta la API, limitarlo al contexto de prueba y no alterar el servicio
   compartido. Si no hay navegador, indicar que la UI no fue verificada.
5. Desde la raiz con Compose activo, ejecutar la prueba pertinente:

   ```bash
   docker compose exec -T frontend npm test -- src/lib/financial-utils.test.ts src/App.test.tsx
   ```

   Si se modifica codigo de produccion, ejecutar tambien
   `docker compose exec -T frontend npm run build`. Si se modifica el contrato
   backend, aplicar la regla correspondiente y ejecutar sus pruebas. Sin Compose,
   ejecutar los scripts desde `frontend` con dependencias ya instaladas.
6. Documentar comandos, escenarios, resultados y limites en `verification.md`.
   Registrar un fallo como fallo; no convertir un test no ejecutado en aprobado.

## Salida esperada

Un resumen con alcance, fuente de datos, valores esperados y observados,
comandos y resultados, hallazgos con archivo relevante y limites de la prueba.
Separar defectos observados de recomendaciones y de trabajo no ejecutado.

## Criterios de aceptacion

- Los KPI, periodo y tablas coinciden con los movimientos de cada escenario
  probado; las fechas de calendario conservan su mes en ambas zonas horarias.
- El estado vacio no se confunde con error; un fallo no muestra datos ficticios
  como si provinieran de la API y permite reintentar.
- Los comandos aplicables pasan y las comprobaciones sin ejecutar se declaran.
  Si se detecta una discrepancia, describir la reproduccion y no afirmar que
  el escenario paso.
