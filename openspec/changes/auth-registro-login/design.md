# Design: auth-registro-login

## Context

El repositorio no tiene aún código de backend ni frontend (solo `openspec/`). La
capability `user-auth` es la primera en implementarse y sentará las bases de seguridad
para el resto del sistema de reservas. El modelo `User` previsto en el dominio es
`(id, nombre, tipo, contacto, membresía)`; este cambio lo extiende con las credenciales
de acceso. Ver `proposal.md` para la motivación y `specs/user-auth/spec.md` para el
contrato de comportamiento.

## Goals / Non-Goals

**Goals:**
- Autenticación stateless escalable y simple de integrar en los futuros módulos del
  backend (reservas, canchas, pagos) mediante guards reutilizables.
- Almacenamiento seguro de contraseñas (hash) y emisión de tokens que transportan la
  identidad y el rol del usuario.
- Distinción clara entre `usuario` y `administrador` para proteger recursos.

**Non-Goals:**
- Password recovery / reset de contraseña.
- Refresh tokens, multi-factor authentication (MFA), OAuth/social login.
- CRUD de usuarios para administradores (se abordará en otra capability).

## Decisions

**JWT (Bearer token stateless) en lugar de sesiones en servidor.**
Se emite un JWT firmado con `JWT_SECRET` en el login; el cliente lo envía en el header
`Authorization: Bearer <token>`. Es la opción más simple para una API consumida por un
SPA/Next.js en un monorepo y evita estado de sesión en el backend.
*Alternativa considerada:* cookies de sesión (express-session) — descartada por requerir
estado en servidor y por ser menos natural para frontend/backend separados.

**bcrypt para hash de contraseñas.**
Se usa bcrypt con factor de costo configurable. *Alternativa:* argon2 — válida, pero
bcrypt es el estándar más difundido en el ecosistema Node/NestJS.

**Guard global de autenticación + guard de roles.**
Un `JwtAuthGuard` global valida el token en cada request; un `RolesGuard` aplica
decoradores `@Roles('administrador')` donde corresponda. Esto permite proteger los
futuros módulos con mínima configuración.

**Modelo de datos: extensión de `User` en Prisma.**
Se agregan a `User`: `email @unique`, `passwordHash`, `role` (enum `usuario |
administrador`). La contraseña nunca se serializa en respuestas (se excluye con select o
DTO de salida).

**Validación con class-validator + ValidationPipe global.**
Los DTOs de registro y login validan formato de email y requisitos de contraseña.

**Seed de administrador inicial.**
Script de seed que crea el primer usuario con rol `administrador`, permitiendo operar el
sistema desde el inicio.

## Risks / Trade-offs

- [JWT stateless: no se puede invalidar un token emitido (logout solo es local)] → TTL
  corto (`JWT_EXPIRES_IN`) mitigando ventanas de exposición.
- [Exposición del `JWT_SECRET` compromete toda la autenticación] → Se maneja por
  variable de entorno, nunca en el repositorio; documentado en `.env.example`.
- [Ataques de timing/fuerza bruta en login] → Mensaje de error genérico ("credenciales
  inválidas") que no revela cuál dato falló; email único en registro evita enumeración
  indirecta.
- [Almacenar token en el cliente expone a XSS] → El token solo viaja en el header
  Authorization y no se persiste en `localStorage` si se aplica el frontend (decisión
  de implementación de página de sesión).

## Migration Plan

Referencia de implementación en el monorepo vacío:
1. Rama `feature/user-auth` sobre `main`.
2. Scaffold del backend (NestJS + Prisma) y frontend (Next.js) si no existen.
3. Migración de Prisma que agrega los campos de credenciales a `User`.
4. Rollback: reversión del PR; la migración es aditiva (no elimina datos).

## Open Questions

Ninguna — los supuestos tomados (rol inicial solo vía seed, token Bearer, logout local)
están alineados con el spec y no requieren redefinir el enfoque.