-- CreateEnum
CREATE TYPE "TipoPersona" AS ENUM ('SOCIO', 'NO_SOCIO', 'DOCENTE', 'PROVEEDOR');

-- CreateEnum
CREATE TYPE "CategoriaSocio" AS ENUM ('ACTIVO', 'ESTUDIANTE', 'FAMILIAR', 'JUBILADO');

-- CreateEnum
CREATE TYPE "TipoActividad" AS ENUM ('CORO', 'CLASE_CANTO', 'CLASE_INSTRUMENTO');

-- CreateEnum
CREATE TYPE "TipoRecibo" AS ENUM ('CUOTA', 'SUELDO', 'DEUDA', 'PAGO_ACTIVIDAD');

-- CreateEnum
CREATE TYPE "MedioPagoTipo" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'CHEQUE');

-- CreateEnum
CREATE TYPE "TipoParentesco" AS ENUM ('HIJO', 'HIJA', 'CONYUGE', 'PADRE', 'MADRE', 'HERMANO', 'HERMANA', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoRecibo" AS ENUM ('PENDIENTE', 'PAGADO', 'VENCIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "personas" (
    "id" TEXT NOT NULL,
    "tipo" "TipoPersona" NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "numeroSocio" INTEGER,
    "categoria" "CategoriaSocio",
    "fechaIngreso" TIMESTAMP(3),
    "fechaBaja" TIMESTAMP(3),
    "motivoBaja" TEXT,
    "especialidad" TEXT,
    "honorariosPorHora" DECIMAL(10,2),
    "cuit" TEXT,
    "razonSocial" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividades" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoActividad" NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "duracion" INTEGER,
    "capacidadMaxima" INTEGER,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participacion_actividades" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "precioEspecial" DECIMAL(8,2),
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participacion_actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recibos" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" "TipoRecibo" NOT NULL,
    "importe" DECIMAL(10,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" TIMESTAMP(3),
    "estado" "EstadoRecibo" NOT NULL DEFAULT 'PENDIENTE',
    "concepto" TEXT NOT NULL,
    "observaciones" TEXT,
    "emisorId" TEXT,
    "receptorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recibos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuotas" (
    "id" TEXT NOT NULL,
    "reciboId" TEXT NOT NULL,
    "categoria" "CategoriaSocio" NOT NULL,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "montoBase" DECIMAL(8,2) NOT NULL,
    "montoActividades" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "montoTotal" DECIMAL(8,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cuotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medios_pago" (
    "id" TEXT NOT NULL,
    "reciboId" TEXT NOT NULL,
    "tipo" "MedioPagoTipo" NOT NULL,
    "importe" DECIMAL(10,2) NOT NULL,
    "numero" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "banco" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medios_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "familiares" (
    "id" TEXT NOT NULL,
    "socioId" TEXT NOT NULL,
    "familiarId" TEXT NOT NULL,
    "parentesco" "TipoParentesco" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "familiares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comision_directiva" (
    "id" TEXT NOT NULL,
    "socioId" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comision_directiva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aulas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "ubicacion" TEXT,
    "equipamiento" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserva_aulas" (
    "id" TEXT NOT NULL,
    "aulaId" TEXT NOT NULL,
    "actividadId" TEXT,
    "docenteId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reserva_aulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_sistema" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'STRING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DocenteActividad" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "personas_dni_key" ON "personas"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "personas_email_key" ON "personas"("email");

-- CreateIndex
CREATE UNIQUE INDEX "personas_numeroSocio_key" ON "personas"("numeroSocio");

-- CreateIndex
CREATE UNIQUE INDEX "personas_cuit_key" ON "personas"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "participacion_actividades_personaId_actividadId_key" ON "participacion_actividades"("personaId", "actividadId");

-- CreateIndex
CREATE UNIQUE INDEX "recibos_numero_key" ON "recibos"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "cuotas_reciboId_key" ON "cuotas"("reciboId");

-- CreateIndex
CREATE UNIQUE INDEX "cuotas_categoria_mes_anio_key" ON "cuotas"("categoria", "mes", "anio");

-- CreateIndex
CREATE UNIQUE INDEX "familiares_socioId_familiarId_key" ON "familiares"("socioId", "familiarId");

-- CreateIndex
CREATE UNIQUE INDEX "comision_directiva_socioId_key" ON "comision_directiva"("socioId");

-- CreateIndex
CREATE UNIQUE INDEX "aulas_nombre_key" ON "aulas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_sistema_clave_key" ON "configuracion_sistema"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "_DocenteActividad_AB_unique" ON "_DocenteActividad"("A", "B");

-- CreateIndex
CREATE INDEX "_DocenteActividad_B_index" ON "_DocenteActividad"("B");

-- AddForeignKey
ALTER TABLE "participacion_actividades" ADD CONSTRAINT "participacion_actividades_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participacion_actividades" ADD CONSTRAINT "participacion_actividades_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recibos" ADD CONSTRAINT "recibos_emisorId_fkey" FOREIGN KEY ("emisorId") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recibos" ADD CONSTRAINT "recibos_receptorId_fkey" FOREIGN KEY ("receptorId") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuotas" ADD CONSTRAINT "cuotas_reciboId_fkey" FOREIGN KEY ("reciboId") REFERENCES "recibos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medios_pago" ADD CONSTRAINT "medios_pago_reciboId_fkey" FOREIGN KEY ("reciboId") REFERENCES "recibos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "familiares" ADD CONSTRAINT "familiares_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "familiares" ADD CONSTRAINT "familiares_familiarId_fkey" FOREIGN KEY ("familiarId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comision_directiva" ADD CONSTRAINT "comision_directiva_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_aulas" ADD CONSTRAINT "reserva_aulas_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "aulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_aulas" ADD CONSTRAINT "reserva_aulas_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_aulas" ADD CONSTRAINT "reserva_aulas_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocenteActividad" ADD CONSTRAINT "_DocenteActividad_A_fkey" FOREIGN KEY ("A") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocenteActividad" ADD CONSTRAINT "_DocenteActividad_B_fkey" FOREIGN KEY ("B") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
