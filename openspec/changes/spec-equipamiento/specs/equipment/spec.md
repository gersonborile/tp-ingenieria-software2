## Purpose

Catálogo de equipamiento del club con control de stock por unidad (total y disponible), exponiendo un CRUD protegido por roles para que la administración gestione el equipamiento y el change de reservas valide disponibilidad.

## ADDED Requirements

### Requirement: Catálogo de equipamiento
El sistema SHALL permitir consultar el catálogo completo de equipamiento mediante `GET /api/v1/equipamiento`. Cada item tiene: `id` (UUID), `name`, `description`, `category`, `totalStock` y `availableStock`. La consulta requiere usuario autenticado (cualquier rol) y devuelve todos los items del catálogo con su stock.

#### Scenario: Listar catálogo completo
- **WHEN** un usuario autenticado hace `GET /api/v1/equipamiento`
- **THEN** el sistema responde `200 OK` con un array con todos los items del catálogo, cada uno con su `availableStock` actualizado

#### Scenario: Acceso sin autenticación
- **WHEN** un usuario no autenticado hace `GET /api/v1/equipamiento`
- **THEN** el sistema responde `401 Unauthorized`

### Requirement: Alta de item de equipamiento
El sistema SHALL permitir a un usuario con rol `admin` crear un item de equipamiento mediante `POST /api/v1/equipamiento`, con `name`, `description`, `category` y `totalStock`. El `availableStock` inicial SHALL ser igual a `totalStock`. El `name` SHALL ser único dentro del club.

#### Scenario: Crear item exitoso
- **WHEN** un usuario `admin` hace `POST /api/v1/equipamiento` con `name`, `description`, `category` y `totalStock: 10`
- **THEN** el sistema responde `201 Created` con el item creado en el que `availableStock` es `10`

#### Scenario: Nombre duplicado
- **WHEN** un usuario `admin` hace `POST /api/v1/equipamiento` con un `name` que ya existe
- **THEN** el sistema responde `409 Conflict` y no crea el item

#### Scenario: Stock total negativo
- **WHEN** un usuario `admin` hace `POST /api/v1/equipamiento` con `totalStock: -1`
- **THEN** el sistema responde `400 Bad Request` y no crea el item

#### Scenario: Socio intenta crear
- **WHEN** un usuario con rol `socio` hace `POST /api/v1/equipamiento`
- **THEN** el sistema responde `403 Forbidden`

### Requirement: Actualización de item de equipamiento
El sistema SHALL permitir a un usuario con rol `admin` reemplazar por completo un item existente mediante `PUT /api/v1/equipamiento/:id`, incluyendo `name`, `description`, `category`, `totalStock` y `availableStock`. Los valores de stock SHALL cumplir `totalStock >= 0` y `0 <= availableStock <= totalStock`.

#### Scenario: Reemplazo completo válido
- **WHEN** un usuario `admin` hace `PUT /api/v1/equipamiento/:id` con `name`, `description`, `category`, `totalStock: 15` y `availableStock: 12`
- **THEN** el sistema responde `200 OK` con el item donde `totalStock` es `15` y `availableStock` es `12`

#### Scenario: Actualizar item inexistente
- **WHEN** un usuario `admin` hace `PUT /api/v1/equipamiento/:id` con un id que no existe
- **THEN** el sistema responde `404 Not Found`

#### Scenario: Actualización con nombre duplicado
- **WHEN** un usuario `admin` hace `PUT /api/v1/equipamiento/:id` renombrando el item a un `name` ya existente en otro item
- **THEN** el sistema responde `409 Conflict` y no aplica el cambio

#### Scenario: Stock disponible mayor al total
- **WHEN** un usuario `admin` hace `PUT /api/v1/equipamiento/:id` con `totalStock: 5` y `availableStock: 8`
- **THEN** el sistema responde `400 Bad Request` y no aplica el cambio

#### Scenario: Stock negativo
- **WHEN** un usuario `admin` hace `PUT /api/v1/equipamiento/:id` con `availableStock: -1`
- **THEN** el sistema responde `400 Bad Request` y no aplica el cambio

#### Scenario: Socio intenta actualizar
- **WHEN** un usuario con rol `socio` hace `PUT /api/v1/equipamiento/:id`
- **THEN** el sistema responde `403 Forbidden`

### Requirement: Eliminación de item de equipamiento
El sistema SHALL permitir a un usuario con rol `admin` eliminar un item existente mediante `DELETE /api/v1/equipamiento/:id`. La eliminación es física (hard delete) y el item deja de aparecer en el catálogo.

#### Scenario: Eliminar item existente
- **WHEN** un usuario `admin` hace `DELETE /api/v1/equipamiento/:id` sobre un item existente
- **THEN** el sistema responde `204 No Content` y el item ya no aparece en `GET /api/v1/equipamiento`

#### Scenario: Eliminar item inexistente
- **WHEN** un usuario `admin` hace `DELETE /api/v1/equipamiento/:id` con un id que no existe
- **THEN** el sistema responde `404 Not Found`

#### Scenario: Socio intenta eliminar
- **WHEN** un usuario con rol `socio` hace `DELETE /api/v1/equipamiento/:id`
- **THEN** el sistema responde `403 Forbidden`

### Requirement: Invariantes de stock
El sistema SHALL mantener en todo momento que `availableStock` esté en `[0, totalStock]` para cada item del catálogo y que `availableStock` refleje la cantidad disponible para reservar. Los descuentos y devoluciones de stock por reservas los realiza el change de reservas; este cumplimiento queda garantizado por la entidad `EquipmentItem`.

#### Scenario: Stock siempre consistente tras operaciones
- **WHEN** se ejecuta cualquier operación de alta o actualización sobre un item
- **THEN** el sistema responde con estados de stock que cumplen `0 <= availableStock <= totalStock`

### Requirement: Disponibilidad para integración con reservas
El sistema SHALL exponer `availableStock` en cada respuesta del catálogo para que el change de reservas pueda validar y descontar unidades al reservar, y devolverlas al cancelar.

#### Scenario: El catálogo expone la disponibilidad
- **WHEN** se consulta el catálogo de equipamiento
- **THEN** la respuesta SHALL incluir `availableStock` con el valor vigente en ese momento para cada item