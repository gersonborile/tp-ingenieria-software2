## Purpose

Permite al club definir las franjas horarias (turnos) disponibles en cada cancha para cada disciplina, cumpliendo las reglas anti-superposición, y permite a cualquier usuario consultar turnos y la disponibilidad de una cancha por fecha, como base previa para el sistema de reservas.

## ADDED Requirements

### Requirement: Consultar turnos

El sistema SHALL permitir listar los turnos del club con sus canchas, disciplinas y estado de disponibilidad, y consultar el detalle de un turno individual, sin requerir autenticación.

#### Scenario: Listado de todos los turnos

- **WHEN** un cliente consulta `GET /turnos`
- **THEN** el sistema responde 200 con la lista de turnos; cada turno incluye `id`, `cancha_id`, `disciplina_id`, `fecha`, `hora_inicio`, `hora_fin` y `disponible`

#### Scenario: Listado filtrado por cancha

- **WHEN** un cliente consulta `GET /turnos?cancha_id=<id>`
- **THEN** el sistema responde 200 solo con los turnos de la cancha indicada

#### Scenario: Listado filtrado por disciplina

- **WHEN** un cliente consulta `GET /turnos?disciplina_id=<id>`
- **THEN** el sistema responde 200 solo con los turnos de la disciplina indicada

#### Scenario: Listado filtrado por fecha

- **WHEN** un cliente consulta `GET /turnos?fecha=2026-09-15`
- **THEN** el sistema responde 200 solo con los turnos cuya fecha es la indicada

#### Scenario: Detalle de un turno existente

- **WHEN** un cliente consulta `GET /turnos/:id` con un id existente
- **THEN** el sistema responde 200 con el turno solicitado, incluyendo cancha, disciplina y disponibilidad

#### Scenario: Detalle de un turno inexistente

- **WHEN** un cliente consulta `GET /turnos/:id` con un id que no existe
- **THEN** el sistema responde 404 sin exponer detalles del turno

### Requirement: Crear turno

El sistema SHALL permitir al administrador crear un turno con cancha existente, disciplina existente, fecha, hora de inicio y hora de fin, siempre que no se superponga con otro turno de la misma cancha en la misma fecha.

#### Scenario: Crear un turno válido

- **WHEN** un administrador envía `POST /turnos` con una `cancha_id` y `disciplina_id` existentes, una `fecha` futura o de hoy, y una `hora_fin` posterior a `hora_inicio`, sin superposición con turnos existentes de esa cancha en esa fecha
- **THEN** el sistema responde 201 con el turno creado, incluyendo su `id`

#### Scenario: Crear turno con cancha inexistente

- **WHEN** un administrador envía `POST /turnos` referenciando una cancha que no existe en el sistema
- **THEN** el sistema responde 422 y no crea el turno

#### Scenario: Crear turno con disciplina inexistente

- **WHEN** un administrador envía `POST /turnos` referenciando una disciplina que no existe en el sistema
- **THEN** el sistema responde 422 y no crea el turno

#### Scenario: Crear turno con hora de fin inválida

- **WHEN** un administrador envía `POST /turnos` con `hora_fin` anterior o igual a `hora_inicio`
- **THEN** el sistema responde 400 y no crea el turno

#### Scenario: Crear turno en fecha pasada

- **WHEN** un administrador envía `POST /turnos` con una `fecha` anterior a la fecha actual
- **THEN** el sistema responde 400 y no crea el turno

#### Scenario: Crear turno superpuesto en la misma cancha y fecha

- **WHEN** un administrador envía `POST /turnos` cuyo rango `hora_inicio`–`hora_fin` se superpone con un turno existente de la misma cancha en la misma fecha
- **THEN** el sistema responde 409 y no crea el turno

#### Scenario: Crear turno con datos faltantes

- **WHEN** un administrador envía `POST /turnos` sin `fecha`, `hora_inicio`, `hora_fin`, `cancha_id` o `disciplina_id`
- **THEN** el sistema responde 400 y no crea el turno

### Requirement: Modificar turno

El sistema SHALL permitir al administrador modificar un turno existente, revalidando superposición, fechas pasadas y referencias a cancha y disciplina.

#### Scenario: Modificar un turno existente

- **WHEN** un administrador envía `PATCH /turnos/:id` con datos válidos para un turno existente y sin generar superposición en la misma cancha y fecha
- **THEN** el sistema responde 200 con el turno actualizado

#### Scenario: Modificar turno inexistente

- **WHEN** un administrador envía `PATCH /turnos/:id` con un id que no existe
- **THEN** el sistema responde 404

#### Scenario: Modificar turno generando superposición

- **WHEN** un administrador desplaza un turno a un rango que se superpone con otro turno existente de la misma cancha en la misma fecha
- **THEN** el sistema responde 409 y no modifica el turno

#### Scenario: Modificar turno con hora de fin inválida

- **WHEN** un administrador envía `PATCH /turnos/:id` con `hora_fin` anterior o igual a `hora_inicio`
- **THEN** el sistema responde 400 y no modifica el turno

### Requirement: Eliminar turno

El sistema SHALL permitir al administrador eliminar un turno siempre que no tenga una reserva activa asociada.

#### Scenario: Eliminar turno sin reserva activa

- **WHEN** un administrador envía `DELETE /turnos/:id` para un turno sin reserva activa asociada
- **THEN** el sistema responde 204 y el turno deja de existir

#### Scenario: Eliminar turno inexistente

- **WHEN** un administrador envía `DELETE /turnos/:id` con un id que no existe
- **THEN** el sistema responde 404

#### Scenario: Eliminar turno con reserva activa

- **WHEN** un administrador envía `DELETE /turnos/:id` para un turno que tiene una reserva activa asociada
- **THEN** el sistema responde 409 y el turno no se elimina

### Requirement: Consultar disponibilidad

El sistema SHALL permitir a cualquier usuario consultar los turnos disponibles de una cancha para una fecha determinada, sin requerir autenticación.

#### Scenario: Consultar turnos disponibles de una cancha

- **WHEN** un cliente consulta `GET /disponibilidad?cancha_id=<id>&fecha=2026-09-15` para una cancha existente
- **THEN** el sistema responde 200 con solo los turnos de esa cancha y fecha que están disponibles (sin reserva activa)

#### Scenario: Consultar disponibilidad con cancha inexistente

- **WHEN** un cliente consulta `GET /disponibilidad?cancha_id=<id>&fecha=2026-09-15` con un id de cancha que no existe
- **THEN** el sistema responde 404

#### Scenario: Consultar disponibilidad sin turnos disponibles

- **WHEN** un cliente consulta `GET /disponibilidad?cancha_id=<id>&fecha=2026-09-15` y todos los turnos de esa cancha y fecha tienen una reserva activa
- **THEN** el sistema responde 200 con una lista vacía

#### Scenario: Consultar disponibilidad con parámetros faltantes

- **WHEN** un cliente consulta `GET /disponibilidad` sin `cancha_id` o sin `fecha`
- **THEN** el sistema responde 400

### Requirement: Acceso administrativo a mutaciones

El sistema SHALL requerir un usuario autenticado con rol administrador para crear, modificar o eliminar turnos.

#### Scenario: Cliente sin autenticación intenta mutar

- **WHEN** un cliente no autenticado envía `POST /turnos`, `PATCH /turnos/:id` o `DELETE /turnos/:id`
- **THEN** el sistema responde 401 sin realizar la operación

#### Scenario: Usuario autenticado sin rol administrador intenta mutar

- **WHEN** un usuario autenticado cuyo rol no es administrador envía una mutación sobre turnos
- **THEN** el sistema responde 403 sin realizar la operación