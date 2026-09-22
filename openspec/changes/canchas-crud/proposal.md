## Why

El sistema de reservas del club necesita que las canchas (tenis, fútbol, pádel) existan como entidad gestionable antes de poder reservar turnos. Hoy no hay ninguna funcionalidad ni código; el administrador no tiene forma de dar de alta, consultar, modificar o dar de baja las canchas del club.

## What Changes

- Crear el backend NestJS con el primer módulo funcional: **Canchas** (este cambio incluye el scaffold inicial del proyecto `backend/`).
- Modelo de datos con Prisma/PostgreSQL para las entidades `Cancha` y `Disciplina`, con seed de disciplinas fijas (tenis, fútbol, pádel).
- API REST CRUD de canchas:
  - `GET /canchas` — listar canchas (público, lectura, con filtros por disciplina y estado).
  - `GET /canchas/:id` — detalle de una cancha (público, lectura).
  - `POST /canchas`, `PATCH /canchas/:id`, `DELETE /canchas/:id` — solo administrador.
- Reglas de negocio: las canchas solo pueden tener los estados "disponible", "ocupada" y "en mantenimiento"; no se puede eliminar una cancha que tiene turnos o reservas activas asociados.
- Dependencia con el cambio `auth-registro-login`: la autorización administrativa depende del rol `tipo` del usuario autenticado. Este cambio define los requisitos de autorización y deja documentada la dependencia; se integra con el mecanismo de auth cuando dicho cambio lo provea.
- **BREAKING**: no aplica — no existe código previo.

## Capabilities

### New Capabilities
- `canchas`: Gestión de canchas del club — crear, listar, consultar, editar y dar de baja canchas, cada una asociada a una o más disciplinas con estado definido; incluye la provisión de las disciplinas base (tenis, fútbol, pádel) como datos referenciales de solo lectura.

### Modified Capabilities
- Ninguna (no existen specs previas en `openspec/specs/`).

## Impact

- **Repositorio**: se crea el directorio `backend/` (NestJS + TypeScript + Prisma) tal como define la estructura de monorepo en `openspec/config.yaml`.
- **Base de datos**: nuevas tablas `Cancha` (con relación many-to-many a `Disciplina`) y `Disciplina`, creadas vía migración de Prisma; seed de disciplinas.
- **API**: endpoints REST de canchas con autorización admin-only en las mutaciones.
- **Dependencias**: `@nestjs/*`, `prisma`/`@prisma/client`, `class-validator`/`class-transformer`, `jest`, `supertest` en el backend.
- **OpenSpec**: nueva capability `specs/canchas/spec.md`.
- **Fuera de alcance**: reservas/turnos, disponibilidad, frontend, gestión de disciplinas (solo seed), gestión de equipamiento, pagos, y el mecanismo de autenticación en sí (dependencia externa documentada).