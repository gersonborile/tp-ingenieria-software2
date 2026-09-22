## Context

Repositorio vacío (solo README + OpenSpec). No existe `/backend`, tablas, usuarios ni auth; es el primer cambio functional. Stack declarado: NestJS + TypeScript, PostgreSQL + Prisma, testing con Jest + Supertest, monorepo con `/backend`, `/frontend`, `/openspec`. Este diseño define el módulo `Canchas` y el seed de `Disciplinas` (ver proposal.md — Why).

## Goals / Non-Goals

**Goals:**
- Scaffold mínimo del backend NestJS reutilizable por los siguientes cambios (auth, turnos, reservas).
- Cambio autorreferente para el modelo de datos: `Cancha` y `Disciplina` con su relación many-to-many.
- API estable y testeable (e2e) que cubra todas las escenarios del spec `specs/canchas/spec.md`.
- Seam de autorización que el cambio `auth-registro-login` pueda alimentar después sin rediseñar el módulo.

**Non-Goals:**
- Implementar autenticación/JWT (es otro cambio). Acá solo se define el contrato del guard.
- Frontend, reservas/turnos, disponibilidad, equipamiento, pagos, gestión admin de disciplinas.

## Decisions

- **Scaffold monorepo en `/backend`**: NestJS estándar (TypeScript, strict). Se elige Nest CLI porque el stack ya está decidido en `openspec/config.yaml`; no se evalúa Express plano porque no aporta el inyección de dependencias y decoradores que Nest da por defecto.
- **Prisma con many-to-many implícita** entre `Cancha` y `Disciplina`. Alternativa considerada: join-table explícita `CanchaDisciplina`. Se elige implícita por simplicidad del CRUD (se expone `disciplinas` embebidas); si más adelante disciplina por cancha necesita atributos propios, se migra a explícita.
- **Enumerado `CanchaEstado`** con valores `disponible`, `ocupada`, `en_mantenimiento` (normalizados a kebab al exponerlos: `en-mantenimiento`). El spec usa estos estados como contrato observable.
- **IDs tipo UUID** para canchas y disciplinas (generados por Prisma con `crypto`). Alternativa: autoincrement. UUID evita enumeración de recursos en la API pública y no involucra operaciones costosas a esta escala.
- **Validación con `class-validator`/`class-transformer`** sobre DTOs (create/update), con `ValidationPipe` global del Nest. La unicidad del nombre se valida en el servicio (query contra la BD, comparando case-insensitive) porque es una restricción transaccional, no de forma.
- **Capa de acceso a datos con `PrismaService`** (patrón estándar del ecosistema Prisma/Nest). El servicio de canchas orquesta validaciones de negocio + repo.
- **Baja de cancha**: borrado físico solo si no hay `Turno` ni `Reserva` activa referenciando la cancha; caso contrario 409 (requisito del spec). Alternativa considerada: soft-delete vía estado; se descarta porque la creación de turnos/reservas aún no existe y el borrado físico mantiene el modelo simple. Si el futuro necesita auditoría, se evalúa un flag `activo`.
- **Autorización como seam**: decorador `@Roles('admin')` + `AuthzGuard` que lee el rol del principal autenticado. Como `auth-registro-login` aún no existe, el guard consulta una interfaz `AuthPrincipalProvider` con un `current()` tipado (`{ userId, tipo }`); el cambio de auth proveerá su implementación real (JWT). En ausencia de implementación, los e2e tests inyectan un provider de prueba. Operaciones de lectura no usan guard.
- **Filtros de listado**: `?disciplina=` y `?estado=` como query params opcionales, con paginación `page`/`limit` (por defecto `page=1`, `limit=20`). Se evita filtro por nombre por ahora (futuro cambio de búsqueda).
- **Respuestas de error**: `404` no encontrado, `400` validación, `409` conflicto de negocio (nombre duplicado / cancha con referencias), `401` no autenticado, `403` no autorizado, `422` referencia a disciplina inexistente. Cuerpo de error estándar `{ statusCode, message, error }` (formato por defecto de Nest).
- **Seed de disciplinas**: script Prisma seed idempotente (upsert por nombre) que crea tenis, fútbol, pádel al aplicar migración.

## Risks / Trade-offs

- [Auth aún no implementada] → El módulo no depende de código de auth: usa un provider tipado como seam. Con test principal simulado, el comportamiento 401/403 queda verificable antes de que `auth-registro-login` se integre.
- [Repositorio vacío y sin CI] → Los tasks arrancan por el scaffold y verificación local (lint + tests); la integración con GitHub Actions se deja para un cambio de tooling.
- [Many-to-many implícita limita atributos de la relación] → No es requerido hoy; si surge, migración a join explícita sin cambio de API.
- [Doble fuente de verdad de estados (enum Prisma vs contracto API)] → Se centraliza un mapeo único en el módulo para no divergir.
- [PostgreSQL requiere instancia local] → Se documenta en el README del backend (o docker-compose) cómo levantar la DB para los tests e2e.

## Migration Plan

- `prisma migrate dev --name init` en el backend para generar la migración inicial y la DB.
- Seed idempotente: `prisma db seed` (o hook posterior a migrate) que upserta las 3 disciplinas.
- Rollback: tratándose del primer cambio, basta con revertir el PR si algo falla; no hay data en producción.

## Open Questions

- Tipo de datos del rol de usuario (string libre vs enum de Prisma) — depende de `auth-registro-login`; no bloquea este cambio porque el guard solo compara contra el literal `admin`.