## ADDED Requirements

### Requirement: Precio de alquiler del equipamiento
El sistema SHALL incluir `pricePerUnit` (precio de alquiler por unidad, número decimal `>= 0`) en cada item del catálogo. El campo SHALL ser requerido en el alta (`POST /api/v1/equipamiento`), en la actualización (`PUT /api/v1/equipamiento/:id`) y SHALL estar presente en las respuestas del catálogo `GET /api/v1/equipamiento`.

#### Scenario: Crear item con precio
- **WHEN** un usuario `admin` hace `POST /api/v1/equipamiento` con `name`, `description`, `category`, `totalStock` y `pricePerUnit: 500`
- **THEN** el sistema responde `201 Created` con el item que incluye `pricePerUnit: 500`

#### Scenario: Crear item sin precio
- **WHEN** un usuario `admin` hace `POST /api/v1/equipamiento` sin el campo `pricePerUnit`
- **THEN** el sistema responde `400 Bad Request` y no crea el item

#### Scenario: Precio negativo
- **WHEN** un usuario `admin` hace `POST /api/v1/equipamiento` con `pricePerUnit: -10`
- **THEN** el sistema responde `400 Bad Request` y no crea el item

#### Scenario: Actualizar item con precio
- **WHEN** un usuario `admin` hace `PUT /api/v1/equipamiento/:id` con `name`, `description`, `category`, `totalStock`, `availableStock` y `pricePerUnit: 600`
- **THEN** el sistema responde `200 OK` con el item actualizado que incluye `pricePerUnit: 600`

#### Scenario: Actualizar item sin precio
- **WHEN** un usuario `admin` hace `PUT /api/v1/equipamiento/:id` sin el campo `pricePerUnit`
- **THEN** el sistema responde `400 Bad Request` y no aplica el cambio

#### Scenario: El catálogo expone el precio
- **WHEN** se consulta `GET /api/v1/equipamiento`
- **THEN** cada item de la respuesta incluye `pricePerUnit`