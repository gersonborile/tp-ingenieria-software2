## Context

Módulo nuevo `reservations` (ver proposal.md - Why). Aplica al stack definido en `openspec/config.yaml`: REST plano `/api/v1/`, DTOs con class-validator, guards JWT por rol, Prisma/PostgreSQL. La validación de stock consume la entidad `EquipmentItem` (tabla `equipment_items`) de `spec-equipamiento`; las canchas son entidad de dominio existente (`Court`) y la franja horaria es un slot fijo de 1 hora (no hay todavía módulo CRUD de canchas en los specs aprobados).

## Goals / Non-Goals

**Goals:**
- Crear reservas con validación de slot libre (misma cancha y franja) y stock de equipamiento atómica.
- Consulta de reservas con permiso por titularidad (`socio` = propias; admin/recepcionista = todas, filtrable).
- Cancelación respetando la ventana de 2 horas y liberación del stock.

**Non-Goals:**
- Endpoint de disponibilidad de canchas (consulta de slots libres) — queda para un future change de canchas/calendario. El POST es la fuente de verdad y devuelve `409` si el slot está ocupado.
- Edición de reservas (solo crear/consultar/cancelar).
- Pagos/facturación.

## Decisions

- **Modelo Prisma**:
  - `Reservation` (tabla `reservations`): `id` UUID, `memberId` FK → `Member`, `courtId` FK → `Court`, `startAt` `DateTime` (timestamptz, derivado de `date` + `startTime` en hora del club), `status` enum `CONFIRMED | CANCELLED`, `createdAt`.
  - `ReservationItem` (tabla `reservation_items`): `id` UUID, `reservationId` FK, `equipmentItemId` FK → `EquipmentItem`, `quantity` `Int > 0`. Un lote reservado es la suma de `quantity` de sus `ReservationItem`.
  - Index único `@@unique([courtId, startAt])` para que el slot no pueda duplicarse a nivel de BD (anti race condition).

- **Representación del slot**: se persiste `startAt`; `endAt` es implícito (`startAt + 1h`). El DTO recibe `date` + `startTime`; el service compone `startAt` y valida que `startTime` sea hora exacta dentro del horario del club. Alternativa considerada: persistir `date` + `startTime` por separado — descartada por complejidad en el overlap check.

- **Creación en una sola transacción (`$transaction`)**: verifica cancha, compone slot, inserta `Reservation` + `ReservationItem`, y descuenta stock. El descuento se hace con `updateMany({ where: { id, availableStock: { gte: quantity } }, data: { availableStock: { decrement: quantity } } })`; si la fila afectada es 0 → no hay stock → `409` y rollback. El overlap se detecta por el unique index → catch `P2002` → `409`.

- **Cancelación también transaccional**: actualiza `Reservation.status = CANCELLED` (solo si `status = CONFIRMED`) y libera stock con `availableStock: { increment: quantity }` por cada `ReservationItem`.

- **Ventana de cancelación**: la cancelación es válida si `startAt - now >= 2 horas`. Si está dentro de la ventana o la franja ya comenzó → `409`. Si la reserva ya está `CANCELLED` → `409`.

- **Permisos en el service**: el DTO/controller no decide titularidad; el service resuelve del token (JWT) el rol y el member asociado. `POST`: `socio` usa su propio member; `admin`/`recepcionista` pueden enviar `memberId`. `GET /mis`: `socio` ve solo su member; `admin`/`recepcionista` ven todos con `?memberId=` opcional. `PATCH cancelar`: `socio` solo si la reserva es suya (`reservation.memberId === mi member`), `admin`/`recepcionista` cancelan cualquiera. `403` en cualquier intento ajeno.

- **DTOs**: `CreateReservationDto` (`courtId` UUID, `date` ISO, `startTime` con `@Matches(/^([0-1]\d|2[0-3]):00$/)`, `memberId?`, `items?: { equipmentId, quantity }[]` con `quantity` min 1) y validación por pipe global. No se valida manualmente en services.

## Risks / Trade-offs

- [Carrera por el mismo slot] → Unique index `(courtId, startAt)` + `$transaction` + catch `P2002` → `409`.
- [Carrera por el mismo stock] → `updateMany` condicional atómico sobre `availableStock >= quantity`; 0 filas → `409` y rollback total.
- [Liberar stock al cancelar puede superar `totalStock` si el admin redujo `totalStock` después de la reserva] → El incremento se acota a `totalStock` (cap) al liberar; documentar en el apply.
- [Un socio puede no saber qué slots están libres (sin endpoint de disponibilidad)] → El frontend intenta el POST y muestra el `409` como "franja ocupada"; el change de canchas/calendario cubrirá el catálogo de disponibilidad.
- [`status` enum debe mantenerse en sync con el wire format] → Los estados viajan como string `confirmed`/`cancelled`; mapeo explícito en `@map`/ serializer.

## Migration Plan

1. Aplicar `spec-equipamiento` primero (requiere `EquipmentItem` para el stock).
2. Migración Prisma aditiva: `reservations`, `reservation_items`, unique `(courtId, startAt)`, FK a `equipment_items`.
3. Implementar módulo backend y publicar `/api/v1/reservas*`.
4. Consumir en frontend (flujo reserva, mis reservas, cancelar).
5. **Rollback**: revertir la migración (drop de `reservation_items`/`reservations`) y quitar endpoints; el stock de `equipment_items` queda sin cambios si no se implementó el descuento.

## Open Questions

- Cómo expone el frontend la disponibilidad de slots (se cubre en el future change de canchas/calendario; no cambia este spec ni las tareas de este change).