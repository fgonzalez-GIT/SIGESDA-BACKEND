-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateTable
CREATE TABLE "horarios_actividades" (
    "id" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "diaSemana" "DiaSemana" NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "horarios_actividades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "horarios_actividades_actividadId_diaSemana_horaInicio_key" ON "horarios_actividades"("actividadId", "diaSemana", "horaInicio");

-- AddForeignKey
ALTER TABLE "horarios_actividades" ADD CONSTRAINT "horarios_actividades_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
