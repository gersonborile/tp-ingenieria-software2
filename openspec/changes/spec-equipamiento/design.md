## Context

Módulo nuevo `equipment` en el backend NestJS existente (ver proposal.md - Why). Aplica al stack definido en `openspec/config.yaml`: monorepo Next.js + NestJS + PostgreSQL/Prisma, REST plano en `/api/v1/`, DTOs con class-validator, guards JWT por rol. El change de reservas es un consumidor futuro de `availableStock` (fuera de este change). No hay hoy ninguna entidad de equipamiento en el schema de Prisma.

## Goals / Non-Goals

**Goals:**
- CRUD completo de items de equipamiento cumpliendo los invariantes de stock `0 <= availableStock <= totalStock`.
- Permisos por rol: lectura autenticada (cualquier rol), escritura y eliminación solo `admin`.
- Exponer `availableStock` en el contrato para que el change de reservas lo consuma sin cambios de schema.

**Non-Goals:**
- Reservar/descontar stock desde este módulo (lo hace el change de reservas).
- Facturación/precios.
- CRUD de categorías (la categoría es texto libre normalizado).

## Decisions

- **Modelo Prisma `EquipmentItem`** (tabla `equipment_items`): `id` UUID, `name` (unique), `description`, `category`, `totalStock` y `availableStock` como `Int` no negativos. Mapeo `@map`/`@@map` a `snake_case`. No hay relación con `Reservation` todavía; el stock se lleva como columna escalar.

- **Estructura del módulo**: `EquipmentModule` con `EquipmentController`, `EquipmentService` y `EquipmentRepository` delgado sobre Prisma, siguiendo el patrón establecido (repositorio delgado, lógica en services). Preferido sobre lógica en controller o repository grueso por consistencia con el resto del código.

- **Validación de invariantes en el service**: `EquipmentService` es el único punto que escribe stock (`create` con `availableStock = totalStock`, `update` de reemplazo completo con validación previa de `0 <= availableStock <= totalStock`). Alternativa considerada: triggers de PostgreSQL — descartada por mantener el invariante en una sola capa de negocio testeable.

- **Unicidad de `name`**: constraint único en Prisma + catch del error `P2002` mapeado a `409 Conflict`. Alternativa: query previa de existencia — descartada por race conditions.

- **Roles**: `JwtAuthGuard` global + `RolesGuard` con decorador `@Roles()`. Lectura sin `@Roles()` (cualquier rol autenticado); `POST`, `PUT` y `DELETE` con `@Roles(Role.ADMIN)`.

- **Perfiles de endpoints**:
  - `GET /api/v1/equipamiento` → `200` con un array plano (sin envelope) con todos los items del catálogo y su stock.
  - `POST /api/v1/equipamiento` → `201` con item creado (DTO: `name`, `description`, `category`, `totalStock`; `availableStock = totalStock`).
  - `PUT /api/v1/equipamiento/:id` → `200` con reemplazo completo del item (DTO: `name`, `description`, `category`, `totalStock`, `availableStock`), validando el invariante en el DTO y de nuevo en el service (defensa en profundidad). `404` si no existe.
  - `DELETE /api/v1/equipamiento/:id` → `204 No Content` (hard delete) o `404` si no existe.

- **Integración futura con reservas**: el cambio conserva `availableStock` como fuente de verdad escalar; el change de reservas deberá descontar/liberar dentro de transacciones Prisma. Se deja documentado para que ese change lo diseñe con lock/transacción.

## Risks / Trade-offs

- [Actualizaciones concurrentes de stock pueden correr el invariante] → Los write paths pasan por un único service que valida antes de persistir; para el futuro descontar por reservas se usará transacción Prisma con re-check del stock dentro de la misma.
- [`availableStock` escalar puede divergir del estado real de reservas en el futuro] → Este change solo expone lectura; el change de reservas será responsable de mantenerlo atómico. Mitigación a futuro: derivarlo de `ReservationItem` (normalizado) o ajustarlo transaccionalmente.
- [Texto de categoría libre puede duplicar categorías ("Paletas" vs "paletas")] → Normalización a lowercase/trim en DTO; no se modela entidad Category en esta fase.
- [Contrato API nuevo + frontend] → El backend expone primero el contrato; el frontend lo consume luego; sin breaking changes sobre endpoints existentes.

## Migration Plan

1. Crear modelo `EquipmentItem` con migración Prisma aditiva (`prisma migrate dev --name add_equipment_items`).
2. Implementar módulo backend y publicar `/api/v1/equipamiento*`.
3. Consumir en frontend (páginas de catálogo y gestión).
4. **Rollback**: revertir la migración (drop de `equipment_items` y endpoints). Es aditivo; no afecta a `reservas` ni a otros contratos existentes.

## Open Questions

Ninguna que cambie specs, enfoque o tareas. La integración con reservas (descuento/liberación de stock) se resuelve en su propio change.