## Purpose

Modela el registro de pagos de reservas de cancha: el administrador registra, confirma y anula un pago único por reserva confirmada, y los socios pueden consultar el pago de sus propias reservas.

## ADDED Requirements

### Requirement: Registro de pago de una reserva
El sistema SHALL permitir registrar el pago de una reserva mediante `POST /api/v1/reservas/:id/pagos`. El cuerpo SHALL incluir `monto` (mayor a 0) y `metodoPago` (`efectivo`, `transferencia` o `tarjeta`), y SHALL incluir `fecha` opcionalmente (por defecto, la fecha actual). La reserva SHALL existir y estar en estado `confirmed`. Una reserva SHALL tener a lo sumo un pago. El pago SHALL crearse en estado `pendiente`.

#### Scenario: Registrar pago de una reserva confirmada
- **WHEN** un usuario `admin` autenticado hace `POST /api/v1/reservas/:id/pagos` con un `monto` mayor a 0 y un `metodoPago` válido sobre una reserva en estado `confirmed`
- **THEN** el sistema responde `201 Created` con el pago en estado `pendiente`

#### Scenario: Registrar pago con monto inválido
- **WHEN** un usuario `admin` hace `POST /api/v1/reservas/:id/pagos` con `monto` menor o igual a 0, o sin `monto`
- **THEN** el sistema responde `400 Bad Request` y no crea el pago

#### Scenario: Registrar pago con método de pago inválido
- **WHEN** un usuario `admin` hace `POST /api/v1/reservas/:id/pagos` con un `metodoPago` fuera del conjunto `efectivo`/`transferencia`/`tarjeta`
- **THEN** el sistema responde `400 Bad Request` y no crea el pago

#### Scenario: Registrar pago de una reserva inexistente
- **WHEN** un usuario `admin` hace `POST /api/v1/reservas/:id/pagos` con un id de reserva que no existe
- **THEN** el sistema responde `404 Not Found` y no crea el pago

#### Scenario: Registrar pago de una reserva cancelada
- **WHEN** un usuario `admin` hace `POST /api/v1/reservas/:id/pagos` sobre una reserva en estado `cancelled`
- **THEN** el sistema responde `409 Conflict` y no crea el pago

#### Scenario: Registrar un segundo pago para la misma reserva
- **WHEN** un usuario `admin` hace `POST /api/v1/reservas/:id/pagos` sobre una reserva que ya tiene un pago (en cualquier estado)
- **THEN** el sistema responde `409 Conflict` y no crea un segundo pago

### Requirement: Confirmación del cobro de un pago
El sistema SHALL permitir confirmar el cobro de un pago en estado `pendiente` mediante `PATCH /api/v1/pagos/:id/pagar`. Al confirmarlo, el pago SHALL pasar a estado `pagado` y SHALL registrar su `fechaPago` como la fecha actual. Un pago que no esté en estado `pendiente` SHALL no poder confirmarse.

#### Scenario: Confirmar el cobro de un pago pendiente
- **WHEN** un usuario `admin` hace `PATCH /api/v1/pagos/:id/pagar` sobre un pago en estado `pendiente`
- **THEN** el sistema responde `200 OK` y el pago queda en estado `pagado` con su `fechaPago` registrada

#### Scenario: Confirmar un pago inexistente
- **WHEN** un usuario `admin` hace `PATCH /api/v1/pagos/:id/pagar` con un id de pago que no existe
- **THEN** el sistema responde `404 Not Found`

#### Scenario: Confirmar un pago no pendiente
- **WHEN** un usuario `admin` hace `PATCH /api/v1/pagos/:id/pagar` sobre un pago en estado `pagado` o `anulado`
- **THEN** el sistema responde `409 Conflict` y el estado del pago no cambia

### Requirement: Anulación de un pago
El sistema SHALL permitir anular un pago en estado `pendiente` o `pagado` mediante `PATCH /api/v1/pagos/:id/anular`. Al anularlo, el pago SHALL pasar a estado `anulado`. Un pago en estado `anulado` SHALL ser terminal y no SHALL poder reanularse ni volver a otro estado.

#### Scenario: Anular un pago pendiente
- **WHEN** un usuario `admin` hace `PATCH /api/v1/pagos/:id/anular` sobre un pago en estado `pendiente`
- **THEN** el sistema responde `200 OK` y el pago queda en estado `anulado`

#### Scenario: Anular un pago confirmado
- **WHEN** un usuario `admin` hace `PATCH /api/v1/pagos/:id/anular` sobre un pago en estado `pagado`
- **THEN** el sistema responde `200 OK` y el pago queda en estado `anulado`

#### Scenario: Anular un pago inexistente
- **WHEN** un usuario `admin` hace `PATCH /api/v1/pagos/:id/anular` con un id de pago que no existe
- **THEN** el sistema responde `404 Not Found`

#### Scenario: Anular un pago ya anulado
- **WHEN** un usuario `admin` hace `PATCH /api/v1/pagos/:id/anular` sobre un pago en estado `anulado`
- **THEN** el sistema responde `409 Conflict` y el pago no cambia de estado

### Requirement: Consulta del pago de una reserva
El sistema SHALL permitir consultar el pago de una reserva mediante `GET /api/v1/reservas/:id/pagos`. Un usuario `socio` SHALL ver únicamente el pago de sus propias reservas; un usuario `admin` o `recepcionista` SHALL poder ver el pago de cualquier reserva. La respuesta SHALL incluir `id`, `reservaId`, `monto`, `metodoPago`, `estado`, `fecha` y `fechaPago` (si existe). Si la reserva no existe o no tiene pago, la consulta SHALL responder `404`.

#### Scenario: Socio consulta el pago de su propia reserva
- **WHEN** un usuario `socio` autenticado hace `GET /api/v1/reservas/:id/pagos` sobre una de sus reservas que tiene un pago
- **THEN** el sistema responde `200 OK` con el pago de la reserva, incluyendo su `estado`, `monto` y `metodoPago`

#### Scenario: Administrador consulta el pago de cualquier reserva
- **WHEN** un usuario `admin` autenticado hace `GET /api/v1/reservas/:id/pagos` sobre cualquier reserva que tiene un pago
- **THEN** el sistema responde `200 OK` con el pago de la reserva

#### Scenario: Recepcionista consulta el pago de una reserva
- **WHEN** un usuario `recepcionista` autenticado hace `GET /api/v1/reservas/:id/pagos` sobre cualquier reserva que tiene un pago
- **THEN** el sistema responde `200 OK` con el pago de la reserva

#### Scenario: Socio consulta el pago de una reserva ajena
- **WHEN** un usuario `socio` hace `GET /api/v1/reservas/:id/pagos` sobre una reserva que pertenece a otro socio
- **THEN** el sistema responde `403 Forbidden`

#### Scenario: Consultar el pago de una reserva sin pago
- **WHEN** un usuario autenticado hace `GET /api/v1/reservas/:id/pagos` sobre una reserva existente que aún no tiene pago
- **THEN** el sistema responde `404 Not Found`

#### Scenario: Consultar el pago de una reserva inexistente
- **WHEN** un usuario autenticado hace `GET /api/v1/reservas/:id/pagos` con un id de reserva que no existe
- **THEN** el sistema responde `404 Not Found`

### Requirement: Autorización de operaciones de pago
El sistema SHALL requerir autenticación para todas las operaciones de pago. Las mutaciones (registrar, confirmar y anular) SHALL estar reservadas exclusivamente al rol `admin`; los roles `socio` y `recepcionista` SHALL no poder ejecutarlas. Las consultas SHALL estar disponibles para `socio` (solo sobre sus propias reservas), `admin` y `recepcionista`.

#### Scenario: Registrar, confirmar o anular sin autenticación
- **WHEN** un cliente no autenticado hace `POST /api/v1/reservas/:id/pagos`, `PATCH /api/v1/pagos/:id/pagar` o `PATCH /api/v1/pagos/:id/anular`
- **THEN** el sistema responde `401 Unauthorized` sin realizar la operación

#### Scenario: Socio intenta registrar un pago
- **WHEN** un usuario `socio` autenticado hace `POST /api/v1/reservas/:id/pagos`
- **THEN** el sistema responde `403 Forbidden` y no crea el pago

#### Scenario: Recepcionista intenta confirmar un pago
- **WHEN** un usuario `recepcionista` autenticado hace `PATCH /api/v1/pagos/:id/pagar`
- **THEN** el sistema responde `403 Forbidden` y el pago no cambia de estado

#### Scenario: Consultar un pago sin autenticación
- **WHEN** un cliente no autenticado hace `GET /api/v1/reservas/:id/pagos`
- **THEN** el sistema responde `401 Unauthorized`