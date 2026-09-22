## Why

Una vez que las canchas existen como entidad gestionable, el club necesita definir los turnos (franjas horarias) disponibles en cada cancha para que los socios puedan consultar disponibilidad y crear reservas. Sin turnos, no hay forma de representar cuándo está libre una cancha ni de asociar una reserva a un espacio temporal concreto.

## What Changes

- Modelo de datos Prisma para la entidad `Turno` (franja horaria) con campos: `id`, `cancha_id`, `disciplina_id`, `fecha`, `hora_inicio`, `hora_fin`, vinculada a `Cancha` y `Disciplina` existentes.
- API REST para gestión de turnos:
  - `GET /turnos` — listar turnos con filtros por cancha, disciplina, fecha y estado de disponibilidad (público, lectura).
  - `GET /turnos/:id` — detalle de un turno (público).
  - `POST /turnos` — crear un turno (solo administrador).
  - `PATCH /turnos/:id` — modificar un turno (solo administrador).
  - `DELETE /turnos/:id` — eliminar un turno si no tiene reserva activa asociada (solo administrador).
- `GET /disponibilidad?cancha_id=&fecha=` — endpoint público que retorna los turnos disponibles para una cancha y fecha dada.
- Reglas de negocio:
  - No se pueden crear turnos superpuestos para la misma cancha y fecha.
  - No se pueden crear turnos cuya `hora_fin` sea anterior o igual a `hora_inicio`.
  - No se pueden crear turnos con fecha en el pasado.
  - No se puede eliminar un turno que tenga una reserva activa.
- Dependencia con `canchas-crud` (turnos referencian canchas y disciplinas existentes).
- **BREAKING**: no aplica sobre código existente; este es el primer cambio que crea la capa de turnos.

## Capabilities

### New Capabilities
- `turnos-franjas`: Gestión de turnos (franjas horarias) de las canchas del club — crear, listar, consultar, editar y eliminar turnos; validación de superposición y disponibilidad; endpoint de consulta de disponibilidad por cancha y fecha.

### Modified Capabilities
- Ninguna (no existen specs previas aprobadas en `openspec/specs/`).

## Impact

- **Repositorio**: nueva capability `specs/turnos-franjas/spec.md`.
- **Base de datos**: nueva tabla `Turno` con claves foráneas a `Cancha` y `Disciplina`, creada vía migración de Prisma.
- **API**: endpoints REST de turnos y disponibilidad, con autorización admin-only en mutaciones.
- **Dependencias**: no agrega dependencias nuevas más allá de las ya requeridas por NestJS/Prisma.
- **Fuera de alcance**: reservas, gestión de equipamiento, pagos, frontend, autenticación en sí (dependencia externa documentada).
