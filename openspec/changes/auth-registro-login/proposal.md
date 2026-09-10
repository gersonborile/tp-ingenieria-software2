# Proposal: auth-registro-login

## Why

La plataforma no cuenta hoy con ningún mecanismo para identificar a sus usuarios, pero
casi toda la operación depende de saber quién reserva: solo el socio puede crear, ver y
cancelar **sus propias** reservas, y el administrador debe poder gestionar las de todos.
Sin autenticación, no hay forma de distinguir roles ni de proteger las operaciones de
cada actor.

## What Changes

- Nuevo módulo de autenticación en el backend (NestJS) con registro e inicio de sesión.
- Registro de usuarios: el socio se registra con nombre, contacto, tipo y membresía, más
  credencial de acceso (email + contraseña).
- Inicio de sesión: el usuario se autentica y obtiene un token de sesión (JWT) que
  identifica su identidad y rol en las peticiones posteriores.
- Roles: se distingue `usuario` (socio) de `administrador`; el token transporta el rol.
- Protección de endpoints: las operaciones sensibles exigen sesión válida y, cuando
  corresponde, rol de administrador. Un usuario solo puede acceder a sus propios datos.
- Almacenamiento seguro de contraseñas: se guardan hasheadas (nunca en claro).
- Frontend (Next.js): páginas de registro e inicio de sesión, persistencia de la sesión
  en el cliente y cierre de sesión.

## Capabilities

### New Capabilities

- `user-auth`: registro de usuarios, autenticación con credenciales, emisión/validación
  de tokens de sesión, diferenciación de roles (`usuario`/`administrador`) y protección
  de recursos según identidad y rol.

### Modified Capabilities

Ninguna: es la primera capability del repositorio (no existen specs previas).

## Impact

- **Backend (NestJS)**: nuevos módulos `auth` y `users`; guard de autenticación y guard
  de roles aplicables a otros módulos.
- **Base de datos (Prisma/PostgreSQL)**: modelo `User` existente extendido con email
  único, password hash y rol.
- **Configuración**: secretos/var env para firma de tokens (`JWT_SECRET` y vencimiento).
- **Frontend (Next.js)**: nuevas páginas `/registro` y `/login`, cliente API con envío
  del token y manejo de sesión.
- **Tests (Jest + Supertest)**: casos de registro, login, token inválido/vencido y
  autorización por rol.