## 1. Contrato de API y datos

- [ ] 1.1 Crear modelos Prisma `Rental` (FK unique a `reservations`) y `RentalItem` (FK a `equipment_items`, `quantity > 0`, `pricePerUnit`/`totalAmount` Decimal, unique `(rentalId, equipmentItemId)`) y agregar `pricePerUnit` en `EquipmentItem`; verificar que `prisma migrate dev` y `prisma generate` corren sin errores
- [ ] 1.2 Definir `CreateRentalDto` (`items: { equipmentId, quantity }[]` no vacío, sin repetir, quantity min 1) y verificar con unit tests que rechaza payloads inválidos
- [ ] 1.3 Documentar en OpenAPI `POST /api/v1/reservas/:id/alquiler` (códigos 200/201/400/401/403/404/409, montos) y verificar que coincide con los escenarios de `specs/rentals/spec.md`

## 2. Implementación backend

- [ ] 2.1 Crear `RentalsModule` siguiendo el patrón del repo (controller + service + repository delgado sobre Prisma) y verificar que compila y se registra en `AppModule`
- [ ] 2.2 Implementar `POST /reservas/:id/alquiler` transaccional: reserva inexistente → 404, reserva `cancelled` → 409, alquiler existente (unique) → 409, equipamiento inexistente → 404, descuento atómico (`updateMany` con `availableStock >= quantity`, 0 filas → 409 + rollback), 201; verificar con test e2e
- [ ] 2.3 Implementar montos: leer `pricePerUnit` del catálogo, persistir snapshot en `RentalItem`, calcular `totalAmount` por item y total del alquiler con `Decimal`; verificar con test e2e que los montos quedan congelados
- [ ] 2.4 Ajustar `PATCH /reservas/:id/cancelar` para liberar en la misma transacción el `availableStock` de los `RentalItem` del alquiler asociado (con cap en `totalStock`) y verificar con test e2e que el stock vuelve
- [ ] 2.5 Aplicar permisos: `socio` solo sobre su reserva (403 si es ajena), `admin`/`recepcionista` sobre cualquier reserva, 401 sin token; verificar con tests de roles
- [ ] 2.6 Quitar el campo `items` del DTO/controller de `POST /reservas` y adaptar los tests e2e de reservas para que no envíen equipamiento en la creación

## 3. Unit tests de service

- [ ] 3.1 Cubrir en `RentalService` cálculos de montos (pricePerUnit × quantity, total del alquiler), descuento/liberación de stock, un-alquiler-por-reserva y permisos por titularidad, verificando que los tests de Jest pasan

## 4. Frontend

- [ ] 4.1 Implementar flujo de alquiler sobre una reserva existente (seleccionar equipamiento del catálogo con precio, cantidades y total) y verificar contra el backend en local
- [ ] 4.2 Quitar el selector de equipamiento del formulario de nueva reserva y mostrar el alquiler y sus montos en "mis reservas"; verificar los datos reales contra `GET /reservas/mis`
- [ ] 4.3 Mostrar/ocultar la acción "alquilar" según rol y titularidad y verificar que un `socio` no ve la acción sobre reservas ajenas

## 5. Integración y verificación

- [ ] 5.1 Correr `npm run test` (unit) y los tests e2e del flujo completo equipamiento → reserva → alquiler → cancelación y verificar que toda la suite pasa y el stock queda consistente
- [ ] 5.2 Revisar los escenarios de `specs/rentals/spec.md`, `specs/reservations/spec.md` y `specs/equipment/spec.md` contra el API desplegado en local y confirmar códigos, estados, montos e invariantes de stock