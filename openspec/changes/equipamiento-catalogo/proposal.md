## Why

El club necesita administrar el catálogo de equipamiento deportivo (raquetas, pelotas, redes, chalecos, etc.) disponible para sus socios. Actualmente no existe ninguna entidad que represente estos ítems en el sistema, por lo que no se pueden consultar, crear ni gestionar inventarios desde la API. Agregar el catálogo con su stock (cantidad disponible por ítem) es prerrequisito para futuras funcionalidades como préstamos o alquileres de equipamiento.

## What Changes

- Modelo de datos Prisma para la entidad `Equipamiento` con campos: `id`, `nombre`, `disciplina_id` (FK a `Disciplina`), `stock` (cantidad total en inventario), `activo` (flag para habilitar/deshabilitar).
- API REST para gestión del catálogo de equipamiento:
  - `GET /equipamiento` — listar ítems con filtros por disciplina y disponibilidad (público).
  - `GET /equipamiento/:id` — detalle de un ítem (público).
  - `POST /equipamiento` — crear un ítem (solo administrador).
  - `PATCH /equipamiento/:id` — modificar un ítem (solo administrador).
  - `DELETE /equipamiento/:id` — eliminar un ítem si no tiene préstamos activos (solo administrador).
- `GET /equipamiento?disciplina_id=&disponible=true` — retorna ítems con stock > 0 (disponibilidad derivada del stock, computada en tiempo de respuesta).
- Reglas de negocio:
  - El `stock` no puede ser menor que 0.
  - No se puede establecer `stock` a un valor negativo.
  - No se puede eliminar un ítem que tenga un préstamo activo asociado (pudiendo ser eliminado lógicamente vía `activo = false` como alternativa).
  - Un ítem `activo = false` no aparece en listados públicos a menos que se solicite explícitamente.
- Dependencia con `canchas-crud` (el ítem referencia una `Disciplina` existente).
- **BREAKING**: no aplica sobre código existente; este es el primer cambio que crea la capa de equipamiento.

## Capabilities

### New Capabilities
- `equipamiento-catalogo`: Catálogo de equipamiento deportivo del club — crear, listar, consultar, editar y eliminar ítems de equipamiento con gestión de stock e inventario, filtrado por disciplina, disponibilidad derivada del stock, y autorización admin-only en mutaciones.

### Modified Capabilities
- Ninguna (no existen specs previas aprobadas en `openspec/specs/`).

## Impact

- **Repositorio**: nueva capability `specs/equipamiento-catalogo/spec.md`.
- **Base de datos**: nueva tabla `Equipamiento` con clave foránea a `Disciplina`, creada vía migración de Prisma.
- **API**: endpoints REST de equipamiento, con autorización admin-only en mutaciones.
- **Dependencias**: no agrega dependencias nuevas más allá de las ya requeridas por NestJS/Prisma.
- **Fuera de alcance**: préstamos/alquileres de equipamiento a socios, reservas, pagos, frontend, autenticación en sí (dependencia externa documentada).
