## 1. Contrato de API y datos

- [ ] 1.1 Crear modelo Prisma `EquipmentItem` (tabla `equipment_items`, `totalStock`/`availableStock`, `name` único, UUID) y verificar que `prisma migrate dev` y `prisma generate` corren sin errores
- [ ] 1.2 Definir DTOs con class-validator (`CreateEquipmentDto` y `UpdateEquipmentDto` con `name`, `description`, `category`, `totalStock`, `availableStock`; min 0 y `availableStock <= totalStock`) y verificar con unit tests que rechazan payloads inválidos
- [ ] 1.3 Documentar en OpenAPI el contrato `/api/v1/equipamiento*` (4 endpoints: GET, POST, PUT/:id, DELETE/:id; códigos 200/201/204/400/401/403/404/409) y verificar que coincide con los escenarios de `specs/equipment/spec.md`

## 2. Implementación backend

- [ ] 2.1 Crear `EquipmentModule` siguiendo el patrón del repo (controller + service + repository delgado sobre Prisma) y verificar que compila y se registra en `AppModule`
- [ ] 2.2 Implementar `GET /equipamiento` (array plano con todos los items y su stock) y verificar con test e2e (200, 401)
- [ ] 2.3 Implementar `POST /equipamiento` con `availableStock = totalStock` inicial y catch de `P2002` → 409 y verificar con test e2e (201, 409, 400 con stock negativo, 403 socio)
- [ ] 2.4 Implementar `PUT /equipamiento/:id` (reemplazo completo incluyendo stock, 404, 409 por duplicado, 400 si `availableStock > totalStock` o negativo, 403 socio) y verificar con test e2e
- [ ] 2.5 Implementar `DELETE /equipamiento/:id` (hard delete, 204, 404, 403 socio) y verificar con test e2e
- [ ] 2.6 Aplicar guards por rol: lectura sin `@Roles()`, escritura/eliminación `@Roles(ADMIN)` y verificar 403 en tests de roles

## 3. Unit tests de service

- [ ] 3.1 Cubrir en `EquipmentService` las invariantes: creación inicializa `availableStock = totalStock` y el `PUT` mantiene `0 <= availableStock <= totalStock`, verificando que los tests de Jest pasan

## 4. Frontend

- [ ] 4.1 Implementar página de catálogo de equipamiento (listado con `availableStock`/`totalStock` por item) y verificar que consume `GET /equipamiento` mostrando los datos reales
- [ ] 4.2 Implementar pantallas admin de alta/edición (PUT) y eliminación de items y verificar flujo completo contra el backend en local
- [ ] 4.3 Ocultar acciones de creación/edición/eliminación si el usuario no es `admin` y verificar que `socio` no ve formularios de gestión

## 5. Integración y verificación

- [ ] 5.1 Correr `npm run test` (unit) y los tests e2e de equipamiento y verificar que toda la suite pasa
- [ ] 5.2 Revisar cada escenario de `specs/equipment/spec.md` contra el API desplegado en local y confirmar que se cumplen los códigos de respuesta y los invariantes de stock