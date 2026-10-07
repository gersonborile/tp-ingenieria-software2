## 1. Modelo de datos del Equipamiento

- [ ] 1.1 Verificar que el modelo `Equipamiento` del `schema.prisma` (`nombre`, `disciplinaId` FK a `Disciplina`, `stockTotal`, `stockDisponible`, `precioUnitario`, `activo`) coincide con el spec y que `prisma generate` compila el schema
- [ ] 1.2 Aplicar las migraciones existentes (`prisma migrate deploy`) y verificar que la tabla `equipamientos` con su FK a `disciplinas` existe en la BD
- [ ] 1.3 Crear el helper de disponibilidad del módulo (computa `disponible = stockDisponible > 0`) y verificar con un unit test que un ítem con `stockDisponible = 0` reporta `disponible = false` y con `stockDisponible > 0` reporta `disponible = true`

## 2. Consulta del catálogo

- [ ] 2.1 Crear el módulo `Equipamiento` (controller + servicio + DTOs) en `backend/src/equipamiento` y verificar que se registra en `AppModule` y el health check sigue en `/`
- [ ] 2.2 Implementar `GET /equipamiento` con filtros opcionales `disciplina_id`, `disponible`, `incluir_inactivos` (default `false`) y paginación `page`/`limit`, y verificar con tests de integración que los filtros y la paginación devuelven el subconjunto esperado y que cada ítem incluye `disponible`
- [ ] 2.3 Implementar `GET /equipamiento/:id` y verificar que responde 200 con el ítem (disciplina, `stock_total`, `stock_disponible`, `precio_unitario`, `activo` y `disponible`) para un id existente y 404 para un id inexistente

## 3. Stock e inventario

- [ ] 3.1 Verificar con tests e2e que el listado público no incluye ítems con `activo = false`, y que `GET /equipamiento?incluir_inactivos=true` sí los incluye
- [ ] 3.2 Verificar con tests e2e que `disponible` se recalcula tras modificar el `stock_disponible` de un ítem y que un ítem con `stock_disponible = 0` NO aparece al filtrar `disponible=true`

## 4. Mutaciones de equipamiento (admin)

- [ ] 4.1 Crear `CrearEquipamientoDto` y `ActualizarEquipamientoDto` (parcial) con `class-validator` (`nombre` no vacío, `disciplina_id` UUID, `stock_total` entero `>= 0`, `precio_unitario` numérico `>= 0`) y verificar que el `ValidationPipe` rechaza payloads inválidos con 400
- [ ] 4.2 Implementar `POST /equipamiento` en el servicio (validar existencia de disciplina → 422, `stock_total` o `precio_unitario` negativos → 400, responder 201 con `stock_disponible = stock_total`, `activo = true` y `disponible = stock_disponible > 0`) y verificar cada caso con tests e2e
- [ ] 4.3 Implementar `PATCH /equipamiento/:id` (mismas validaciones, `stock_disponible` no mayor que `stock_total` → 400, 404 si no existe, recalcular `disponible`) y verificar con tests e2e, incluyendo la desactivación con `activo = false`
- [ ] 4.4 Implementar `DELETE /equipamiento/:id` (204 si el `PrestamosProvider` reporta sin préstamos activos, 404 si no existe, 409 si reporta préstamo activo) y verificar el 409 con un provider de prueba

## 5. Autorización admin-only

- [ ] 5.1 Montar `@Roles('admin')` + `AuthzGuard` (mismo seam `AuthPrincipalProvider` que canchas) sobre `POST/PATCH/DELETE /equipamiento` y verificar que el guard aplica en esas rutas
- [ ] 5.2 Verificar con tests e2e que las mutaciones sin principal → 401 y con rol distinto a `admin` → 403, y que `GET /equipamiento*` siguen accesibles sin autenticación

## 6. Calidad y cierre

- [ ] 6.1 Correr el suite completo (`npm run lint`, `npm run test:e2e`) y verificar que pasa en verde
- [ ] 6.2 Revisar que los tests e2e cubren cada escenario del spec `specs/equipamiento-catalogo/spec.md` y agregar los faltantes (verificar cobertura escenario a escenario)