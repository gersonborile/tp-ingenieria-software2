## Purpose

Modela el alquiler de equipamiento como entidad propia asociada a una reserva confirmada: se crea contra la reserva, descuenta stock, registra montos del catálogo y libera el stock al cancelar la reserva.

## ADDED Requirements

### Requirement: Alquiler de equipamiento para una reserva
El sistema SHALL permitir crear un alquiler de equipamiento mediante `POST /api/v1/reservas/:id/alquiler`. El cuerpo SHALL incluir `items` (array de `{ equipmentId, quantity }` con `quantity >= 1`). La reserva SHALL estar en estado `confirmed`. Un usuario `socio` SHALL poder alquilar solo sobre sus propias reservas; `admin`/`recepcionista` SHALL poder alquilar sobre cualquier reserva. Una reserva SHALL tener a lo sumo un alquiler.

#### Scenario: Crear alquiler válido
- **WHEN** un usuario autenticado hace `POST /api/v1/reservas/:id/alquiler` sobre una reserva `confirmed` con items válidos y stock suficiente
- **THEN** el sistema responde `201 Created` con el alquiler, sus items con cantidades y montos

#### Scenario: Reserva inexistente
- **WHEN** un usuario autenticado hace `POST /api/v1/reservas/:id/alquiler` con un id de reserva que no existe
- **THEN** el sistema responde `404 Not Found` y no crea el alquiler

#### Scenario: Reserva cancelada
- **WHEN** un usuario autenticado hace `POST /api/v1/reservas/:id/alquiler` sobre una reserva en estado `cancelled`
- **THEN** el sistema responde `409 Conflict` y no crea el alquiler

#### Scenario: La reserva ya tiene un alquiler
- **WHEN** un usuario autenticado hace `POST /api/v1/reservas/:id/alquiler` sobre una reserva que ya tiene un alquiler activo
- **THEN** el sistema responde `409 Conflict` y no crea un segundo alquiler

#### Scenario: Equipamiento inexistente
- **WHEN** un usuario autenticado hace `POST /api/v1/reservas/:id/alquiler` con un `equipmentId` que no existe
- **THEN** el sistema responde `404 Not Found` y no crea el alquiler

#### Scenario: Stock insuficiente
- **WHEN** un usuario autenticado hace `POST /api/v1/reservas/:id/alquiler` con un item cuya `quantity` supera el `availableStock`
- **THEN** el sistema responde `409 Conflict`, no crea el alquiler y no descuenta stock

#### Scenario: Socio intenta alquilar sobre una reserva ajena
- **WHEN** un usuario `socio` hace `POST /api/v1/reservas/:id/alquiler` sobre una reserva que pertenece a otro socio
- **THEN** el sistema responde `403 Forbidden` y no crea el alquiler

#### Scenario: Acceso sin autenticación
- **WHEN** un usuario no autenticado hace `POST /api/v1/reservas/:id/alquiler`
- **THEN** el sistema responde `401 Unauthorized`

### Requirement: Montos del alquiler
El sistema SHALL registrar para cada item del alquiler el `pricePerUnit` vigente del catálogo de equipamiento en el momento de la creación y SHALL calcular `totalAmount` por item como `pricePerUnit * quantity`. El alquiler SHALL exponer su `totalAmount` como la suma de los `totalAmount` de sus items. El precio SHALL quedar congelado en el alquiler aunque el catálogo cambie luego.

#### Scenario: Monto calculado del catálogo
- **WHEN** se crea un alquiler con un item de `quantity: 2` y `pricePerUnit: 500` en el catálogo
- **THEN** la respuesta incluye `totalAmount: 1000` para el item y el `totalAmount` del alquiler es `1000`

#### Scenario: El precio queda congelado en el alquiler
- **WHEN** el `pricePerUnit` del equipamiento cambia en el catálogo después de crear el alquiler
- **THEN** el alquiler conserva el `pricePerUnit` y `totalAmount` registrados al momento de su creación

### Requirement: Stock del alquiler
El sistema SHALL descontar `quantity` del `availableStock` de cada equipamiento al crear el alquiler, y SHALL restituir ese `availableStock` al cancelar la reserva asociada.

#### Scenario: Descuento de stock al crear el alquiler
- **WHEN** un alquiler se crea con un item de `quantity: 3`
- **THEN** el `availableStock` de ese equipamiento en el catálogo queda reducido en `3`

#### Scenario: Liberación de stock al cancelar la reserva
- **WHEN** la reserva asociada a un alquiler se cancela mediante `PATCH /api/v1/reservas/:id/cancelar`
- **THEN** el `availableStock` de los equipamientos del alquiler vuelve a incrementarse en las cantidades alquiladas