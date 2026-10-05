# Proposal: frontend-reservas

## Why

El frontend solo tiene hoy las pantallas de login y registro. Todavía no hay pantallas
para ver las canchas, elegir un turno y confirmar una reserva con equipamiento opcional.
Como el backend aún no expone endpoints de canchas, turnos ni reservas, las pantallas se
construyen contra una API mockeada, igual que se hizo con el login. Así el equipo puede
validar el flujo de reserva completo antes de integrar el backend.

## What Changes

- Agregar una navbar compartida con logo, links (Inicio, Canchas, Mis reservas como
  placeholder) y avatar con la inicial del usuario, que además da acceso a cerrar sesión.
- Proteger las rutas con un guard del lado del cliente que lee la sesión de `localStorage`
  y redirige a `/login` si no hay sesión.
- Agregar una capa de API mockeada para canchas, disponibilidad, equipamiento y reservas.
- Implementar la pantalla "Canchas y disponibilidad" (`/canchas`) con filtros y franjas
  horarias.
- Implementar la pantalla "Confirmar reserva" (`/canchas/[id]/reservar`) con equipamiento
  opcional y resumen; al confirmar se guarda la reserva en el mock.
- Implementar la Home (`/`) con la próxima reserva, accesos rápidos y canchas disponibles
  ahora. Reemplaza al panel de sesión actual.
- Describir en `design.md` la estructura visual de cada pantalla, tomada de los wireframes
  de `docs/wireframes/`.

## Capabilities

### New Capabilities
- `frontend-reservations-ui`: interfaz de reservas en Next.js (App Router, Tailwind) con
  rutas protegidas, navbar compartida, API mockeada, consulta de disponibilidad,
  confirmación de reserva y Home.

### Modified Capabilities
- Ninguna. No cambian requisitos de capacidades existentes.

## Impact

- Código del frontend (Next.js, TypeScript, Tailwind).
- Guard de rutas del lado del cliente, apoyado en `lib/sesion.ts`.
- Capa mock en `lib/` para canchas, franjas, equipamiento y reservas.
- Nuevos componentes compartidos (Navbar).
- Nuevas páginas: `/canchas` y `/canchas/[id]/reservar`; la Home `/` se reemplaza.
- El logout, hoy en el panel de sesión de la Home, pasa al menú del avatar.
