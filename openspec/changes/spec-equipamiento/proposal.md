## Why

El club ofrece equipamiento (paletas, pelotas, raquetas, etc.) que los socios necesitan para jugar, pero hoy no hay forma de conocer el catálogo disponible ni su stock. Sin un catálogo con stock controlado no se puede garantizar que una reserva con equipamiento se cumpla. Este change introduce la capacidad de **equipamiento** como módulo autónomo: catálogo + manejo de stock, dejando preparado el contrato para que el change de reservas consuma el stock (validación/descuento) cuando se integre.

## What Changes

- Nueva capacidad `equipamiento` con un módulo NestJS propio (`equipment`).
- CRUD completo de items de equipamiento bajo `/api/v1/equipamiento`:
  - `GET /api/v1/equipamiento` — listar catálogo con stock disponible y total.
  - `GET /api/v1/equipamiento/:id` — detalle de un item.
  - `POST /api/v1/equipamiento` — crear item (solo admin).
  - `PATCH /api/v1/equipamiento/:id` — actualizar datos del item (solo admin).
  - `PATCH /api/v1/equipamiento/:id/stock` — ajustar stock total y disponible (solo admin/recepcionista).
- Modelo de stock por unidad por item: `totalStock` y `availableStock`, donde `availableStock` nunca supera a `totalStock` ni es negativo.
- Se expone `availableStock` en el API para que el change de reservas consuma disponibilidad (integración futura, fuera de este change). Al cancelar/descargar equipamiento en reservas, el stock disponible se libera — validación en el change de reservas.
- Sin manejo de pagos/facturación (fuera de alcance según config del proyecto).

## Capabilities

### New Capabilities
- `equipment`: catálogo de equipamiento del club con stock total y disponible por item, y operaciones CRUD protegidas por rol (lectura autenticada, escritura solo admin, ajuste de stock admin/recepcionista).

### Modified Capabilities
(none)

## Impact

- **Backend (NestJS)**: nuevo módulo `equipment` (controller, service, repository sobre Prisma, DTOs con class-validator).
- **Base de datos (Prisma/PostgreSQL)**: nueva entidad `EquipmentItem` (tabla `equipment_items`) con campos de catálogo y stock.
- **API contract**: nuevos endpoints `/api/v1/equipamiento*`; todos requieren autenticación JWT; escritura/admin con guards de rol.
- **Frontend (Next.js)**: páginas de catálogo de equipamiento y gestión de stock (admin/recepcionista).
- **Testing**: unit tests de service de equipamiento (stock, permisos) y e2e de los endpoints.
- **Rollback**: versionado en `/api/v1` y migración Prisma reversible (`prisma migrate`); el módulo es aditivo, no modifica endpoints existentes de reservas. Los equipos afectados son backend y frontend (nuevo contrato de API).