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