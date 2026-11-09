# Contratos y filtros de la API

## Alcance

`backend/app/routes.py`, `backend/app/main.py` y `backend/tests`.

## Justificacion

El dashboard depende del contrato de movimientos; otras rutas ofrecen funciones
que aun no consume. Los datos generados cambian de fechas con el calendario.

## Guia

- Para cada cambio de ruta, identificar su consumidor; `App.tsx` solo consulta
  `/api/metrics`. No conectar otros endpoints sin una tarea que lo requiera.
- Conservar los modelos Pydantic, los `Literal` y las restricciones `Query`
  existentes. Probar entradas invalidas con estado 422, no con respuestas 200 vacias.
- Reutilizar `filter_movements`, `filter_movements_by_date` y
  `ensure_chronological_order` para los endpoints de movimientos.
- Probar filtros inclusivos y combinados, claves de respuesta y resultados vacios.
  Derivar fechas de los datos generados o fijarlas en una fixture de prueba;
  no depender de que un anio fijo tenga movimientos.
- Usar `TestClient` y las convenciones de `backend/tests/test_routes.py`.
  Desde la raiz con Compose activo, ejecutar
  `docker compose exec -T backend python -m pytest tests/test_routes.py -q`.
  Sin Compose, ejecutar `python -m pytest tests/test_routes.py -q` desde
  `backend` con sus dependencias instaladas.

## Validacion pequena

Agregar pruebas de `/api/metrics` para filtros invalidos y un intervalo sin datos;
verificar el contrato sin modificar el endpoint.
