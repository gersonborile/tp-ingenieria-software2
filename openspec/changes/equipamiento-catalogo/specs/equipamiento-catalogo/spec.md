## Purpose

Permite al club administrar el catálogo de equipamiento deportivo (raquetas, pelotas, redes, etc.) por disciplina, con stock e inventario, disponibilidad derivada del stock, y lectura pública; como base previa para futuros préstamos o alquileres.

## ADDED Requirements

### Requirement: Consultar catálogo de equipamiento

El sistema SHALL permitir listar los ítems de equipamiento del club con su disciplina, stock y disponibilidad, y consultar el detalle de un ítem individual, sin requerir autenticación.

#### Scenario: Listado de todos los ítems

- **WHEN** un cliente consulta `GET /equipamiento`
- **THEN** el sistema responde 200 con la lista de ítems de equipamiento activos; cada ítem incluye `id`, `nombre`, `disciplina_id`, `stock`, `activo` y `disponible`

#### Scenario: Listado filtrado por disciplina

- **WHEN** un cliente consulta `GET /equipamiento?disciplina_id=<id>`
- **THEN** el sistema responde 200 solo con los ítems activos de la disciplina indicada

#### Scenario: Listado filtrado por disponibilidad

- **WHEN** un cliente consulta `GET /equipamiento?disponible=true`
- **THEN** el sistema responde 200 solo con los ítems activos cuyo `stock` es mayor que 0

#### Scenario: Listado que incluye ítems inactivos

- **WHEN** un cliente consulta `GET /equipamiento?incluir_inactivos=true`
- **THEN** el sistema responde 200 incluyendo los ítems con `activo = false`

#### Scenario: Detalle de un ítem existente

- **WHEN** un cliente consulta `GET /equipamiento/:id` con un id existente
- **THEN** el sistema responde 200 con el ítem solicitado, incluyendo disciplina, stock, `activo` y `disponible`

#### Scenario: Detalle de un ítem inexistente

- **WHEN** un cliente consulta `GET /equipamiento/:id` con un id que no existe
- **THEN** el sistema responde 404 sin exponer detalles del ítem

### Requirement: Crear ítem de equipamiento

El sistema SHALL permitir al administrador crear un ítem de equipamiento con disciplina existente, nombre no vacío y `stock` no negativo.

#### Scenario: Crear un ítem válido

- **WHEN** un administrador envía `POST /equipamiento` con un `nombre` no vacío, una `disciplina_id` existente y un `stock` mayor o igual a 0
- **THEN** el sistema responde 201 con el ítem creado, incluyendo su `id`, `disponible` igual a `stock > 0` y `activo` igual a `true`

#### Scenario: Crear ítem con disciplina inexistente

- **WHEN** un administrador envía `POST /equipamiento` referenciando una disciplina que no existe en el sistema
- **THEN** el sistema responde 422 y no crea el ítem

#### Scenario: Crear ítem con stock negativo

- **WHEN** un administrador envía `POST /equipamiento` con un `stock` menor que 0
- **THEN** el sistema responde 400 y no crea el ítem

#### Scenario: Crear ítem con nombre faltante

- **WHEN** un administrador envía `POST /equipamiento` sin `nombre` o con un nombre vacío
- **THEN** el sistema responde 400 y no crea el ítem

#### Scenario: Crear ítem con datos faltantes

- **WHEN** un administrador envía `POST /equipamiento` sin `nombre`, `disciplina_id` o `stock`
- **THEN** el sistema responde 400 y no crea el ítem

### Requirement: Modificar ítem de equipamiento

El sistema SHALL permitir al administrador modificar un ítem existente, revalidando nombre, disciplina y stock.

#### Scenario: Modificar un ítem existente

- **WHEN** un administrador envía `PATCH /equipamiento/:id` con datos válidos para un ítem existente
- **THEN** el sistema responde 200 con el ítem actualizado, incluyendo su `disponible` recalculado según el nuevo `stock`

#### Scenario: Modificar ítem inexistente

- **WHEN** un administrador envía `PATCH /equipamiento/:id` con un id que no existe
- **THEN** el sistema responde 404

#### Scenario: Modificar ítem con stock negativo

- **WHEN** un administrador envía `PATCH /equipamiento/:id` con un `stock` menor que 0
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

El sistema SHALL mantener el stock de cada ítem de equipamiento, derivar su disponibilidad del stock y permitir ocultarlo del catálogo público sin eliminarlo.

#### Scenario: Disponibilidad derivada del stock

- **WHEN** un ítem tiene `stock` mayor que 0
- **THEN** el sistema reporta `disponible = true` para ese ítem en toda consulta; si el `stock` es 0, reporta `disponible = false`

#### Scenario: Ítem inactivo oculto del listado público

- **WHEN** un cliente consulta `GET /equipamiento` sin `incluir_inactivos` y existe un ítem con `activo = false`
- **THEN** el sistema responde 200 sin incluir ese ítem

#### Scenario: El stock de un ítem nunca es negativo

- **WHEN** se intenta crear o modificar un ítem con un `stock` menor que 0
- **THEN** el sistema responde 400 y el ítem conserva su `stock` previo inválido

### Requirement: Acceso administrativo a mutaciones

El sistema SHALL requerir un usuario autenticado con rol administrador para crear, modificar o eliminar ítems de equipamiento.

#### Scenario: Cliente sin autenticación intenta mutar

- **WHEN** un cliente no autenticado envía `POST /equipamiento`, `PATCH /equipamiento/:id` o `DELETE /equipamiento/:id`
- **THEN** el sistema responde 401 sin realizar la operación

#### Scenario: Usuario autenticado sin rol administrador intenta mutar

- **WHEN** un usuario autenticado cuyo rol no es administrador envía una mutación sobre el catálogo de equipamiento
- **THEN** el sistema responde 403 sin realizar la operación