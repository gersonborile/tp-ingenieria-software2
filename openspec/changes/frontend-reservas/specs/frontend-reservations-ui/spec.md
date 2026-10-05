## Purpose

Interfaz de reservas para socios del club: ver canchas y su disponibilidad, elegir un
turno, confirmar una reserva con equipamiento opcional y ver una Home con la próxima
reserva. Todas las pantallas están protegidas por sesión, comparten una navbar y consumen
una API mockeada hasta que el backend exponga los endpoints correspondientes.

## ADDED Requirements

### Requirement: Rutas protegidas por sesión
El sistema SHALL redirigir a `/login` a todo usuario sin sesión activa que intente acceder
a `/`, `/canchas` o `/canchas/[id]/reservar`. La sesión SHALL leerse del almacenamiento
del cliente (`localStorage`).

#### Scenario: Acceso a la Home sin sesión
- **WHEN** un usuario sin sesión navega a `/`
- **THEN** el sistema lo redirige a `/login`

#### Scenario: Acceso a canchas sin sesión
- **WHEN** un usuario sin sesión navega a `/canchas`
- **THEN** el sistema lo redirige a `/login`

#### Scenario: Acceso a la confirmación sin sesión
- **WHEN** un usuario sin sesión navega a `/canchas/[id]/reservar`
- **THEN** el sistema lo redirige a `/login`

#### Scenario: Acceso con sesión
- **WHEN** un usuario con sesión activa navega a una ruta protegida
- **THEN** el sistema muestra la pantalla solicitada con la navbar

### Requirement: Navbar compartida
El sistema SHALL mostrar en todas las pantallas protegidas una navbar con el logo "CD" y
"Club Deportivo" a la izquierda, los links "Inicio", "Canchas" y "Mis reservas" centrados
(el de la ruta actual subrayado) y un avatar circular con la inicial del usuario a la
derecha. "Mis reservas" SHALL permanecer como link placeholder sin pantalla propia. El
avatar SHALL abrir un menú con la opción "Cerrar sesión".

#### Scenario: Elementos de la navbar
- **WHEN** un usuario con sesión ve cualquier pantalla protegida
- **THEN** la navbar muestra "CD" y "Club Deportivo", los links "Inicio", "Canchas" y "Mis
  reservas", y un avatar circular con la inicial del usuario

#### Scenario: Link activo subrayado
- **WHEN** el usuario está en `/canchas`
- **THEN** el link "Canchas" se muestra subrayado

#### Scenario: Mis reservas es un placeholder
- **WHEN** el usuario hace click en "Mis reservas"
- **THEN** el link no navega a ninguna pantalla nueva

#### Scenario: Cerrar sesión desde el avatar
- **WHEN** el usuario abre el menú del avatar y elige "Cerrar sesión"
- **THEN** el sistema elimina la sesión y redirige a `/login`

### Requirement: Pantalla Canchas y disponibilidad
El sistema SHALL ofrecer `/canchas` con el título "Canchas y disponibilidad", el subtítulo
"Elegí disciplina, fecha y horario para ver los turnos libres", una barra de filtros
(Disciplina: Todas, Tenis, Fútbol 5, Pádel; fecha; Horario: Cualquiera y cada franja) con un
botón "Buscar", y una lista de canchas donde cada una muestra imagen placeholder, nombre,
disciplina y botones de franja horaria de 16:00 a 21:00.

#### Scenario: Encabezado y filtros
- **WHEN** un usuario con sesión navega a `/canchas`
- **THEN** la pantalla muestra el título, el subtítulo, el select de disciplina con las
  opciones "Todas", "Tenis", "Fútbol 5" y "Pádel", el input de fecha, el select de horario
  y el botón "Buscar"

#### Scenario: Filtrar al buscar
- **WHEN** el usuario elige una disciplina, una fecha o un horario y hace click en "Buscar"
- **THEN** la lista muestra solo las canchas de esa disciplina y, si eligió un horario,
  solo esa franja en cada cancha

#### Scenario: Disciplina recibida por parámetro
- **WHEN** el usuario navega a `/canchas?disciplina=Pádel`
- **THEN** el select de disciplina queda en "Pádel" y la lista muestra solo canchas de Pádel

#### Scenario: Franja libre habilitada
- **WHEN** una franja está libre para una cancha
- **THEN** su botón se muestra habilitado

#### Scenario: Franja ocupada deshabilitada
- **WHEN** una franja está ocupada para una cancha
- **THEN** su botón se muestra gris, tachado y deshabilitado

#### Scenario: Elegir una franja libre
- **WHEN** el usuario hace click en una franja libre
- **THEN** el sistema navega a `/canchas/[id]/reservar` con la fecha y la hora elegidas

### Requirement: Pantalla Confirmar reserva
El sistema SHALL ofrecer `/canchas/[id]/reservar` con un breadcrumb "Canchas > {cancha} ·
{disciplina} > Reservar" y el título "Confirmar reserva". La columna izquierda SHALL mostrar
"Turno seleccionado" (cancha, disciplina, fecha y hora) con el botón "Cambiar turno", y
"Equipamiento (opcional)" con checkbox, nombre, "N disponibles" e input de cantidad por
ítem. La columna derecha SHALL mostrar "Resumen" (cancha, fecha, equipamiento elegido,
estado de pago "Pendiente" y monto total placeholder) y el botón "Confirmar reserva", con
la nota "Podés cancelar hasta 2 horas antes del turno".

#### Scenario: Turno seleccionado
- **WHEN** un usuario navega a `/canchas/[id]/reservar` con una fecha y una hora
- **THEN** la pantalla muestra el breadcrumb con la cancha y la disciplina elegidas, el
  título "Confirmar reserva" y "Turno seleccionado" con cancha, disciplina, fecha y hora

#### Scenario: Cambiar turno
- **WHEN** el usuario hace click en "Cambiar turno"
- **THEN** el sistema navega a `/canchas`

#### Scenario: Cantidad de equipamiento limitada por el stock
- **WHEN** el usuario selecciona un ítem de equipamiento
- **THEN** el input de cantidad acepta como mínimo 1 y como máximo el stock disponible

#### Scenario: Resumen actualizado
- **WHEN** el usuario marca equipamiento o cambia una cantidad
- **THEN** el resumen refleja el equipamiento elegido, muestra el estado de pago "Pendiente"
  y un monto total placeholder

#### Scenario: Nota de cancelación
- **WHEN** el usuario ve la pantalla de confirmación
- **THEN** se muestra la nota "Podés cancelar hasta 2 horas antes del turno"

#### Scenario: Confirmar la reserva
- **WHEN** el usuario hace click en "Confirmar reserva"
- **THEN** el sistema guarda la reserva en la API mockeada con su equipamiento y estado de
  pago "Pendiente", y redirige a `/`

### Requirement: Pantalla Home
El sistema SHALL ofrecer `/` con el encabezado "Hola, {nombre}" y "¿Qué querés hacer
hoy?", el botón "+ Reservar una cancha", la tarjeta "Próxima reserva", la tarjeta "Accesos
rápidos" con Tenis, Fútbol 5 y Pádel, y la sección "Canchas disponibles ahora". La Home
SHALL reemplazar al panel de sesión anterior.

#### Scenario: Encabezado y acción principal
- **WHEN** un usuario con sesión navega a `/`
- **THEN** la pantalla muestra "Hola, {nombre}", "¿Qué querés hacer hoy?" y el botón "+
  Reservar una cancha", que navega a `/canchas`

#### Scenario: Próxima reserva
- **WHEN** el usuario tiene una reserva próxima
- **THEN** la tarjeta muestra "disciplina · cancha", fecha, hora y equipamiento, con los
  botones "Ver detalle" y "Cancelar"

#### Scenario: Reserva recién confirmada
- **WHEN** el usuario confirma una reserva y es redirigido a `/`
- **THEN** esa reserva aparece en la tarjeta "Próxima reserva"

#### Scenario: Sin reservas
- **WHEN** el usuario no tiene reservas próximas
- **THEN** la tarjeta "Próxima reserva" muestra un mensaje indicando que no hay reservas

#### Scenario: Botones placeholder de la reserva
- **WHEN** el usuario hace click en "Ver detalle" o "Cancelar"
- **THEN** el botón no ejecuta ninguna acción en este change

#### Scenario: Acceso rápido por disciplina
- **WHEN** el usuario hace click en "Tenis", "Fútbol 5" o "Pádel" en "Accesos rápidos"
- **THEN** el sistema navega a `/canchas?disciplina={valor}` con esa disciplina

#### Scenario: Canchas disponibles ahora
- **WHEN** la Home muestra "Canchas disponibles ahora"
- **THEN** cada tarjeta muestra nombre, disciplina, "Libre HH:MM" en verde y el botón
  "Reservar", que navega a la confirmación con ese turno

### Requirement: API mockeada de canchas y reservas
El sistema SHALL proveer una capa mock del lado del cliente que simule canchas, franjas,
disponibilidad, equipamiento y reservas, porque el backend aún no expone esos endpoints.

#### Scenario: Canchas desde el mock
- **WHEN** se carga `/canchas`
- **THEN** los datos de las canchas (id, nombre, disciplina, imagen placeholder y franjas)
  provienen de la capa mock

#### Scenario: Disponibilidad simulada
- **WHEN** se muestran las franjas
- **THEN** el estado libre u ocupado sale de datos mock, sin llamadas al backend

#### Scenario: Equipamiento y reservas simulados
- **WHEN** se cargan la confirmación y la Home
- **THEN** el stock de equipamiento y las reservas provienen de la capa mock, y las
  reservas confirmadas persisten entre recargas
