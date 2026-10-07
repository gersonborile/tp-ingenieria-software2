## Purpose

Permite al club administrar el catálogo de equipamiento deportivo (raquetas, pelotas, redes, etc.) por disciplina, con stock total y disponible, precio unitario, disponibilidad derivada del stock disponible, y lectura pública; como base previa para futuros préstamos o alquileres.

## ADDED Requirements

### Requirement: Consultar catálogo de equipamiento

El sistema SHALL permitir listar los ítems de equipamiento del club con su disciplina, stock, precio y disponibilidad, y consultar el detalle de un ítem individual, sin requerir autenticación.

#### Scenario: Listado de todos los ítems

- **WHEN** un cliente consulta `GET /equipamiento`
- **THEN** el sistema responde 200 con la lista de ítems de equipamiento activos; cada ítem incluye `id`, `nombre`, `disciplina_id`, `stock_total`, `stock_disponible`, `precio_unitario`, `activo` y `disponible`

#### Scenario: Listado filtrado por disciplina

- **WHEN** un cliente consulta `GET /equipamiento?disciplina_id=<id>`
- **THEN** el sistema responde 200 solo con los ítems activos de la disciplina indicada

#### Scenario: Listado filtrado por disponibilidad

- **WHEN** un cliente consulta `GET /equipamiento?disponible=true`
- **THEN** el sistema responde 200 solo con los ítems activos cuyo `stock_disponible` es mayor que 0

#### Scenario: Listado que incluye ítems inactivos

- **WHEN** un cliente consulta `GET /equipamiento?incluir_inactivos=true`
- **THEN** el sistema responde 200 incluyendo los ítems con `activo = false`

#### Scenario: Detalle de un ítem existente

- **WHEN** un cliente consulta `GET /equipamiento/:id` con un id existente
- **THEN** el sistema responde 200 con el ítem solicitado, incluyendo disciplina, `stock_total`, `stock_disponible`, `precio_unitario`, `activo` y `disponible`

#### Scenario: Detalle de un ítem inexistente

- **WHEN** un cliente consulta `GET /equipamiento/:id` con un id que no existe
- **THEN** el sistema responde 404 sin exponer detalles del ítem

### Requirement: Crear ítem de equipamiento

El sistema SHALL permitir al administrador crear un ítem de equipamiento con disciplina existente, nombre no vacío, `stock_total` y `precio_unitario` no negativos.

#### Scenario: Crear un ítem válido

- **WHEN** un administrador envía `POST /equipamiento` con un `nombre` no vacío, una `disciplina_id` existente, un `stock_total` y un `precio_unitario` mayores o iguales a 0
- **THEN** el sistema responde 201 con el ítem creado, con `stock_disponible` igual a `stock_total`, `disponible` igual a `stock_disponible > 0` y `activo` igual a `true`

#### Scenario: Crear ítem con disciplina inexistente

- **WHEN** un administrador envía `POST /equipamiento` referenciando una disciplina que no existe en el sistema
- **THEN** el sistema responde 422 y no crea el ítem

#### Scenario: Crear ítem con stock negativo

- **WHEN** un administrador envía `POST /equipamiento` con un `stock_total` menor que 0
- **THEN** el sistema responde 400 y no crea el ítem

#### Scenario: Crear ítem con precio negativo

- **WHEN** un administrador envía `POST /equipamiento` con un `precio_unitario` menor que 0
- **THEN** el sistema responde 400 y no crea el ítem

#### Scenario: Crear ítem con nombre faltante

- **WHEN** un administrador envía `POST /equipamiento` sin `nombre` o con un nombre vacío
- **THEN** el sistema responde 400 y no crea el ítem

#### Scenario: Crear ítem con datos faltantes

- **WHEN** un administrador envía `POST /equipamiento` sin `nombre`, `disciplina_id`, `stock_total` o `precio_unitario`
- **THEN** el sistema responde 400 y no crea el ítem

### Requirement: Modificar ítem de equipamiento

El sistema SHALL permitir al administrador modificar un ítem existente, revalidando nombre, disciplina, stock y precio.

#### Scenario: Modificar un ítem existente

- **WHEN** un administrador envía `PATCH /equipamiento/:id` con datos válidos para un ítem existente
- **THEN** el sistema responde 200 con el ítem actualizado, incluyendo su `disponible` recalculado según el nuevo `stock_disponible`

#### Scenario: Modificar ítem inexistente

- **WHEN** un administrador envía `PATCH /equipamiento/:id` con un id que no existe
- **THEN** el sistema responde 404

#### Scenario: Modificar ítem con stock negativo

- **WHEN** un administrador envía `PATCH /equipamiento/:id` con un `stock_total` o un `stock_disponible` menor que 0
- **THEN** el sistema responde 400 y no modifica el ítem

#### Scenario: Modificar ítem con stock disponible mayor al total

- **WHEN** un administrador envía `PATCH /equipamiento/:id` dejando `stock_disponible` mayor que `stock_total`
- **THEN** el sistema responde 400 y no modifica el ítem

#### Scenario: Modificar ítem con precio negativo

- **WHEN** un administrador envía `PATCH /equipamiento/:id` con un `precio_unitario` menor que 0
- **THEN** el sistema responde 400 y no modifica el ítem

#### Scenario: Modificar ítem con disciplina inexistente

- **WHEN** un administrador envía `PATCH /equipamiento/:id` referenciando una disciplina que no existe
- **THEN** el sistema responde 422 y no modifica el ítem

#### Scenario: Desactivar un ítem

- **WHEN** un administrador envía `PATCH /equipamiento/:id` con `activo = false`
- **THEN** el sistema responde 200 con el ítem actualizado y deja de mostrarlo en los listados públicos que no usan `incluir_inactivos`

### Requirement: Eliminar ítem de equipamiento

El sistema SHALL permitir al administrador eliminar un ítem siempre que no tenga un préstamo activo asociado.

#### Scenario: Eliminar ítem sin préstamo activo

- **WHEN** un administrador envía `DELETE /equipamiento/:id` para un ítem sin préstamos activos asociados
- **THEN** el sistema responde 204 y el ítem deja de existir

#### Scenario: Eliminar ítem inexistente

- **WHEN** un administrador envía `DELETE /equipamiento/:id` con un id que no existe
- **THEN** el sistema responde 404

#### Scenario: Eliminar ítem con préstamo activo

- **WHEN** un administrador envía `DELETE /equipamiento/:id` para un ítem que tiene un préstamo activo asociado
- **THEN** el sistema responde 409 y el ítem no se elimina

### Requirement: Gestionar stock e inventario

El sistema SHALL mantener `stock_total` y `stock_disponible` de cada ítem (siempre `0 <= stock_disponible <= stock_total`), derivar su disponibilidad de `stock_disponible` y permitir ocultarlo del catálogo público sin eliminarlo.

#### Scenario: Disponibilidad derivada del stock

- **WHEN** un ítem tiene `stock_disponible` mayor que 0
- **THEN** el sistema reporta `disponible = true` para ese ítem en toda consulta; si el `stock_disponible` es 0, reporta `disponible = false`

#### Scenario: Ítem inactivo oculto del listado público

- **WHEN** un cliente consulta `GET /equipamiento` sin `incluir_inactivos` y existe un ítem con `activo = false`
- **THEN** el sistema responde 200 sin incluir ese ítem

#### Scenario: El stock de un ítem nunca es negativo

- **WHEN** se intenta crear o modificar un ítem con un `stock_total` o `stock_disponible` menor que 0
- **THEN** el sistema responde 400 y no crea ni modifica el ítem

### Requirement: Acceso administrativo a mutaciones

El sistema SHALL requerir un usuario autenticado con rol administrador para crear, modificar o eliminar ítems de equipamiento.

#### Scenario: Cliente sin autenticación intenta mutar

- **WHEN** un cliente no autenticado envía `POST /equipamiento`, `PATCH /equipamiento/:id` o `DELETE /equipamiento/:id`
- **THEN** el sistema responde 401 sin realizar la operación

#### Scenario: Usuario autenticado sin rol administrador intenta mutar

- **WHEN** un usuario autenticado cuyo rol no es administrador envía una mutación sobre el catálogo de equipamiento
- **THEN** el sistema responde 403 sin realizar la operación