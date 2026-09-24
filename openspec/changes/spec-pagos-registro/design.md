## Context

Módulo nuevo `payments` (ver proposal.md - Why) que se apoya en `user-auth` (roles JWT) y `spec-reservas` (`Reservation` en estado `confirmed`). Las reservas no tienen precio de cancha; el `monto` del pago lo provee el `admin` al registrarlo. Los montos del alquiler (`rentals`) quedan fuera: este pago cubre la reserva de cancha. Rol `recepcionista` lee pero no muta (proposal.md - Impact).

## Goals / Non-Goals

**Goals:**
- Registrar un pago único por cada reserva `confirmed`, con `monto`, `metodoPago` y `fecha`.
- Ciclo de vida acotado y transiciones explícitas: `pendiente → pagado`, `pendiente|pagado → anulado` (terminal).
- Garantizar "una reserva → a lo sumo un pago" a nivel de base de datos.
- Permisos: mutaciones solo `admin`; consultas para `socio` (propias), `admin` y `recepcionista`.

**Non-Goals:**
- Pagos del alquiler de equipamiento (`rentals`) ni facturación/talones.
- Pagos parciales o múltiples cuotas por reserva.
- Definir/precalcular el precio de la cancha (el `monto` lo ingresa `admin`).
- Editar `monto`/`metodoPago`/`fecha` de un pago creado.
- Motivo de anulación ni devolución automática de `monto`.
- Cuota social / membresía.

## Decisions

- **Modelo Prisma**:
  - `Payment` (tabla `payments`): `id` UUID, `reservationId` FK unique → `Reservation`, `monto` `Decimal(10,2)` (`> 0`, no dataset almacenado: el valor lo provee el request), `metodoPago` enum (`EFECTIVO` | `TRANSFERENCIA` | `TARJETA`), `estado` enum (`PENDIENTE` | `PAGADO` | `ANULADO`, default `PENDIENTE`), `fecha` `DateTime` (día de cobro, default hoy), `fechaPago` `DateTime?` (se setea al confirmar), `createdAt`, `updatedAt`.

- **Un pago por reserva**: `@@unique` sobre `reservationId` + catch `P2002` → `409`. Alternativa: check previo de existencia → descartada por race condition; el constraint lo garantiza en BD.

- **Monto provisto por el admin**: la reserva no tiene precio de cancha hoy, así que `monto` entra por DTO (`> 0`). Alternativa descartada: calcular desde `Court`/turnos — requiere introducir precio de cancha, fuera de alcance y sin contrato previo. Se registra tal cual se ingresa (snapshot).

- **Máquina de estados**: mapa de transiciones en el service (`PENDIENTE → PAGADO`, `PENDIENTE|PAGADO → ANULADO`). Transición no permitida → `409`. El enum de Prisma y el DTO de salida garantizan que un pago no salga con un estado inválido. `anulado` no admite salida.

- **Registro transaccional (`$transaction`)**: valida que la reserva exista (404) y esté `confirmed` (409), e inserta `Payment` con `estado: PENDIENTE`. Si el insert choca con el unique (`P2002`) → `409` (ya existe pago). Esto cubre la carrera de dos registros simultáneos.

- **Confirmar (PATCH `/pagar`)**: `updateMany({ where: { id, estado: PENDIENTE }, data: { estado: PAGADO, fechaPago: new Date() } })`. Si afecta 0 filas, se reintroduce el registro para distinguir `404` (no existe) de `409` (no pendiente). Alternativa descartada: fetch + update en dos pasos siempre → más vulnerable a carrera.

- **Anular (PATCH `/anular`)**: `updateMany({ where: { id, estado: { in: [PENDIENTE, PAGADO] } }, data: { estado: ANULADO } })`; 0 filas → 404/409 según exista el registro.

- **Permisos** (mismo patrón que `reservations`): `@Roles(ADMIN)` en las mutaciones; en la consulta, el service valida que un `socio` solo consulte reservas cuyo `memberId` coincida con su miembro (403), mientras `admin`/`recepcionista` consultan cualquiera. `@UseGuards(JwtAuthGuard, RolesGuard)`.

- **DTO**: `CreatePaymentDto` con `monto` (`IsNumber` + `Min(0.01)`), `metodoPago` (`IsEnum`), `fecha` opcional (`IsDateString`/`IsDate`). Validación con class-validator; el service no valida manualmente.

## Risks / Trade-offs

- [Carrera entre dos registros de pago simultáneos para la misma reserva] → unique `reservationId` + catch `P2002` → `409`; nunca dos pagos.
- [`monto` sin origen automático: pagos de la misma reserva/cancha pueden diferir] → Es un trade-off asumido: el precio de la cancha no existe aún. Mitigación: el `monto` queda congelado en el pago (snapshot) y la nota queda en el proposal para un cambio futuro de tarifas.
- [`pagado → anulado` permite "deshacer" un cobro en papel] → Intencional para correcciones administrativas; `anulado` es terminal y no reabre estados.
- [Chequeo de titularidad duplicado con `reservations`] → Se reutiliza la misma lógica helper de ownership (memberId) para no divergir.
- [Enum de `metodoPago`/`estado` nuevo en BD] → Migración aditiva con enum de Prisma; sin impacto en tablas existentes.

## Migration Plan

1. Aplicar antes: `spec-auth` (`user-auth`) y `spec-reservas` (`reservations`).
2. Migración aditiva: tabla `payments` con `reservation_id` FK unique, enums `MetodoPago`/`EstadoPago`, default `PENDIENTE`.
3. Implementar módulo `payments` (controller, service, repository, DTOs, guardias de rol).
4. Frontend: sección de cobros para `admin` y estado de pago en "mis reservas" para `socio`.
5. **Rollback**: revertir la migración (drop tabla y enums) y quitar los endpoints; los contratos existentes no se modifican, por lo que deshacer no toca `reservations` ni `rentals`.

## Open Questions

Ninguna que cambie specs, enfoque o tareas. La tarifa de cancha (origen automático del `monto`) se resuelve en un change futuro de precios, sin afectar este registro de pagos.