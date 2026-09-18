## Why

Los socios no pueden reservar canchas hoy: no existe una forma de crear, consultar ni cancelar reservas respetando la disponibilidad de horarios del club. Este change introduce la capacidad de **reservas** (crear, consultar las propias, cancelar) con las reglas de negocio clave: slots fijos de 1 hora, sin solapamiento en la misma cancha y ventana mínima de cancelación de 2 horas. Además, la reserva puede incluir equipamiento, consumiendo el stock de `spec-equipamiento` (valida, descuenta al crear y libera al cancelar).

## What Changes

- Nueva capacidad `reservations` con un módulo NestJS propio (`reservations`).
- Tres endpoints bajo `/api/v1/`:
  - `POST /api/v1/reservas` — crear una reserva. Autenticado (`socio` sobre sí mismo, o `admin`/`recepcionista` en nombre de cualquier socio). Valida que la cancha exista, que la fecha y la franja (slot fijo de 1 hora) sean válidas y estén **libres** (409 si está ocupada), y valida/descuenta el stock de equipamiento incluido (si hay stock insuficiente → 409 y no se crea). Responde `201 Created`.
  - `GET /api/v1/reservas/mis` — listar reservas del usuario autenticado. `socio` ve solo las suyas; `admin`/`recepcionista` pueden ver todas y filtrar por socio (`?memberId=`). Responde `200 OK`.
  - `PATCH /api/v1/reservas/:id/cancelar` — cancelar una reserva. `socio` cancela solo las propias; `admin`/`recepcionista` pueden cancelar cualquiera. Solo dentro de la ventana (≥ 2 horas antes del inicio); si la franja ya comenzó o está fuera de ventana → `409 Conflict`. Libera el stock de equipamiento reservado. Responde `200 OK`.
- Estados de reserva: `confirmed` (al crearla) y `cancelled` (al cancelarla).
- Una reserva puede incluir cero o más items de equipamiento; por cada item se valida `availableStock >= quantity` en la misma transacción.
- Sin manejo de pagos/facturación (fuera de alcance según config del proyecto).

## Capabilities

### New Capabilities
- `reservations`: ciclo de vida de reservas de canchas (crear, consultar las del usuario, cancelar) con slots fijos de 1 hora, prohibición de solapamiento, ventana de cancelación de 2 horas y descuento/liberación del stock de equipamiento definido en `spec-equipamiento`.

### Modified Capabilities
(none)

## Impact

- **Backend (NestJS)**: nuevo módulo `reservations` (controller, service, repository sobre Prisma, DTOs con class-validator). Consume la entidad `EquipmentItem` de `spec-equipamiento` para validar y ajustar `availableStock`.
- **Base de datos (Prisma/PostgreSQL)**: nuevas entidades `Reservation` (tabla `reservations`) y `ReservationItem` (tabla `reservation_items`, relación a `EquipmentItem`), más el estado `cancelled` en la reserva.
- **API contract**: nuevos endpoints `/api/v1/reservas*`; todos requieren autenticación JWT; validación de titularidad del recurso (socio sobre sus propias reservas).
- **Dependencia**: requiere la capacidad `equipment` (spec-equipamiento) aplicada para validar stock; si el módulo de equipamiento no está, el change queda bloqueado en la integración de stock (el resto del CRUD de reservas sin equipamiento puede avanzar).
- **Frontend (Next.js)**: pantallas de nueva reserva (cancha + horario + equipamiento), "mis reservas" y cancelación.
- **Testing**: unit tests de service (disponibilidad/overlap, ventana de cancelación, stock) y e2e de los tres endpoints.
- **Rollback**: migración reversible (`prisma migrate`); los endpoints son nuevos y no rompen contratos existentes (equipamiento solo se consume). Equipos afectados: backend y frontend (nuevo contrato de API).