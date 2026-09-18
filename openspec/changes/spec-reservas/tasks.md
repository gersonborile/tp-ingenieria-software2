## 1. Contrato de API y datos

- [ ] 1.1 Crear modelos Prisma `Reservation` (`status` `CONFIRMED|CANCELLED`, FK a `Member` y `Court`, `startAt`) y `ReservationItem` (FK a `Reservation` y `equipment_items`, `quantity > 0`) con unique `(courtId, startAt)` y verificar que `prisma migrate dev` y `prisma generate` corren sin errores
- [ ] 1.2 Definir `CreateReservationDto` (courtId UUID, date ISO, `startTime` con `@Matches(/^([0-1]\d|2[0-3]):00$/)`, `memberId?`, `items?: { equipmentId, quantity }[]` con quantity min 1) y verificar con unit tests que rechazan payloads inválidos
- [ ] 1.3 Documentar en OpenAPI el contrato `/api/v1/reservas` (POST, GET /mis, PATCH /:id/cancelar; códigos 200/201/400/401/403/404/409, estado `confirmed`/`cancelled`) y verificar que coincide con los escenarios de `specs/reservations/spec.md`

## 2. Implementación backend

- [ ] 2.1 Crear `ReservationsModule` siguiendo el patrón del repo (controller + service + repository delgado sobre Prisma) y verificar que compila y se registra en `AppModule`
- [ ] 2.2 Implementar `POST /reservas` transaccional: validar slot (fecha futura, hora exacta), cancha existente (404), insertar reserva y detectar overlap por unique + catch `P2002` → 409; verificar con test e2e (201, 409 slot ocupado, 400 franja inválida/fecha pasada, 404 cancha, 401)
- [ ] 2.3 Integrar equipamiento en `POST /reservas`: `updateMany` atómico con `availableStock >= quantity` (0 filas → 409 + rollback), equipamiento inexistente → 404, descuento persistido; verificar con test e2e y asserts de stock
- [ ] 2.4 Implementar `GET /reservas/mis` con titularidad: `socio` ve solo su member, `admin`/`recepcionista` ven todas con `?memberId=` opcional, `socio` con memberId ajeno → 403; verificar con test e2e (200, 403, 401)
- [ ] 2.5 Implementar `PATCH /reservas/:id/cancelar`: ventana ≥ 2h antes de `startAt`, transición `CONFIRMED → CANCELLED` (ya cancelada → 409), liberación de stock con cap en `totalStock`, `socio` ajeno → 403, inexistente → 404; verificar con test e2e
- [ ] 2.6 Resolver rol y member desde JWT en el service para POST/GET/PATCH y verificar que un `socio` no puede actuar en nombre de otro miembro

## 3. Unit tests de service

- [ ] 3.1 Cubrir en `ReservationService` solapamiento, validación de slots, ventana de cancelación (2h), permisos por titularidad y liberación de stock acotada, verificando que los tests de Jest pasan

## 4. Frontend

- [ ] 4.1 Implementar página "mis reservas" (listado con estado, cancha, fecha/hora e items de equipamiento) y verificar que consume `GET /reservas/mis`
- [ ] 4.2 Implementar flujo de nueva reserva (cancha + franja + equipamiento opcional) y verificar que muestra los `409` de "franja ocupada"/"stock insuficiente" y el `201`
- [ ] 4.3 Implementar cancelación con confirmación (mostrar/ocultar según rol y titularidad) y verificar el flujo completo contra el backend en local

## 5. Integración y verificación

- [ ] 5.1 Correr `npm run test` (unit) y los tests e2e de reservas y verificar que toda la suite pasa
- [ ] 5.2 Revisar cada escenario de `specs/reservations/spec.md` contra el API desplegado en local y confirmar códigos de respuesta, estados y que el stock de `equipment_items` se descuenta/libera correctamente