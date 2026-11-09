# Estado actual y decisiones pendientes

Revision documental: 2026-11-09, codigo base `eac7765`. Esta instantanea debe
actualizarse con evidencia nueva; no representa disponibilidad continua del servicio.

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
3. **Validacion visual no acreditada.** El registro de la fase de reglas
   acredita utilidades y contratos HTTP, no interacciones de navegador:
   [verification.md](../verification.md).
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

1. **Verificar la experiencia en navegador:** carga, error y renderizado de KPI
   y graficos, para complementar las pruebas de utilidades y API ya registradas.
2. **Revisar la deprecacion de TestClient:** reproducir el aviso y evaluar una
   actualizacion compatible con FastAPI/Starlette antes de cambiar dependencias.
3. **Acordar el siguiente alcance funcional:** decidir si se integrara alguna
   ruta adicional o una fuente real. Su existencia o conveniencia no constituye
   un compromiso de producto, una fecha de entrega ni una tarea autorizada.

## Mantenimiento

Al cerrar una tarea, actualizar solo los hechos afectados, enlazar codigo o
resultados verificables y retirar afirmaciones obsoletas. Mantener las propuestas
separadas de lo implementado y no registrar secretos ni datos personales aqui.
