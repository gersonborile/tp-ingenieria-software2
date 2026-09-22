## Context

El módulo Canchas + seed de Disciplinas está diseñado en `canchas-crud` (ver proposal.md — Why): backend NestJS en `/backend`, PostgreSQL + Prisma, IDs UUID, validación con `class-validator`, errores estándar de Nest, guard de autorización como seam (`@Roles('admin')` + `AuthzGuard` + `AuthPrincipalProvider`). Este diseño define el módulo `Equipamiento` sobre esa base: cada ítem referencia una `Disciplina` existente y las mutaciones reutilizan el mismo seam de auth.

## Goals / Non-Goals

**Goals:**
- Modelo Prisma `Equipamiento` con `id`, `nombre`, `disciplina_id` (FK), `stock` y `activo`, manteniendo coherencia con `disciplinas`.
- API pública de consulta del catálogo (listado con filtros y detalle) sin autenticación, con disponibilidad derivada del stock.
- Mutaciones admin-only (crear/modificar/eliminar) con validación de nombre, disciplina existente y stock no negativo.
- Comportamiento 401/403 verificable por tests antes de que `auth-registro-login` se integre.
- Seam para el chequeo de "ítem con préstamo activo" al eliminar, listo para el futuro cambio de préstamos.

**Non-Goals:**
- Implementar préstamos/alquileres de equipamiento ni el descuento de stock ligado a ellos (otro cambio; este deja el seam). Implementar el mecanismo de auth en sí. Frontend, reservas, pagos.

## Decisions

- **Modelo `Equipamiento` sin flag `disponible` persistido**: `id`, `nombre`, `disciplina_id`, `stock` (Int, default `0`), `activo` (Boolean, default `true`). La disponibilidad se computa en el servicio como `disponible = stock > 0`. Alternativa considerada (siguiendo el patrón de `Turno`): persistir un flag `disponible`. Se descarta porque aquí el `stock` ya es la fuente de verdad persistida y `disponible` es una derivación determinística, evitando estado redundante y desincronización; el contrato del spec (`disponible` en toda respuesta) se cumple computándolo. El futuro cambio de préstamos sumará un contador `prestado` y redefinirá `disponible = stock - prestado > 0`.
- **`disponible` como campo computado y filtrable**: en el query de listado, el filtro `disponible=true` se traduce a `stock > 0` en la cláusula `where` de Prisma en lugar de filtrar en memoria. Alternativa considerada: filtrar la lista en el servicio tras el fetch — descartada por ineficiencia y por mantener los filtros en la query con paginación correcta.
- **Borrado con seam para préstamos activos**: al `DELETE /equipamiento/:id` se consulta un provider inyectado (`PrestamosProvider`) que expone si el ítem tiene préstamos activos; hoy retorna `false` (no existe el modelo) y el cambio de préstamos implementará la consulta real. Un ítem sin préstamos activos se elimina físicamente (`204`). Alternativa considerada: baja lógica vía `activo = false` — se mantiene disponible como operación (spec "Desactivar un ítem") pero no reemplaza el borrado físico requerido por el spec.
- **Endpoints y filtros** (módulo `Equipamiento` en `backend/src/equipamiento`, controller REST):
  - `GET /equipamiento` — público; query params opcionales `disciplina_id`, `disponible` (`true` → solo `stock > 0`), `incluir_inactivos` (default `false`), con paginación `page`/`limit` igual que en canchas.
  - `GET /equipamiento/:id` — público; `404` si no existe.
  - `POST /equipamiento`, `PATCH /equipamiento/:id`, `DELETE /equipamiento/:id` — `@Roles('admin')` + `AuthzGuard` (mismo seam que canchas).
- **Códigos de error** reutilizando el formato estándar de Nest: `400` datos inválidos/faltantes (validación de DTO), `404` no encontrado, `409` ítem con préstamo activo, `422` referencia a disciplina inexistente, `401` no autenticado, `403` no autorizado.
- **DTOs con `class-validator`**: `CrearEquipamientoDto` (`nombre` `IsString` + `IsNotEmpty`, `disciplina_id` `IsUUID`, `stock` `IsInt` + `Min(0)` opcional con default `0`) y `ActualizarEquipamientoDto` (Campos parciales, mismas validaciones). La existencia de la disciplina se valida en el servicio (query) para responder `422`.
- **Seed / datos**: no hay seed nuevo; los ítems los crea el administrador vía API.

## Risks / Trade-offs

- [Auth aún no implementada] → Mismo provider tipado como seam que en canchas; tests e2e con un provider de prueba verifican 401/403.
- [Contrato futuro de préstamos afecta `disponible`] → Se documenta que el cambio de préstamos decrementa `prestado` y redefine `disponible = stock - prestado > 0`; hoy `disponible = stock > 0` cumple el spec.
- [Filtros `disciplina_id` sin validar formato] → El DTO del query valida `disciplina_id` como UUID; inválida responde 400.
- [`incluir_inactivos` expone ítems descontinuados] → Solo lectura pública con flag explícito; las mutaciones y la activación/desactivación quedan admin-only.
- [Borrado físico sin préstamos aún] → El seam `PrestamosProvider` centraliza la futura regla; el 409 del spec se hace verificable con un provider de prueba.

## Migration Plan

- `prisma migrate dev --name equipamiento` para crear la tabla `Equipamiento` y su FK a `Disciplina`.
- Rollback: revertir el PR; al no haber préstamos, eliminar la tabla (o revertir la migración) no deja datos huérfanos.

## Open Questions

- Ninguna que requiera decisión ahora: la forma exacta en que los préstamos descuentan stock pertenece al futuro cambio de préstamos y no cambia este spec.