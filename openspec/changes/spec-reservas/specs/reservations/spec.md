## Purpose

Permite a socios y personal del club crear, consultar y cancelar reservas de canchas (y equipamiento opcional) respetando la disponibilidad de horarios, el stock y la política de cancelación.

## ADDED Requirements

### Requirement: Creación de reservas
El sistema SHALL permitir crear una reserva mediante `POST /api/v1/reservas`. El cuerpo SHALL incluir `courtId`, `date`, `startTime` (inicio de una franja fija de 1 hora) y, opcionalmente, `memberId` solo para `admin`/`recepcionista`, y `items` (array de `{ equipmentId, quantity }`). Un usuario `socio` SHALL poder reservar solo para sí mismo. Al crearse, la reserva queda en estado `confirmed`.

#### Scenario: Crear reserva en slot libre
- **WHEN** un usuario `socio` autenticado hace `POST /api/v1/reservas` con una cancha, una fecha futura y un `startTime` que corresponde a una franja de 1 hora libre
- **THEN** el sistema responde `201 Created` con la reserva en estado `confirmed`

#### Scenario: Slot ya reservado en la misma cancha
- **WHEN** un usuario autenticado hace `POST /api/v1/reservas` para una cancha y franja que ya tiene otra reserva activa
- **THEN** el sistema responde `409 Conflict` y no crea la reserva

#### Scenario: Slot libre en otra cancha con el mismo horario
- **WHEN** un usuario autenticado hace `POST /api/v1/reservas` para una franja que ya está ocupada solo en otra cancha distinta
- **THEN** el sistema responde `201 Created` sin conflictos

#### Scenario: Franja no alineada a una hora exacta
- **WHEN** un usuario autenticado hace `POST /api/v1/reservas` con `startTime` que no comienza en una hora exacta (ej: 10:30)
- **THEN** el sistema responde `400 Bad Request` y no crea la reserva

#### Scenario: Fecha pasada
- **WHEN** un usuario autenticado hace `POST /api/v1/reservas` con una `date` anterior a hoy
- **THEN** el sistema responde `400 Bad Request` y no crea la reserva

#### Scenario: Cancha inexistente
- **WHEN** un usuario autenticado hace `POST /api/v1/reservas` con un `courtId` que no existe
- **THEN** el sistema responde `404 Not Found` y no crea la reserva

#### Scenario: Recepcionista reserva en nombre de un socio
- **WHEN** un usuario `recepcionista` hace `POST /api/v1/reservas` indicando un `memberId` de un socio existente
- **THEN** el sistema responde `201 Created` con la reserva asociada a ese socio

#### Scenario: Socio intenta reservar para otro socio
- **WHEN** un usuario `socio` hace `POST /api/v1/reservas` con un `memberId` distinto al suyo
- **THEN** el sistema responde `403 Forbidden` y no crea la reserva

#### Scenario: Acceso sin autenticación
- **WHEN** un usuario no autenticado hace `POST /api/v1/reservas`
- **THEN** el sistema responde `401 Unauthorized`

### Requirement: Equipamiento dentro de la reserva
El sistema SHALL permitir incluir equipamiento en la reserva mediante el campo `items` de `POST /api/v1/reservas`. Para cada item, el sistema SHALL verificar que el equipamiento exista y que `availableStock >= quantity`; si se cumple, descuenta `quantity` del `availableStock` en la misma operación. Si algún item no tiene stock suficiente, la reserva NO se crea.

#### Scenario: Reservar con equipamiento con stock suficiente
- **WHEN** un usuario autenticado hace `POST /api/v1/reservas` con `items` donde cada `quantity` es menor o igual al `availableStock` del equipamiento
- **THEN** el sistema responde `201 Created`, la reserva incluye los items y el `availableStock` de cada equipamiento queda descontado en `quantity`

#### Scenario: Stock insuficiente de equipamiento
- **WHEN** un usuario autenticado hace `POST /api/v1/reservas` con un item cuya `quantity` supera el `availableStock`
- **THEN** el sistema responde `409 Conflict`, no crea la reserva y no descuenta stock

#### Scenario: Equipamiento inexistente
- **WHEN** un usuario autenticado hace `POST /api/v1/reservas` con un `equipmentId` que no existe
- **THEN** el sistema responde `404 Not Found` y no crea la reserva

#### Scenario: Reserva sin equipamiento
- **WHEN** un usuario autenticado hace `POST /api/v1/reservas` sin el campo `items`
- **THEN** el sistema responde `201 Created` con una reserva sin items de equipamiento

### Requirement: Consulta de reservas propias
El sistema SHALL permitir consultar reservas mediante `GET /api/v1/reservas/mis`. Un usuario `socio` SHALL ver únicamente sus propias reservas (con sus items de equipamiento) en cualquier estado. Un usuario `admin` o `recepcionista` SHALL ver las reservas de todos los socios y podrá filtrar por socio con `?memberId=`.

#### Scenario: Socio consulta sus reservas
- **WHEN** un usuario `socio` autenticado hace `GET /api/v1/reservas/mis`
- **THEN** el sistema responde `200 OK` con solo las reservas del socio, cada una con su estado y sus items de equipamiento

#### Scenario: Recepcionista consulta todas las reservas
- **WHEN** un usuario `recepcionista` autenticado hace `GET /api/v1/reservas/mis`
- **THEN** el sistema responde `200 OK` con las reservas de todos los socios

#### Scenario: Recepcionista filtra por socio
- **WHEN** un usuario `recepcionista` autenticado hace `GET /api/v1/reservas/mis?memberId=cualquier-socio`
- **THEN** el sistema responde `200 OK` solo con las reservas de ese socio

#### Scenario: Socio intenta ver las reservas de otro socio
- **WHEN** un usuario `socio` hace `GET /api/v1/reservas/mis?memberId=otro-socio`
- **THEN** el sistema responde `403 Forbidden`

#### Scenario: Acceso sin autenticación
- **WHEN** un usuario no autenticado hace `GET /api/v1/reservas/mis`
- **THEN** el sistema responde `401 Unauthorized`

### Requirement: Cancelación de reservas
El sistema SHALL permitir cancelar una reserva mediante `PATCH /api/v1/reservas/:id/cancelar`. Un usuario `socio` SHALL cancelar solo sus propias reservas; `admin`/`recepcionista` SHALL poder cancelar cualquier reserva. La cancelación SHALL ser válida solo si faltan al menos 2 horas para el inicio de la franja. Al cancelar, la reserva pasa a estado `cancelled` y el stock de equipamiento reservado vuelve a incrementarse.

#### Scenario: Cancelar reserva propia dentro de la ventana
- **WHEN** un usuario `socio` hace `PATCH /api/v1/reservas/:id/cancelar` sobre una de sus reservas que comienza en más de 2 horas
- **THEN** el sistema responde `200 OK`, la reserva queda en estado `cancelled` y se restituye el `availableStock` de los items reservados

#### Scenario: Cancelar por recepcionista en nombre de un socio
- **WHEN** un usuario `recepcionista` hace `PATCH /api/v1/reservas/:id/cancelar` sobre una reserva de otro socio dentro de la ventana
- **THEN** el sistema responde `200 OK` y la reserva queda cancelada

#### Scenario: Cancelar dentro de la ventana de 2 horas
- **WHEN** un usuario autenticado hace `PATCH /api/v1/reservas/:id/cancelar` sobre una reserva que comienza en menos de 2 horas (o ya comenzó)
- **THEN** el sistema responde `409 Conflict` y la reserva no se cancela

#### Scenario: Cancelar reserva ajena siendo socio
- **WHEN** un usuario `socio` hace `PATCH /api/v1/reservas/:id/cancelar` sobre una reserva que pertenece a otro socio
- **THEN** el sistema responde `403 Forbidden` y la reserva no se cancela

#### Scenario: Cancelar reserva inexistente
- **WHEN** un usuario autenticado hace `PATCH /api/v1/reservas/:id/cancelar` con un id que no existe
- **THEN** el sistema responde `404 Not Found`

#### Scenario: Cancelar una reserva ya cancelada
- **WHEN** un usuario autenticado hace `PATCH /api/v1/reservas/:id/cancelar` sobre una reserva ya en estado `cancelled`
- **THEN** el sistema responde `409 Conflict` y no reintenta liberar stock