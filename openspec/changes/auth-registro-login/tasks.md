# Tasks: auth-registro-login

## 1. Setup del monorepo

- [x] 1.1 Scaffold backend NestJS en `backend/` (TypeScript) y verificar que `npm run start` levanta el servidor en el puerto configurado
- [x] 1.2 Inicializar Prisma en `backend/` con datasource PostgreSQL y verificar que `prisma generate` y `prisma migrate dev` funcionan contra la DB local
- [x] 1.3 Scaffold frontend Next.js (React + TypeScript) en `frontend/` y verificar que la app de inicio renderiza (typecheck y build exitosos)
- [x] 1.4 Agregar dependencias de auth en backend (`@nestjs/jwt`, `bcrypt`, `class-validator`, `class-transformer`) y verificar instalación sin errores

## 2. Modelo de datos

- [x] 2.1 Extender el modelo `User` en `schema.prisma` con `email @unique`, `passwordHash` y `role` (enum `usuario | administrador`), y verificar `prisma format` y `prisma validate` sin errores (Nota: modelo es `Usuario` en schema; enum es `USUARIO | ADMINISTRADOR`; campo `passwordHash` mapeado a `password_hash`; `rol` default `USUARIO`)
- [x] 2.2 Crear migración de Prisma con los nuevos campos y verificar que `prisma migrate dev` aplica la migración sin errores
- [x] 2.3 Crear seed que registra un usuario administrador inicial y verificar que `prisma db seed` crea el usuario en la DB

## 3. Backend: registro

- [x] 3.1 Implementar DTO y endpoint `POST /auth/register` (ruta real implementada) con validación de datos (email válido, campos requeridos, contraseña con requisitos mínimos) y verificar que datos inválidos devuelven 400 (DTOs con class-validator)
- [x] 3.2 Hash de contraseña con bcrypt antes de persistir y guardado del usuario con rol `usuario` por defecto, verificando en la DB que la contraseña está hasheada (Nota: rol persistido con enum Prisma `USUARIO`)
- [x] 3.3 Rechazar email duplicado con error claro (409) y verificar con una segunda llamada al endpoint
- [x] 3.4 Excluir `passwordHash` de la respuesta de registro (DTO de salida) y verificar que la respuesta solo expone datos públicos del usuario

## 4. Backend: login y token

- [x] 4.1 Implementar endpoint `POST /auth/login` que valida email+contraseña y verifica el hash con bcrypt, devolviendo 401 genérico ante credenciales inválidas
- [x] 4.2 Emitir JWT firmado con `JWT_SECRET` (cargado de variables de entorno) que transporta `userId`, `email` y `rol`, y verificar que el token se puede decodificar con el payload correcto (Nota: payload incluye también `email`; claim/propiedad es `rol` para el enum)
- [x] 4.3 Configurar TTL del token vía `JWT_EXPIRES_IN` y verificar que un token vencido es rechazado
- [x] 4.4 Crear `.env.example` documentando `JWT_SECRET`/`JWT_EXPIRES_IN` (sin secretos reales) y verificar que `JWT_SECRET` nunca está hardcodeado en el código

## 5. Backend: guards y autorización

- [x] 5.1 Implementar `JwtAuthGuard` global y verificar con mutación/tests que una ruta protegida rechaza peticiones sin token y con token inválido (401) (Nota: guard global aplicado vía `APP_GUARD`; `@Public()` marca rutas abiertas)
- [x] 5.2 Implementar decorador `@Roles('administrador')` y `RolesGuard`, y verificar que el acceso a una ruta admin con rol `usuario` devuelve 403 y con rol `administrador` funciona
- [x] 5.3 Exponer endpoint protegido `GET /auth/perfil` y verificar que devuelve los datos del usuario autenticado y nunca los de otro usuario

## 6. Backend: tests automatizados

- [x] 6.1 Tests e2e (Vitest + Supertest) de registro: exitoso, email duplicado y datos inválidos, verificando status codes y que la respuesta no expone `passwordHash` (Nota: implementado con Vitest)
- [x] 6.2 Tests e2e de login: credenciales válidas devuelven token, credenciales inválidas devuelven error genérico
- [x] 6.3 Tests e2e de guards: ruta protegida sin token/inválido/vencido (401) y reglas de rol (403 para no admin), y verificar que toda la suite pasa (Nota: 15 unitarios y 18 e2e con Vitest)

## 7. Frontend: registro y login

- [x] 7.1 Crear página `/registro` con el formulario (nombre, contacto, email, contraseña) que consume el endpoint de registro y verificar que muestra éxito y errores (email duplicado, validación)
- [x] 7.2 Crear página `/login` que consume el endpoint de login, guarda la sesión del usuario en el cliente y verificar que tras loguearse el usuario autenticado llega al área protegida
- [x] 7.3 Implementar manejo/logout: limpiar sesión en el cliente y verificar que las peticiones posteriores no quedan autenticadas
- [x] 7.4 Verificar typecheck y build del frontend sin errores

## 8. Verificación integral

- [x] 8.1 Correr toda la suite de tests del backend y verificar que pasa en un CI simulado local (15 unitarios + 18 e2e con Vitest)
- [ ] 8.2 Abrir PR de `feature/user-auth` a `main` con al menos 1 aprobación y verificar que la rama está integrada y el pipeline (lint + test + build) es verde