# Estado actual y decisiones pendientes

Revision documental: 2026-11-09, codigo base `eac7765`. Esta instantanea debe
actualizarse con evidencia nueva; no representa disponibilidad continua del servicio.

## Actualizacion: skills y QA financiero

- Se aplicaron `vercel-react-best-practices` y
  [`accessibility`](https://skills.sh/addyosmani/web-quality-skills/accessibility).
  Se eligio accesibilidad para complementar el rendimiento con estados de carga,
  error y movimiento reducido. Las busquedas cubrieron `testing`, `performance`
  y `accessibility`; los archivos de las skills comunitarias siguen locales.
- La carga diferida de las graficas, los estados de error y la busqueda del
  periodo en una pasada se verificaron con build, lint, 12 pruebas y navegador,
  con los limites y cifras registrados en
  [verification.md](../verification.md#rendimiento-react-y-accesibilidad).
- Se creo la skill interna
  [dashboard-financial-qa](../.skills/dashboard-financial-qa/SKILL.md) para
  contrastar contrato, KPI, periodo, tablas y estados con datos sinteticos.
  Su guia se leyo y aplico manualmente en una tarea real. Tiene una
  [entrada de descubrimiento](../.github/skills/dashboard-financial-qa/SKILL.md)
  para Copilot; su carga automatica no esta verificada en esta sesion.
- **Hallazgo pendiente:** en la prueba de navegador, una fecha ISO del primer
  dia de enero se agrupo en diciembre con zona `America/Bogota`, aunque el
  encabezado y los KPI coincidieron. En UTC las tablas coincidieron. No se ha
  corregido; la reproduccion y sus limites estan en
  [verification.md](../verification.md#skill-interna-y-qa-del-dashboard).

## Implementado y validado

| Estado | Evidencia y alcance |
| --- | --- |
| Pantalla conectada a `/api/metrics`, KPI, periodo y dos graficos. | Integracion observada en [App.tsx](../frontend/src/App.tsx); no se realizo una prueba visual de navegador en esta fase. |
| Calculos y formatos del frontend cubiertos por 10 pruebas aprobadas en la fase de reglas. | [financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts) y resultados en [verification.md](../verification.md#fase-3-reglas-implementadas-y-probadas): totales, ausencia de ingresos, listas vacias, periodo de un mes y cruce de anio. |
| Backend cubierto por 20 pruebas aprobadas en la fase de reglas. | [test_routes.py](../backend/tests/test_routes.py) y [verification.md](../verification.md#fase-3-reglas-implementadas-y-probadas): salud, filtros, segmentos, resumen y otras respuestas de metricas, incluidos filtros invalidos y un intervalo sin datos. No implica cobertura exhaustiva de todas las ramas. |
| Cuatro reglas de trabajo y comandos de pruebas documentados. | [AGENTS.md](../AGENTS.md), [reglas](../.agents/rules), [README](../README.es.md) y [registro de verificaciones](../verification.md). |

No se repitieron pruebas de aplicacion en esta fase: solo se anade documentacion.
Los resultados anteriores se atribuyen a la fase de reglas, no a una nueva ejecucion.

## Gaps conocidos y limites

1. **Datos sinteticos.** Las rutas llaman a `generate_mock_movements(seed=42)`;
   no existe una integracion de datos reales en ese flujo:
   [routes.py](../backend/app/routes.py).
2. **API mas amplia que la UI.** Facetas, resumen, categorias, comparacion,
   alertas y segmentos B2B/B2C existen en el
   [backend](../backend/app/routes.py), pero [App.tsx](../frontend/src/App.tsx)
   solo consulta `/api/metrics` sin parametros de filtro. No atribuir esos
   controles o vistas al dashboard actual.
3. **Validacion visual parcial.** Las comprobaciones posteriores incluyeron
   navegador y teclado con datos sinteticos, pero no lector de pantalla real;
   existe la discrepancia de zona horaria descrita arriba:
   [verification.md](../verification.md#skill-interna-y-qa-del-dashboard).
4. **Advertencia en las pruebas del backend.** La ejecucion registrada emitio
   una deprecacion de Starlette sobre el uso de httpx en `TestClient`; las
   pruebas pasaron. No se modificaron dependencias:
   [verification.md](../verification.md).
5. **Entorno de desarrollo, no prueba de produccion.** Vite, recarga de Uvicorn y
   debugpy son los procesos configurados en los
   [Dockerfiles](./tech-context.md#infraestructura-y-comandos).
   No se ha verificado un despliegue productivo en esta fase.

## Proximas prioridades propuestas, no roadmap aprobado

No se identifico una lista de prioridades aprobada en las fuentes de esta
revision. El siguiente orden es una recomendacion tecnica basada en los gaps
anteriores; requiere confirmacion antes de implementar:

1. **Corregir y verificar la agrupacion por zona horaria:** reproducir el caso
   del primer dia del mes y comprobar que las fechas de calendario conservan
   su mes sin depender de la zona local.
2. **Revisar la deprecacion de TestClient:** reproducir el aviso y evaluar una
   actualizacion compatible con FastAPI/Starlette antes de cambiar dependencias.
3. **Acordar el siguiente alcance funcional:** decidir si se integrara alguna
   ruta adicional o una fuente real. Su existencia o conveniencia no constituye
   un compromiso de producto, una fecha de entrega ni una tarea autorizada.

## Mantenimiento

Al cerrar una tarea, actualizar solo los hechos afectados, enlazar codigo o
resultados verificables y retirar afirmaciones obsoletas. Mantener las propuestas
separadas de lo implementado y no registrar secretos ni datos personales aqui.
