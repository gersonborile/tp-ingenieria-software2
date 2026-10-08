## Why

El club necesita administrar el catálogo de equipamiento deportivo (raquetas, pelotas, redes, chalecos, etc.) disponible para sus socios. Actualmente no existe ninguna entidad que represente estos ítems en el sistema, por lo que no se pueden consultar, crear ni gestionar inventarios desde la API. Agregar el catálogo con su stock (cantidad disponible por ítem) es prerrequisito para futuras funcionalidades como préstamos o alquileres de equipamiento.

## What Changes

- Modelo de datos Prisma para la entidad `Equipamiento` con campos: `id`, `nombre`, `disciplina_id` (FK a `Disciplina`), `stock_total` (cantidad total en inventario), `stock_disponible` (cantidad hoy disponible), `precio_unitario` (precio de alquiler por unidad) y `activo` (flag para habilitar/deshabilitar). El modelo ya existe en el schema de Prisma (migración `init`).
- API REST para gestión del catálogo de equipamiento:
  - `GET /equipamiento` — listar ítems con filtros por disciplina y disponibilidad (público).
  - `GET /equipamiento/:id` — detalle de un ítem (público).
  - `POST /equipamiento` — crear un ítem (solo administrador).
  - `PATCH /equipamiento/:id` — modificar un ítem (solo administrador).
  - `DELETE /equipamiento/:id` — eliminar un ítem si no tiene préstamos activos (solo administrador).
- `GET /equipamiento?disciplina_id=&disponible=true` — retorna ítems con `stock_disponible` > 0 (disponibilidad derivada, computada en tiempo de respuesta).
- Reglas de negocio:
  - `stock_total`, `stock_disponible` y `precio_unitario` no pueden ser menores que 0, y `stock_disponible` no puede superar a `stock_total`.
  - No se puede eliminar un ítem que tenga un préstamo activo asociado (pudiendo ser eliminado lógicamente vía `activo = false` como alternativa).
  - Un ítem `activo = false` no aparece en listados públicos a menos que se solicite explícitamente.
- Dependencia con `canchas-crud` (el ítem referencia una `Disciplina` existente).
- **BREAKING**: no aplica sobre código existente; este es el primer cambio que crea la capa de equipamiento.

## Capabilities

### New Capabilities
- `equipamiento-catalogo`: Catálogo de equipamiento deportivo del club — crear, listar, consultar, editar y eliminar ítems de equipamiento con gestión de stock total y disponible, precio unitario, filtrado por disciplina, disponibilidad derivada del stock disponible, y autorización admin-only en mutaciones.

### Modified Capabilities
- Ninguna (no existen specs previas aprobadas en `openspec/specs/`).

## Impact

- **Repositorio**: nueva capability `specs/equipamiento-catalogo/spec.md`.
- **Base de datos**: usa la tabla `equipamientos` (modelo `Equipamiento`) ya creada en la migración `init`; no requiere migración nueva.
- **API**: endpoints REST de equipamiento, con autorización admin-only en mutaciones.
- **Dependencias**: no agrega dependencias nuevas más allá de las ya requeridas por NestJS/Prisma.
- **Fuera de alcance**: préstamos/alquileres de equipamiento a socios, reservas, pagos, frontend, autenticación en sí (dependencia externa documentada).
