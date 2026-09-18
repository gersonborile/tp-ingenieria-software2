## Context

Módulo nuevo `rentals` (ver proposal.md - Why) que se apoya en `spec-equipamiento` (`EquipmentItem` + `pricePerUnit`) y `spec-reservas` (`Reservation` en estado `confirmed`). Se remueve el manejo de equipamiento de `POST /reservas`; el alquiler es la única vía. Montos informativos sin pagos (config del proyecto excluye facturación).

## Goals / Non-Goals

**Goals:**
- Crear el alquiler de una reserva confirmada con descuento atómico de stock y registro de montos congelados.
- Garantizar un único alquiler por reserva.
- Liberar el stock del alquiler al cancelar la reserva (dentro de la ventana de 2h ya definida).

**Non-Goals:**
- Devolución/cancelación independiente de un alquiler (se resuelve al cancelar la reserva).
- Procesar pagos ni emitir facturación (los montos son informativos).
- Editar un alquiler creado.

## Decisions

- **Modelo Prisma**:
  - `Rental` (tabla `rentals`): `id` UUID, `reservationId` FK unique → `Reservation`, `totalAmount` `Decimal(10,2)`, `createdAt`.
  - `RentalItem` (tabla `rental_items`): `id` UUID, `rentalId` FK, `equipmentItemId` FK → `EquipmentItem`, `quantity` `Int > 0`, `pricePerUnit` `Decimal(10,2)` (snapshot del catálogo), `totalAmount` `Decimal(10,2)`.
  - `EquipmentItem.pricePerUnit` (`Decimal(10,2)`, `>= 0`) en `equipment_items`. `@@unique([rentalId, equipmentItemId])` para no duplicar un equipamiento dentro del mismo alquiler.

- **Un alquiler por reserva**: unique en `Rental.reservationId` + catch `P2002` → `409`. Alternativa: check previo de existencia — descartada por race condition; el constraint lo garantiza en BD.

- **Tomar el precio**: al crear el alquiler, el service lee `pricePerUnit` vigente de cada `EquipmentItem` y lo persiste en `RentalItem` (snapshot). Esto mantiene el monto inmutable aunque el catálogo cambie. Se calcula `totalAmount` de cada item (`quantity * pricePerUnit`) y el total del alquiler como suma. Se usa `Decimal` de Prisma para evitar errores de punto flotante.

- **Flujo de creación transaccional (`$transaction`)**: valida reserva `confirmed` (404/409), chequea que no exista alquiler (unique index), y por cada item valida equipamiento existente (404) y descuenta con `updateMany({ where: { id, availableStock: { gte: quantity } }, data: { availableStock: { decrement: quantity } } })`; 0 filas → `409` y rollback. Inserta `Rental` + `RentalItem`s.

- **Liberación al cancelar la reserva**: el flujo de cancelación de `reservations` se extiende para incrementar `availableStock` de cada `RentalItem` del alquiler asociado (con cap en `totalStock`), dentro de la misma transacción que cambia el estado a `CANCELLED`.

- **Permisos** (mismo patrón que `reservations`): `@Roles(SOCIO, ADMIN, RECEPCIONISTA)` en el endpoint; el service valida que un `socio` solo alquile sobre reservas cuyo `memberId` coincida con su member (403), mientras `admin`/`recepcionista` pueden alquilar sobre cualquier reserva.

- **DTO**: `CreateRentalDto` con `items: { equipmentId, quantity }[]` (array no vacío, items sin repetir, `quantity` min 1). Validación con class-validator; el service no valida manualmente.

## Risks / Trade-offs

- [Carrera por el mismo stock entre alquileres] → `updateMany` condicional atómico + `$transaction`; 0 filas → `409`.
- [Cambio de `pricePerUnit` en catálogo entre pedido y persistencia] → El precio se lee y persiste dentro de la misma transacción (snapshot).
- [Liberar stock al cancelar puede superar `totalStock` si el admin lo redujo después] → El incremento se acota con cap en `totalStock`.
- [El REMOVED de `items` en `POST /reservas` es un cambio de contrato en curso] → Se coordina con `spec-reservas` (aún no archivado); se ajusta el DTO y la doc OpenAPI en el mismo release para no exponer el campo `items` nunca.
- [Si no se libera el alquiler al cancelar reserva, quedan reservas fantasma de stock] → La liberación es parte de la misma transacción de cancelación; cubierto por test e2e.

## Migration Plan

1. Aplicar antes: `spec-equipamiento` (con `pricePerUnit`) y `spec-reservas`.
2. Migraciones aditivas: columna `price_per_unit` en `equipment_items`; tablas `rentals` y `rental_items` con FKs y unique en `rental.reservation_id` y `(rental_id, equipment_item_id)`.
3. Implementar módulo `rentals`; ajustar `reservations` (quitar `items` del DTO de creación, liberar stock del alquiler en cancelación).
4. Frontend: flujo de alquiler sobre reserva y quitar items del formulario de reserva.
5. **Rollback**: revertir las migraciones (drop `rental_items`, `rentals`, columna de precio) y quitar el endpoint; el contrato de reservas queda como estaba en `spec-reservas` si el cambio se aborta antes de archivar.

## Open Questions

Ninguna que cambie specs, enfoque o tareas. El procesamiento de pagos queda fuera de este sistema (montos meramente informativos).