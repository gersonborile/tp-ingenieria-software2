## Context

Ver proposal.md para la motivación. Este diseño cubre las tres pantallas del frontend
(`/frontend`, Next.js con App Router) que tienen wireframe: Canchas y disponibilidad,
Confirmar reserva y Home. El backend todavía no tiene endpoints de canchas, turnos ni
reservas, así que las pantallas consumen una API mockeada del lado del cliente. La sesión
del usuario ya se guarda en `localStorage` (`lib/sesion.ts`).

Los wireframes están en `docs/wireframes/`. Como el código se genera a partir de texto, la
estructura visual de cada pantalla se describe en la sección "Estructura visual".

## Goals / Non-Goals

**Goals:**
- Implementar las 3 pantallas protegidas con el layout y comportamiento descriptos.
- Navbar compartida con logo, links centrados, link activo y avatar con menú de sesión.
- Capa mock con tipos para canchas, franjas, equipamiento y reservas.
- Guard de rutas que redirige a `/login` si no hay sesión.

**Non-Goals:**
- Implementar endpoints del backend.
- Pantalla "Mis reservas" (queda como link placeholder).
- Pantalla de detalle de reserva ("Ver detalle" queda como placeholder).
- Cancelar una reserva ("Cancelar" queda como placeholder).
- Flujo de pago real (el monto es un placeholder y el estado de pago es "Pendiente").
- Funcionalidades de administrador.

## Decisions

1. **App Router de Next.js.** Rutas por archivos y layouts compartidos; la navbar vive en
   un layout.
2. **Protección de rutas con un guard del lado del cliente.** La sesión está en
   `localStorage`, que el servidor no puede leer, por lo que no se usa `middleware.ts`. Un
   layout protegido (`app/(protegido)/layout.tsx`) es un componente cliente que lee la
   sesión con `lib/sesion.ts`; si no hay sesión, redirige a `/login`, y mientras decide no
   renderiza el contenido para evitar mostrar pantallas protegidas.
3. **Navbar compartida** en `app/componentes/`, incluida en el layout protegido. El link
   activo se marca con `usePathname()`. El avatar abre un menú con la opción "Cerrar
   sesión", que reutiliza la lógica de logout existente.
4. **Capa mock** en `lib/` (por ejemplo `lib/mock-reservas.ts`) con tipos `Cancha`,
   `Franja`, `Equipamiento` y `Reserva`, y funciones: `obtenerCanchas(filtros)`,
   `obtenerCancha(id)`, `obtenerEquipamiento()`, `crearReserva(datos)`,
   `obtenerProximaReserva()`, `obtenerDisponiblesAhora()`. Las reservas creadas se
   persisten en `localStorage`, para que la Home muestre la reserva recién confirmada.
5. **Pasaje del turno elegido** por query params al navegar a `/canchas/[id]/reservar`
   (`?fecha=AAAA-MM-DD&hora=HH:MM`); la cancha sale del `[id]` de la ruta.
6. **Disciplinas** con una única lista de valores: `Tenis`, `Fútbol 5`, `Pádel`. Los accesos
   rápidos de la Home y el select de filtros usan los mismos valores, y el filtro viaja en
   `/canchas?disciplina=...`.
7. **Estilos con Tailwind.** Franja libre habilitada; franja ocupada gris, tachada y
   deshabilitada; "Libre HH:MM" en verde en la Home.
8. **Tipos TypeScript** para las formas de dominio usadas en la UI, junto a la capa mock.
9. **Fechas y horas** como cadenas ISO de fecha y `HH:MM`, sin depender del locale.

## Risks / Trade-offs

- [Riesgo] Cuando exista el backend, los contratos reales pueden diferir del mock →
  Mitigación: el mock expone funciones con interfaz estable y tipos mínimos alineados a las
  entidades del dominio; solo se cambia la implementación.
- [Riesgo] El guard del cliente muestra un instante en blanco antes de redirigir →
  Mitigación: no renderizar el contenido protegido hasta resolver la sesión.
- [Riesgo] Quitar el panel de sesión de la Home puede dejar sin logout →
  Mitigación: el logout pasa al menú del avatar y tiene un escenario de verificación.

## Estructura visual (por pantalla)

### Navbar
- Izquierda: logo "CD" + "Club Deportivo" (link a `/`).
- Centro: links "Inicio" (`/`), "Canchas" (`/canchas`) y "Mis reservas" (placeholder, sin
  navegación). El link de la ruta actual va subrayado.
- Derecha: avatar circular con la inicial del usuario; al hacer click abre un menú con
  "Cerrar sesión".

### 1) Canchas y disponibilidad (`/canchas`)
- Título "Canchas y disponibilidad" y subtítulo "Elegí disciplina, fecha y horario para ver
  los turnos libres".
- Barra de filtros: select Disciplina (Todas, Tenis, Fútbol 5, Pádel), input de fecha,
  select Horario (Cualquiera y cada franja) y botón "Buscar".
- Lista de canchas: una fila por cancha con imagen placeholder (caja gris), nombre
  ("Cancha 1"), disciplina y botones de franja de 16:00 a 21:00. Libre: habilitado.
  Ocupada: gris, tachada y deshabilitada. Al elegir una franja libre se navega a
  `/canchas/[id]/reservar` con el turno.

### 2) Confirmar reserva (`/canchas/[id]/reservar`)
- Breadcrumb "Canchas > {cancha} · {disciplina} > Reservar" y título "Confirmar reserva".
- Columna izquierda: tarjeta "Turno seleccionado" (cancha, disciplina, fecha y hora) con
  botón "Cambiar turno" hacia `/canchas`; tarjeta "Equipamiento (opcional)" con una fila
  por ítem: checkbox, nombre, "N disponibles" e input de cantidad (mínimo 1, máximo el
  stock disponible).
- Columna derecha: tarjeta "Resumen" (cancha, fecha, equipamiento elegido, estado de pago
  "Pendiente", monto total placeholder) y botón "Confirmar reserva", con la nota "Podés
  cancelar hasta 2 horas antes del turno".
- Al confirmar se guarda la reserva en el mock y se redirige a `/`.

### 3) Home (`/`)
- Encabezado "Hola, {nombre}" con "¿Qué querés hacer hoy?" y botón "+ Reservar una cancha"
  hacia `/canchas`.
- Tarjeta "Próxima reserva" ("disciplina · cancha", fecha, hora, equipamiento) con botones
  "Ver detalle" y "Cancelar" (ambos placeholder). Si no hay reserva, muestra un mensaje
  vacío.
- Tarjeta "Accesos rápidos" con Tenis, Fútbol 5 y Pádel, que navegan a
  `/canchas?disciplina=...`.
- Sección "Canchas disponibles ahora": tarjetas con nombre, disciplina, "Libre HH:MM" en
  verde y botón "Reservar" hacia la confirmación con ese turno.

## Detalles visuales (fidelidad al wireframe)

Aplican a Confirmar reserva y Home, además de lo descripto en "Estructura visual".

**General**
- Fondo de página gris claro; tarjetas blancas con borde fino y esquinas poco redondeadas.
- Título de cada tarjeta ("TURNO SELECCIONADO", "EQUIPAMIENTO (OPCIONAL)", "RESUMEN",
  "PRÓXIMA RESERVA", "ACCESOS RÁPIDOS", "CANCHAS DISPONIBLES AHORA"): mayúsculas, texto
  chico y gris.
- Botón primario oscuro (casi negro) con texto blanco; botón secundario blanco con borde.
- Layout de dos columnas desiguales, la izquierda más ancha (Confirmar reserva ≈ 62/38,
  Home ≈ 65/35), con separación entre tarjetas.
- Link activo de la navbar subrayado y con texto más oscuro que los demás.

**Confirmar reserva**
- Turno: "Cancha 2 · Pádel" en negrita y debajo "Jueves 24/09 · 18:00 a 19:00 hs" (día de la
  semana, fecha y rango de una hora). Cada turno dura una hora.
- Equipamiento: filas separadas por una línea fina; cada ítem muestra el nombre y debajo
  "N disponibles" en gris; el input de cantidad es chico y va a la derecha.
- Solo se lista el equipamiento de la disciplina de la cancha elegida
  (`obtenerEquipamiento(disciplina)`).
- Resumen: etiqueta a la izquierda en gris y valor alineado a la derecha; línea divisoria
  antes de "Monto total", que muestra el monto grande y en negrita; botón "Confirmar
  reserva" a todo el ancho y la nota "Podés cancelar hasta 2 horas antes del turno" chica,
  gris y centrada.
- Valores del resumen: Fecha como "24/09, 18:00hs"; Equipamiento como cantidad y nombre
  ("2 paletas"), o "Sin equipamiento" si no se eligió ninguno.
- La tarjeta "Resumen" tiene el alto de su contenido (no se estira).

**Home**
- "Próxima reserva" y "Accesos rápidos" tienen el mismo alto; "Próxima reserva" puede
  quedar con espacio libre abajo.
- Próxima reserva: "Pádel · Cancha 3" en negrita, luego "Hoy, 18:00 a 19:00 hs" (con "Hoy" si
  es el día actual, si no el día y la fecha) y "Equipamiento: 2 paletas". Los botones "Ver
  detalle" y "Cancelar" van a la derecha; "Cancelar" es secundario con texto rojo.
- Accesos rápidos: una fila por disciplina, con un cuadrado gris como ícono a la izquierda y
  el nombre. Se usa el valor "Fútbol 5" (el wireframe dice "Fútbol") para coincidir con el
  filtro de `/canchas`.
- Canchas disponibles ahora: como máximo 3 tarjetas, en una fila de 3 columnas iguales; cada
  una con nombre en negrita, disciplina en gris, "Libre HH:MM" en verde y negrita, y botón
  "Reservar" a todo el ancho.

## Open Questions

- Monto total: queda como placeholder hasta que se definan los precios de canchas y
  equipamiento.
- "Mis reservas", "Ver detalle" y "Cancelar" se resuelven en un change posterior.
