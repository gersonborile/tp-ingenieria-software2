# Tasks: auth-registro-login

## 1. Setup del monorepo

- [ ] 1.1 Scaffold backend NestJS en `backend/` (TypeScript) y verificar que `npm run start` levanta el servidor en el puerto configurado
- [ ] 1.2 Inicializar Prisma en `backend/` con datasource PostgreSQL y verificar que `prisma generate` y `prisma migrate dev` funcionan contra la DB local
- [ ] 1.3 Scaffold frontend Next.js (React + TypeScript) en `frontend/` y verificar que la app de inicio renderiza (typecheck y build exitosos)
- [ ] 1.4 Agregar dependencias de auth en backend (`@nestjs/jwt`, `bcrypt`, `class-validator`, `class-transformer`) y verificar instalación sin errores

## 2. Modelo de datos

- [ ] 2.1 Extender el modelo `User` en `schema.prisma` con `email @unique`, `passwordHash` y `role` (enum `usuario | administrador`), y verificar `prisma format` y `prisma validate` sin errores
- [ ] 2.2 Crear migración de Prisma con los nuevos campos y verificar que `prisma migrate dev` aplica la migración sin errores
- [ ] 2.3 Crear seed que registra un usuario administrador inicial y verificar que `prisma db seed` crea el usuario en la DB

## 3. Backend: registro

- [ ] 3.1 Implementar DTO y endpoint `POST /auth/registro` con validación de datos (email válido, campos requeridos, contraseña con requisitos mínimos) y verificar que datos inválidos devuelven 400
- [ ] 3.2 Hash de contraseña con bcrypt antes de persistir y guardado del usuario con rol `usuario` por defecto, verificando en la DB que la contraseña está hasheada
- [ ] 3.3 Rechazar email duplicado con error claro (409) y verificar con una segunda llamada al endpoint
- [ ] 3.4 Excluir `passwordHash` de la respuesta de registro (DTO de salida) y verificar que la respuesta solo expone datos públicos del usuario

## 4. Backend: login y token

- [ ] 4.1 Implementar endpoint `POST /auth/login` que valida email+contraseña y verifica el hash con bcrypt, devolviendo 401 genérico ante credenciales inválidas
- [ ] 4.2 Emitir JWT firmado con `JWT_SECRET` (cargado de variables de entorno) que transporta `userId` y `role`, y verificar que el token se puede decodificar con el payload correcto
- [ ] 4.3 Configurar TTL del token vía `JWT_EXPIRES_IN` y verificar que un token vencido es rechazado
- [ ] 4.4 Crear `.env.example` documentando `JWT_SECRET`/`JWT_EXPIRES_IN` (sin secretos reales) y verificar que `JWT_SECRET` nunca está hardcodeado en el código

## 5. Backend: guards y autorización

- [ ] 5.1 Implementar `JwtAuthGuard` global y verificar con mutación/tests que una ruta protegida rechaza peticiones sin token y con token inválido (401)
- [ ] 5.2 Implementar decorador `@Roles('administrador')` y `RolesGuard`, y verificar que el acceso a una ruta admin con rol `usuario` devuelve 403 y con rol `administrador` funciona
- [ ] 5.3 Exponer endpoint protegido `GET /auth/perfil` y verificar que devuelve los datos del usuario autenticado y nunca los de otro usuario

## 6. Backend: tests automatizados

- [ ] 6.1 Tests e2e (Jest + Supertest) de registro: exitoso, email duplicado y datos inválidos, verificando status codes y que la respuesta no expone `passwordHash`
- [ ] 6.2 Tests e2e de login: credenciales válidas devuelven token, credenciales inválidas devuelven error genérico
- [ ] 6.3 Tests e2e de guards: ruta protegida sin token/inválido/vencido (401) y reglas de rol (403 para no admin), y verificar que toda la suite pasa

## 7. Frontend: registro y login

- [ ] 7.1 Crear página `/registro` con el formulario (nombre, contacto, tipo, membresía, email, contraseña) que consume el endpoint de registro y verificar que muestra éxito y errores (email duplicado, validación)
- [ ] 7.2 Crear página `/login` que consume el endpoint de login, guarda la sesión del usuario en el cliente y verificar que tras loguearse el usuario autenticado llega al área protegida
- [ ] 7.3 Implementar manejo/logout: limpiar sesión en el cliente y verificar que las peticiones posteriores no quedan autenticadas
- [ ] 7.4 Verificar typecheck y build del frontend sin errores

## 8. Verificación integral

- [ ] 8.1 Correr toda la suite de tests del backend y verificar que pasa en un CI simulado local
- [ ] 8.2 Abrir PR de `feature/user-auth` a `main` con al menos 1 aprobación y verificar que la rama está integrada y el pipeline (lint + test + build) es verde