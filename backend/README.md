# Backend — Sistema de Reserva de Canchas

API del club deportivo: NestJS + PostgreSQL + Prisma. Es el **scaffold** (Fase 3): schema,
migración, seed y configuración base. Los endpoints de negocio se implementan feature por
feature, siguiendo los changes de `../openspec`.

## Requisitos

- Node.js 20 LTS (ver `.nvmrc`; el CI usa la misma versión)
- npm 10 o superior
- PostgreSQL 16 o superior (el CI corre `postgres:16`)

## Configuración

1. Instalar dependencias:

   ```bash
   npm ci
   ```

2. Crear el `.env` a partir del ejemplo y completar la conexión real:

   ```bash
   cp .env.example .env
   ```

   ```env
   DATABASE_URL="postgresql://USUARIO:PASSWORD@localhost:5432/reservas_canchas?schema=public"
   PORT=3001
   CORS_ORIGIN="http://localhost:3000"
   JWT_SECRET="..."
   JWT_EXPIRES_IN="1h"
   SEED_ADMIN_PASSWORD="Admin123!"
   ```

   `.env` está en `.gitignore`: nunca se commitea. `PORT` es 3001 porque el frontend
   Next.js usa el 3000; `CORS_ORIGIN` acepta varios orígenes separados por coma.

## Base de datos local

Windows (PostgreSQL instalado como servicio):

```powershell
Get-Service postgresql-x64-*
Start-Service postgresql-x64-17
```

Con Docker:

```bash
docker run --name reservas-canchas-db -e POSTGRES_USER=club -e POSTGRES_PASSWORD=club -e POSTGRES_DB=reservas_canchas -p 5432:5432 -d postgres:16
```

Después creá la base si no existe:

```bash
psql -U club -d postgres -c "CREATE DATABASE reservas_canchas;"
```

## Migraciones

Las migraciones viven en `prisma/migrations` y **se commitean**. El CI las aplica con
`prisma migrate deploy`.

```bash
npm run db:migrate          # crea/aplica una migración en desarrollo (prisma migrate dev)
npm run db:deploy           # aplica las migraciones existentes (CI, producción)
npm run prisma:generate     # regenera el cliente en src/generated/prisma
npm run db:studio           # Prisma Studio
```

## Seed

Idempotente: se puede correr las veces que haga falta.

```bash
npm run seed                # equivale a npx prisma db seed
```

Carga 3 disciplinas (tenis, fútbol, pádel), un administrador, dos socios, 5 canchas,
turnos para los próximos 3 días, equipamiento con stock y una reserva de ejemplo con su
pago. Usuarios creados:

| Email                       | Rol           | Contraseña                     |
| --------------------------- | ------------- | ------------------------------ |
| `admin@clubdeportivo.test`  | administrador | `SEED_ADMIN_PASSWORD` o `Admin123!` |
| `socio1@clubdeportivo.test` | usuario       | `Socio123!`                    |
| `socio2@clubdeportivo.test` | usuario       | `Socio123!`                    |

## Levantar el servidor

```bash
npm run start:dev     # watch
npm run build && npm run start:prod
```

La API no tiene prefijo global de versión: las specs exponen `/canchas`, `/turnos`,
`/disponibilidad` y `/equipamiento`.

## Tests, lint y build

```bash
npm test              # unitarios (Vitest)
npm run test:e2e      # e2e (Supertest), no necesita base de datos
npm run lint          # oxlint (type-aware)
npm run build         # nest build
```

El e2e mockea `PrismaService`, así que corre sin PostgreSQL. `npm test` es el comando que
ejecuta el CI, después de `prisma generate` y `prisma migrate deploy`.

## Modelo de datos

Definido en `prisma/schema.prisma` a partir de `openspec/config.yaml`:

- `Usuario` — nombre, email único, `passwordHash`, `rol` (`USUARIO`/`ADMINISTRADOR`),
  contacto/tipo/membresía opcionales.
- `Disciplina` — `tenis`, `fútbol`, `pádel`; duración típica y reglas. Entidad propia con
  seed, porque las specs la exponen como dato base de solo lectura (`GET /disciplinas`).
- `Cancha` — nombre único, ubicación, capacidad, `estado`
  (`DISPONIBLE`/`OCUPADA`/`EN_MANTENIMIENTO`) y relación many-to-many con `Disciplina`.
- `Turno` — `canchaId`, `disciplinaId`, `fecha` (`DATE`), `horaInicio`/`horaFin` (`"HH:mm"`)
  y el flag `disponible`, que el change de reservas pone en `false` al reservar.
- `Reserva` — `usuarioId`, `turnoId`, `estado` (`CONFIRMADA`/`CANCELADA`).
- `Equipamiento` — `disciplinaId`, `stock`, `activo` y `precioUnitario`.
- `ReservaEquipamiento` — tabla intermedia con `cantidad` y snapshot de `precioUnitario`.
- `Pago` — `reservaId` único, `monto`, `metodoPago`, `estado`
  (`PENDIENTE`/`PAGADO`/`ANULADO`), `fecha` y `fechaPago`.

Todas las tablas usan UUID, `created_at`/`updated_at` y nombres en `snake_case`.

### Índice único parcial de reservas

`prisma/migrations/0_init/migration.sql` agrega un índice único parcial que impide dos
reservas activas sobre el mismo turno:

```sql
CREATE UNIQUE INDEX "reservas_turno_unico_activo"
  ON "reservas" ("turno_id") WHERE "estado" = 'CONFIRMADA';
```

Como Prisma no declara índices filtrados en el schema, un `prisma migrate dev` futuro puede
proponer dropearlo. Si aparece en el diff, hay que volver a agregarlo al final de la
migración generada.

## Estructura

```
backend/
├── prisma/
│   ├── migrations/       # migraciones versionadas (se commitean)
│   ├── schema.prisma     # modelo de datos
│   └── seed.ts           # seed idempotente
├── prisma7.config.ts     # config del CLI de Prisma 7 (schema, migrations, datasource)
├── src/
│   ├── generated/prisma/ # cliente generado (ignorado por git)
│   ├── prisma/           # PrismaModule + PrismaService (global)
│   ├── app.controller.ts
│   ├── app.module.ts
│   └── main.ts           # ConfigModule, ValidationPipe, CORS
└── test/                 # e2e
```