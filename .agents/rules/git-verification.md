# Cambios verificables e historial compartido

## Alcance

Preparacion, validacion y commits de cualquier cambio en este repositorio.

## Justificacion

Reescribir commits publicados en `main` puede provocar divergencias. Una
verificacion reproducible distingue los cambios probados de los pendientes.

## Guia

- Antes de editar, revisar `git status --short --branch`; conservar cambios ajenos.
- Hacer cambios coherentes con una sola tarea y revisar `git diff` antes de
  preparar archivos por nombre, evitando `git add .`.
- Ejecutar la prueba mas pequena que cubra el cambio. Para documentacion sola,
  revisar enlaces y comandos; si se cambian pruebas, ejecutarlas.
- Registrar comandos, resultados reales y limites en `verification.md`.
  Si falta una dependencia o falla un comando, indicar el fallo antes de corregirlo.
- Ejecutar `git diff --check` y revisar `git diff --cached` antes del commit.
- Usar un mensaje `<tipo>: <descripcion>` como los commits `docs:` y `feat:`
  existentes; usar `rules:` para esta fase. Crear el commit solo si se solicita.
- No enmendar commits publicados ni usar force-push sin autorizacion explicita.
  Si hay divergencia, explicar merge/rebase y obtener la eleccion antes de operar.
- Despues del commit, verificar `git status --short --branch` y el contenido del
  ultimo commit. Publicar con push solo cuando se solicite.

## Validacion pequena

Aplicar esta lista al commit dedicado de la fase 3 y comprobar que contiene solo
reglas, documentacion y pruebas relacionadas.
