# Stack tecnologico y entorno

Contexto revisado el 2026-11-09. Las versiones siguientes son rangos declarados
o etiquetas de imagen, no una medicion de las versiones instaladas en el host.

## Frontend

Fuente de dependencias y scripts: [package.json](../frontend/package.json).
Resoluciones npm versionadas en [package-lock.json](../frontend/package-lock.json).

| Area | Tecnologia |
| --- | --- |
| Lenguaje y UI | TypeScript `~6.0.2`, React/React DOM `^19.2.4`. |
| Desarrollo y build | Vite `^8.0.4`, plugin React, `tsc -b && vite build`. |
| Estilos y componentes | Tailwind CSS y plugin Vite `^4.2.2`, Recharts `^3.8.1`, Lucide React, `clsx`, `tailwind-merge`, `class-variance-authority`. |
| Calidad | ESLint 9 con plugins TypeScript/React; Vitest `^4.1.4` y proveedor de coverage V8. |

[vite.config.ts](../frontend/vite.config.ts) configura el alias `@` a `src`,
React, Tailwind y el proxy de desarrollo `/api` a `http://backend:8000`.
[App.tsx](../frontend/src/App.tsx) permite otro origen mediante
`VITE_API_BASE_URL`; no lo exige para el desarrollo con Compose.
El proxy de Vite es configuracion de desarrollo, no un despliegue de produccion.

## Backend

- Python; imagen `python:3.13-slim` en [Dockerfile](../backend/Dockerfile).
- FastAPI para rutas y validacion, Uvicorn para servir la aplicacion y debugpy
  para depuracion. Pytest, pytest-cov y httpx para pruebas:
  [requirements.txt](../backend/requirements.txt).
- Pydantic se usa para los modelos en [routes.py](../backend/app/routes.py);
  llega como dependencia de FastAPI, no esta declarado directamente en
  `requirements.txt`. Ese archivo no fija versiones.
- La aplicacion incluye el router desde [main.py](../backend/app/main.py).
  La fuente de movimientos es el generador en
  [routes.py](../backend/app/routes.py), no una base de datos configurada.

## Infraestructura y comandos

[docker-compose.yml](../docker-compose.yml) define dos servicios con montajes
del codigo local. El [Dockerfile del frontend](../frontend/Dockerfile) usa
`node:24-alpine` y arranca Vite; el
[Dockerfile del backend](../backend/Dockerfile) arranca Uvicorn con recarga y
debugpy. Es un entorno de desarrollo:

| Servicio | Puerto publicado |
| --- | --- |
| Frontend | 5173 |
| Backend y documentacion OpenAPI | 8000 (`/docs`) |
| Depurador Python | 5678 |

Desde la raiz del repositorio:

```bash
docker compose up --build
```

Con los servicios en ejecucion, comandos de pruebas documentados y ejecutados en
la fase de reglas, segun [verification.md](../verification.md):

```bash
docker compose exec -T frontend npm test -- src/lib/financial-utils.test.ts
docker compose exec -T backend python -m pytest tests/test_routes.py -q
```

Para build o lint del frontend estan disponibles `npm run build` y `npm run lint`
desde `frontend`, o mediante `docker compose exec -T frontend`. Su existencia en
el manifest no significa que se hayan ejecutado en esta fase documental.
Sin Compose, consultar los directorios y requisitos en
[README.es.md](../README.es.md#verificación).
