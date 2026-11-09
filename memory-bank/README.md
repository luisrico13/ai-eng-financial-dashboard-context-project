# Banco de memoria: producto

## Proposito y fuentes

Contexto del repositorio basado en el codigo revisado el 2026-11-09, tomando como
base el commit `eac7765`. No es un roadmap ni sustituye las
[reglas de trabajo](../.agents/rules).

- [Stack y entorno](./tech-context.md).
- [Estado, limites y proximas decisiones](./current-state.md).
- [Registro de verificaciones](../verification.md).

Actualizar estos documentos cuando cambien sus fuentes. Distinguir siempre
implementacion observada, validacion ejecutada y propuesta pendiente de aprobar.
No convertir una dependencia instalada o una ruta de API en una promesa de producto.

## Overview verificable

Es un dashboard de metricas financieras con frontend React/TypeScript y backend
FastAPI, descrito en el [README del proyecto](../README.es.md).

| Capacidad implementada | Evidencia |
| --- | --- |
| Carga de movimientos mediante `GET /api/metrics`. | `fetchFinancialData` en [App.tsx](../frontend/src/App.tsx). |
| Cuatro KPI: ingresos, gastos, beneficio y margen de beneficio. | [KPIRow](../frontend/src/components/dashboard/kpi-row.tsx) y `computeKPIs` en [financial-utils.ts](../frontend/src/lib/financial-utils.ts). |
| Graficos de ingresos/gastos y porcentaje de beneficio por mes. | Componentes conectados a `monthlyData` en [App.tsx](../frontend/src/App.tsx). |
| Periodo calculado desde los movimientos; estados de carga y error. | `formatPeriod` en [financial-utils.ts](../frontend/src/lib/financial-utils.ts) y estado en [App.tsx](../frontend/src/App.tsx). |
| API adicional de facetas, resumen, categorias, comparacion, alertas y segmentos B2B/B2C. | Rutas en [routes.py](../backend/app/routes.py); no consumidas por la pantalla actual de [App.tsx](../frontend/src/App.tsx). |

## Datos y calculos

- Los endpoints de metricas generan datos sinteticos con semilla `42`, no leen
  movimientos de una entidad financiera. `generate_mock_movements` crea 30
  movimientos por mes (360 en total) con fechas relativas al mes y anio actuales:
  [routes.py](../backend/app/routes.py).
- Cada movimiento contiene `create_date`, `amount`, `operation_type`, `category`
  y `business_type`: contrato Python en [routes.py](../backend/app/routes.py) y
  TypeScript en [financial-types.ts](../frontend/src/lib/financial-types.ts).
- El beneficio es ingresos menos gastos; el margen es beneficio/ingresos por
  100, o cero sin ingresos. Las series se agrupan por anio y mes; el formato de
  moneda usa `en-US` y USD: [financial-utils.ts](../frontend/src/lib/financial-utils.ts).
  Ese formato no demuestra conversion de divisas ni contabilidad multidivisa.

## Limites de las afirmaciones

No presentar los datos como datos bancarios reales, ni las alertas del backend
como notificaciones visibles del dashboard. No se afirma que el producto este
listo para produccion, tenga un despliegue publico validado o incluya un roadmap
aprobado: las fuentes anteriores no acreditan esas afirmaciones.
