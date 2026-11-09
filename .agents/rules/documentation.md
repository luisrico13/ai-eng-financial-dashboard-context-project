# Documentacion verificable y bilingue

## Alcance

`README.md`, `README.es.md`, `AGENTS.md` y `verification.md`.

## Justificacion

Los README describen el mismo proyecto en dos idiomas. Una ruta disponible en
FastAPI no implica que el dashboard la consuma.

## Guia

- Actualizar ambos README cuando cambien instrucciones de ejecucion, pruebas o
  capacidades compartidas; conservar el idioma de cada archivo.
- Indicar el directorio de trabajo y el entorno de cada comando. Los scripts npm
  viven en `frontend/package.json`, no en la raiz.
- Mantener el proxy `/api` como configuracion local por defecto. Documentar
  `VITE_API_BASE_URL` solo como alternativa para otro origen.
- Antes de afirmar que una funcion aparece en pantalla, comprobar su consumidor
  en `frontend/src/App.tsx`. Actualmente consume `GET /api/metrics` y calcula
  KPI y series mensuales en el cliente.
- Registrar en `verification.md` la tarea real, los comandos ejecutados, sus
  resultados y cualquier limitacion; no presentar propuestas como validaciones.

## Validacion pequena

Agregar instrucciones equivalentes de pruebas a ambos README, ejecutar los
comandos documentados y revisar que sus rutas y enlaces existan.
