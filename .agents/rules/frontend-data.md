# Datos financieros del frontend

## Alcance

`frontend/src/App.tsx`, `frontend/src/lib/financial-*` y los componentes del
dashboard que consuman esos datos.

## Justificacion

La API genera fechas relativas al presente. Un periodo fijo o un fixture usado
como sustituto silencioso puede mostrar informacion que no corresponde a la API.

## Guia

- Mantener `FinancialMovement` como contrato y reutilizar `computeKPIs`,
  `computeMonthlyData` y `formatPeriod`; no duplicar calculos en componentes.
- Derivar el periodo y las etiquetas de los movimientos recibidos, sin fijar el
  anio. Conservar el orden por anio y mes en series que crucen diciembre/enero.
- Para cambios en fechas o agregaciones, cubrir lista vacia, un solo mes y cruce
  de anio en `frontend/src/lib/financial-utils.test.ts`.
- Conservar la proteccion de porcentajes cuando no hay ingresos.
- Mantener visibles los estados de carga y error de `App.tsx`; no reemplazar un
  fallo de la API con `mockMovements`. Comprobar referencias antes de usar fixtures.
- Desde la raiz con Compose activo, ejecutar
  `docker compose exec -T frontend npm test -- src/lib/financial-utils.test.ts`.
  Si se cambia codigo de produccion, ejecutar tambien
  `docker compose exec -T frontend npm run build`.
  Sin Compose, usar los mismos scripts desde `frontend` con dependencias instaladas.

## Validacion pequena

Agregar una regresion para el periodo de un solo mes y para agregaciones vacias,
manteniendo las pruebas existentes de cruce de anio.
