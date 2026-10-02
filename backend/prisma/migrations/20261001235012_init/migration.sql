-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('USUARIO', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "EstadoCancha" AS ENUM ('DISPONIBLE', 'OCUPADA', 'EN_MANTENIMIENTO');

-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('CONFIRMADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'PAGADO', 'ANULADO');

-- CreateEnum
CREATE TYPE "EstadoDevolucion" AS ENUM ('PENDIENTE', 'DEVUELTO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'USUARIO',
    "contacto" TEXT,
    "tipo" TEXT,
    "membresia" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disciplinas" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "duracion_tipica_minutos" INTEGER,
    "reglas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disciplinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canchas" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "estado" "EstadoCancha" NOT NULL DEFAULT 'DISPONIBLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canchas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos" (
    "id" UUID NOT NULL,
    "cancha_id" UUID NOT NULL,
    "disciplina_id" UUID NOT NULL,
    "fecha" DATE NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "turno_id" UUID NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'CONFIRMADA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipamientos" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "disciplina_id" UUID NOT NULL,
    "stock_total" INTEGER NOT NULL DEFAULT 0,
    "stock_disponible" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "precio_unitario" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipamientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserva_equipamientos" (
    "reserva_id" UUID NOT NULL,
    "equipamiento_id" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "estado_devolucion" "EstadoDevolucion" NOT NULL DEFAULT 'PENDIENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reserva_equipamientos_pkey" PRIMARY KEY ("reserva_id","equipamiento_id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" UUID NOT NULL,
    "reserva_id" UUID NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo_pago" "MetodoPago" NOT NULL,
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_pago" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CanchaToDisciplina" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CanchaToDisciplina_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "disciplinas_nombre_key" ON "disciplinas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "canchas_nombre_key" ON "canchas"("nombre");

-- CreateIndex
CREATE INDEX "turnos_disciplina_id_fecha_idx" ON "turnos"("disciplina_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "turnos_cancha_id_fecha_hora_inicio_key" ON "turnos"("cancha_id", "fecha", "hora_inicio");

-- CreateIndex
CREATE INDEX "reservas_turno_id_estado_idx" ON "reservas"("turno_id", "estado");

-- CreateIndex
CREATE INDEX "reservas_usuario_id_idx" ON "reservas"("usuario_id");

-- CreateIndex
CREATE INDEX "equipamientos_disciplina_id_idx" ON "equipamientos"("disciplina_id");

-- CreateIndex
CREATE INDEX "reserva_equipamientos_equipamiento_id_idx" ON "reserva_equipamientos"("equipamiento_id");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_reserva_id_key" ON "pagos"("reserva_id");

-- CreateIndex
CREATE INDEX "pagos_estado_idx" ON "pagos"("estado");

-- CreateIndex
CREATE INDEX "_CanchaToDisciplina_B_index" ON "_CanchaToDisciplina"("B");

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_cancha_id_fkey" FOREIGN KEY ("cancha_id") REFERENCES "canchas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "disciplinas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipamientos" ADD CONSTRAINT "equipamientos_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "disciplinas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_equipamientos" ADD CONSTRAINT "reserva_equipamientos_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_equipamientos" ADD CONSTRAINT "reserva_equipamientos_equipamiento_id_fkey" FOREIGN KEY ("equipamiento_id") REFERENCES "equipamientos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CanchaToDisciplina" ADD CONSTRAINT "_CanchaToDisciplina_A_fkey" FOREIGN KEY ("A") REFERENCES "canchas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CanchaToDisciplina" ADD CONSTRAINT "_CanchaToDisciplina_B_fkey" FOREIGN KEY ("B") REFERENCES "disciplinas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Restricciones que Prisma no modela (CHECK e índice parcial).
-- Si un `prisma migrate dev` futuro propone dropearlas, volver a agregarlas al final
-- de la migración generada.

-- Un turno no puede tener dos reservas activas; las canceladas sí pueden repetirse.
CREATE UNIQUE INDEX "reservas_turno_unico_activo" ON "reservas"("turno_id") WHERE "estado" = 'CONFIRMADA';

-- El stock disponible nunca puede ser negativo ni superar el stock total.
ALTER TABLE "equipamientos" ADD CONSTRAINT "equipamientos_stock_check" CHECK ("stock_disponible" BETWEEN 0 AND "stock_total");
