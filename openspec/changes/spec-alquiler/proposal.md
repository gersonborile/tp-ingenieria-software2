## Why

El equipamiento dentro de `POST /reservas` mezcla reservar una cancha con alquilar equipamiento: dos reglas de negocio distintas (disponibilidad de franja vs stock y montos). Este change separa el **alquiler de equipamiento** como concepto propio asociado a una reserva ya confirmada: `POST /reservas/:id/alquiler` es la única vía para alquilar equipamiento, registra los montos informativos (sin pagos) tomados del nuevo `pricePerUnit` del catálogo, y libera stock al cancelar la reserva.

## What Changes

- Nueva capacidad `rentals` con módulo NestJS propio (`rentals`).
- `POST /api/v1/reservas/:id/alquiler` — crea el alquiler de una reserva existente en estado `confirmed`. Valida que la reserva exista (404), no esté cancelada (409), que el equipamiento exista (404) y que haya stock suficiente (409); descuenta el stock en la misma operación. Una reserva tiene a lo sumo un alquiler (el segundo intento → 409). Responde `201 Created` con items, cantidades y montos.
- **BREAKING (contrato en curso)**: `POST /api/v1/reservas` deja de aceptar el campo `items` (equipamiento); la cancelación de una reserva libera el stock **del alquiler asociado**, no de items del POST.
- `equipment`: los items del catálogo suman `pricePerUnit` (precio de alquiler por unidad, `>= 0`), requerido en catálogo, alta y actualización. El alquiler calcula `totalAmount` por item (pricePerUnit × quantity) y total.
- Montos informativos: no hay endpoints ni entidades de pago/facturación (fuera de alcance según config del proyecto).

## Capabilities

### New Capabilities
- `rentals`: alquiler de equipamiento asociado a una reserva confirmada (creación con validación y descuento de stock, montos calculados del catálogo, un alquiler por reserva).

### Modified Capabilities
- `reservations`: se remueve el requisito "Equipamiento dentro de la reserva" (el equipamiento se alquila en `POST /reservas/:id/alquiler`); se modifica "Creación de reservas" (sin campo `items`) y "Cancelación de reservas" (libera el stock del alquiler asociado).
- `equipment`: se agrega el campo `pricePerUnit` al catálogo, requerido en alta/actualización y expuesto en las respuestas.

## Impact

- **Backend (NestJS)**: nuevo módulo `rentals` (controller, service, repository). Ajustes en `reservations` (DTO sin `items`; cancelación libera stock del alquiler). `equipment` suma la columna `pricePerUnit`.
- **Base de datos (Prisma/PostgreSQL)**: nuevas tablas `rentals` y `rental_items` (FK a `reservations` y `equipment_items`, precio snapshot por item); columna `price_per_unit` en `equipment_items`.
- **API contract**: nuevo `POST /api/v1/reservas/:id/alquiler` (autenticado; socio solo sobre su reserva, admin/recepcionista sobre cualquiera). `POST /reservas` pierde `items`. `GET /reservas/mis` expone el alquiler asociado a la reserva.
- **Frontend (Next.js)**: flujo de alquiler sobre una reserva (selección de equipamiento + montos), ajuste del formulario de nueva reserva (sin items).
- **Testing**: unit tests (stock, montos, un-alquiler-por-reserva, permisos, liberación al cancelar) y e2e del endpoint.
- **Rollback**: migración aditiva reversible; el contrato "en curso" se ajusta antes de que las specs estén archivadas (aún sin implementar). Equipos afectados: backend y frontend (cambio de contrato en `POST /reservas`).

## Dependencies

- Requiere aplicar `spec-equipamiento` (para `EquipmentItem` y `pricePerUnit`) y `spec-reservas` (para `Reservation`).