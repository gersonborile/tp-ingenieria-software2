## 1. Navbar, protección de rutas y capa mock

- [ ] 1.1 Crear la capa mock en `lib/` (tipos `Cancha`, `Franja`, `Equipamiento`, `Reserva` y funciones para canchas, equipamiento, crear reserva, próxima reserva y canchas disponibles ahora; las reservas persisten en `localStorage`) y verificar que typecheck, lint y build pasan sin errores.
- [ ] 1.2 Crear el layout protegido (`app/(protegido)/layout.tsx`) con un guard del lado del cliente que lee la sesión de `lib/sesion.ts`, redirige a `/login` sin sesión y no renderiza el contenido hasta resolverla, y verificar que acceder a `/`, `/canchas` o `/canchas/[id]/reservar` sin sesión redirige a `/login`.
- [ ] 1.3 Crear la Navbar compartida (logo "CD" + "Club Deportivo", links "Inicio", "Canchas" y "Mis reservas" placeholder, link activo subrayado, avatar con la inicial) con menú "Cerrar sesión", incluirla en el layout protegido y verificar que se ve en todas las pantallas protegidas y que cerrar sesión redirige a `/login`.

## 2. Pantalla 1 — Canchas y disponibilidad (`/canchas`)

- [ ] 2.1 Implementar `/canchas` con título, subtítulo y barra de filtros (Disciplina, fecha, Horario y botón "Buscar") y verificar que los controles se renderizan y que `?disciplina=` preselecciona la disciplina.
- [ ] 2.2 Listar las canchas con imagen placeholder, nombre, disciplina y franjas de 16:00 a 21:00, con franja libre habilitada y ocupada gris, tachada y deshabilitada, y verificar los estados según los datos mock.
- [ ] 2.3 Aplicar los filtros al hacer click en "Buscar" y verificar que la lista se acota por disciplina y, si se elige un horario, a esa franja.
- [ ] 2.4 Al elegir una franja libre, navegar a `/canchas/[id]/reservar?fecha=...&hora=...` y verificar que la navegación lleva la fecha y la hora elegidas.

## 3. Pantalla 2 — Confirmar reserva (`/canchas/[id]/reservar`)

- [ ] 3.1 Implementar la página con breadcrumb dinámico, título "Confirmar reserva" y la tarjeta "Turno seleccionado" con el botón "Cambiar turno", y verificar que muestra la cancha y el turno recibidos y que "Cambiar turno" navega a `/canchas`.
- [ ] 3.2 Implementar la tarjeta "Equipamiento (opcional)" con checkbox, nombre, "N disponibles" e input de cantidad (mínimo 1, máximo el stock) y verificar que se aplican los límites.
- [ ] 3.3 Implementar la tarjeta "Resumen" (cancha, fecha, equipamiento elegido, pago "Pendiente", monto placeholder) y verificar que se actualiza al cambiar el equipamiento.
- [ ] 3.4 Implementar el botón "Confirmar reserva" y la nota "Podés cancelar hasta 2 horas antes del turno"; al confirmar guarda la reserva en el mock y redirige a `/`, y verificar que la reserva queda guardada.

## 4. Pantalla 3 — Home (`/`)

- [ ] 4.1 Reemplazar la Home actual (quitar el panel de sesión) con el encabezado "Hola, {nombre}", "¿Qué querés hacer hoy?" y el botón "+ Reservar una cancha", y verificar que el botón navega a `/canchas`.
- [ ] 4.2 Implementar la tarjeta "Próxima reserva" con "Ver detalle" y "Cancelar" como placeholder y un mensaje cuando no hay reservas, y verificar que una reserva recién confirmada aparece ahí.
- [ ] 4.3 Implementar la tarjeta "Accesos rápidos" (Tenis, Fútbol 5, Pádel) y verificar que cada acceso navega a `/canchas?disciplina=...` con el filtro aplicado.
- [ ] 4.4 Implementar la sección "Canchas disponibles ahora" con nombre, disciplina, "Libre HH:MM" en verde y botón "Reservar", y verificar que "Reservar" navega a la confirmación con ese turno.

## 5. Verificación final

- [ ] 5.1 Ejecutar typecheck, lint y build del frontend y verificar que terminan sin errores, y recorrer a mano el flujo login → Home → Canchas → Confirmar reserva → Home.
