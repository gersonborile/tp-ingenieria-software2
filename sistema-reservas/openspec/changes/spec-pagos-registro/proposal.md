## Why

Las reservas y los alquileres ya registran montos informativos, pero el club no tiene forma de registrar el cobro efectivo: no existe ninguna entidad ni endpoint de pago en el sistema. Este change introduce el **registro de pagos contra reservas**: un pago único por cada reserva confirmada, con ciclo de vida propio (pendiente/pagado/anulado), que solo el administrador puede registrar y que los socios pueden consultar sobre sus propias reservas. Sin este change, el club no puede llevar el control de qué reservas fueron cobradas.

## What Changes

- Nueva capacidad `payments` con módulo NestJS propio (`payments`).
- `POST /api/v1/reservas/:id/pagos` — registrar el pago de una reserva en estado `confirmed`. El cuerpo SHALL incluir `monto` (mayor a 0) y `metodoPago` (`efectivo` | `transferencia` | `tarjeta`), con `fecha` opcional (por defecto la fecha actual). Reserva inexistente → `404`; reserva no `confirmed` (`cancelled`) → `409`. Una reserva tiene a lo sumo un pago (segundo intento → `409`). Responde `201 Created`.
- Estados del pago: `pendiente` (al crearse), `pagado` (al confirmarse el cobro) y `anulado` (al anularse). `anulado` es terminal.
- `PATCH /api/v1/pagos/:id/pagar` — confirmar el cobro de un pago `pendiente`, pasándolo a `pagado` y registrando `fechaPago`. Pago inexistente → `404`; transición inválida → `409`. Responde `200 OK`.
- `PATCH /api/v1/pagos/:id/anular` — anular un pago en estado `pendiente` o `pagado`, pasándolo a `anulado`. Pago inexistente → `404`; pago ya `anulado` → `409`. Responde `200 OK`.
- `GET /api/v1/reservas/:id/pagos` — consultar el pago de una reserva. Los socios SHALL ver únicamente el pago de sus propias reservas; `admin`/`recepcionista` SHALL poder consultar el pago de cualquier reserva. Reserva inexistente → `404`; reserva sin pago → `404`.
- Permisos (JWT): registrar, confirmar y anular pagos son mutaciones reservadas **solo** al rol `admin` (`socio`/`recepcionista` → `403`). Las consultas requieren autenticación (`401` sin token) y respetan la titularidad: un `socio` que consulta el pago de una reserva ajena → `403`.
- Sin relación con el alquiler de equipamiento: los montos del alquiler (`rentals`) quedan fuera de este change; el pago cubre la reserva de cancha.

## Capabilities

### New Capabilities
- `payments`: registro de pago único por reserva confirmada (crear, confirmar cobro, anular y consultar) con ciclo de vida `pendiente`/`pagado`/`anulado` y permisos por rol (mutaciones solo `admin`).

### Modified Capabilities
- (none)

## Impact

- **Backend (NestJS)**: nuevo módulo `payments` (controller, service, repository sobre Prisma, DTOs con class-validator). Consume la entidad `Reservation` de `spec-reservas` en modo lectura para validar existencia y estado.
- **Base de datos (Prisma/PostgreSQL)**: nueva entidad `Payment` (tabla `payments`) con `id` UUID, FK a `reservations`, `monto`, `metodoPago`, estado y timestamps; unicidad: una reserva → a lo sumo un pago.
- **API contract**: nuevos endpoints `/api/v1/reservas/:id/pagos` (POST, GET) y `/api/v1/pagos/:id/pagar|anular` (PATCH); todos requieren autenticación JWT.
- **Dependencia**: requieren estar aplicadas las capacidades `user-auth` (roles/JWT) y `reservations` (entidad `Reservation`, estados `confirmed`/`cancelled`). Sin tocar `rentals` ni `equipment`.
- **Frontend (Next.js)**: pantalla de cobros para `admin` y consulta de estado de pago para `socio` en "mis reservas".
- **Testing**: unit tests de service (transiciones de estado, una-reserva-una-pago, montos, permisos) y e2e de los endpoints.
- **Rollback**: migración aditiva reversible (`prisma migrate`); no rompe contratos existentes. Equipos afectados: backend y frontend (nuevo contrato de API). Suposición: `recepcionista` no puede registrar pagos (solo `admin`), aunque sí consultar, coherente con el acceso que ya tiene sobre todas las reservas.