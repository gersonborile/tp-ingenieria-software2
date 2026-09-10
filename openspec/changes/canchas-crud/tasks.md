## 1. Scaffold del backend

- [ ] 1.1 Inicializar el proyecto NestJS en `backend/` (Nest CLI, TypeScript strict, ESLint/Prettier) y verificar que `npm run start` levanta el health default en `/`
- [ ] 1.2 Configurar Jest + Supertest para tests e2e y verificar que `npm run test:e2e` corre el spec de ejemplo (`app.e2e-spec.ts`)
- [ ] 1.3 Instalar y configurar `prisma`/`@prisma/client`, `class-validator`/`class-transformer` y verificar que el `ValidationPipe` global está registrado en `AppModule`
- [ ] 1.4 Documentar en `backend/README.md` cómo levantar PostgreSQL y ejecutar migraciones/seed, y verificar que el documento refleja los comandos reales

## 2. Modelo de datos y seed

- [ ] 2.1 Definir en `schema.prisma` los modelos `Cancha` (id UUID, nombre único case-insensitive, ubicacion, capacidad, estado enum) y `Disciplina` (id UUID, nombre único) con relación many-to-many implícita, y verificar que `prisma generate` compila el schema
- [ ] 2.2 Aplicar migración inicial (`prisma migrate dev --name init`) y verificar que las tablas `Cancha`, `Disciplina` y `_CanchaToDisciplina` existen en la BD
- [ ] 2.3 Implementar el seed idempotente (upsert por nombre) de las disciplinas tenis, fútbol y pádel, y verificar ejecutando el seed dos veces seguidas sin duplicados

## 3. Consulta de disciplinas

- [ ] 3.1 Implementar `GET /disciplinas` (controller + servicio + PrismaService) y verificar que devuelve tenis, fútbol y pádel con status 200 en un request real

## 4. CRUD de canchas

- [ ] 4.1 Crear DTO `CreateCanchaDto` (nombre, ubicacion, capacidad > 0, estado, disciplinas != vacío) con `class-validator` y DTO `UpdateCanchaDto` parcial, y verificar que el ValidationPipe rechaza payloads inválidos con 400
- [ ] 4.2 Implementar `GET /canchas` con filtros opcionales `disciplina` y `estado` y paginación `page`/`limit`, y verificar con tests de integración que los filtros y la paginación devuelven el subconjunto esperado
- [ ] 4.3 Implementar `GET /canchas/:id` y verificar que responde 200 con las disciplinas embebidas para un id existente y 404 para un id inexistente
- [ ] 4.4 Implementar `POST /canchas` en el servicio (validación de nombre duplicado case-insensitive → 409; disciplina inexistente → 422; estado válido) y verificar cada caso con tests e2e
- [ ] 4.5 Implementar `PATCH /canchas/:id` (mismas validaciones, 404 si no existe, 409 si el nombre pasa a duplicarse) y verificar con tests e2e
- [ ] 4.6 Implementar `DELETE /canchas/:id` (204 si se borra, 404 si no existe, 409 si hay turnos/reservas activos referenciando la cancha) y verificar con tests e2e

## 5. Autorización admin-only

- [ ] 5.1 Crear el decorador `@Roles(...)` y el guard `AuthzGuard` que lee el rol desde la interfaz `AuthPrincipalProvider` (seam, ver design.md), y verificar que el guard se monta en los endpoints de mutación
- [ ] 5.2 Proveer una implementación de `AuthPrincipalProvider` de prueba para tests e2e y verificar que las mutaciones sin principal → 401 y con rol distinto a `admin` → 403
- [ ] 5.3 Verificar que los endpoints de lectura (`GET /canchas*`, `GET /disciplinas`) siguen accesibles sin autenticación

## 6. Calidad y cierre

- [ ] 6.1 Correr el suite completo (`npm run lint`, `npm run test:e2e`) y verificar que pasa en verde
- [ ] 6.2 Revisar que los tests e2e cubren cada escenario del spec `specs/canchas/spec.md` y agregar los faltantes (verificar cobertura escenario a escenario)