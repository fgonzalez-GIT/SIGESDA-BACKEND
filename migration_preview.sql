-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateEnum
CREATE TYPE "TipoActividad" AS ENUM ('CORO', 'CLASE_CANTO', 'CLASE_INSTRUMENTO');

-- DropForeignKey
ALTER TABLE "aulas" DROP CONSTRAINT "aulas_tipo_aula_id_fkey";

-- DropForeignKey
ALTER TABLE "aulas" DROP CONSTRAINT "aulas_estado_aula_id_fkey";

-- DropForeignKey
ALTER TABLE "aulas_equipamientos" DROP CONSTRAINT "aulas_equipamientos_aula_id_fkey";

-- DropForeignKey
ALTER TABLE "aulas_equipamientos" DROP CONSTRAINT "aulas_equipamientos_equipamiento_id_fkey";

-- DropForeignKey
ALTER TABLE "horarios_actividades" DROP CONSTRAINT "horarios_actividades_actividad_id_fkey";

-- DropForeignKey
ALTER TABLE "horarios_actividades" DROP CONSTRAINT "horarios_actividades_dia_semana_id_fkey";

-- DropIndex
DROP INDEX "aulas_tipo_aula_id_idx";

-- DropIndex
DROP INDEX "aulas_estado_aula_id_idx";

-- DropIndex
DROP INDEX "aulas_activa_idx";

-- AlterTable
ALTER TABLE "actividades" ADD COLUMN     "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "fecha_desde" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "fecha_hasta" SET DATA TYPE TIMESTAMP(6);

-- AlterTable
ALTER TABLE "aulas" DROP COLUMN "descripcion",
DROP COLUMN "estado_aula_id",
DROP COLUMN "observaciones",
DROP COLUMN "tipo_aula_id",
ADD COLUMN     "equipamiento" TEXT;

-- AlterTable
ALTER TABLE "horarios_actividades" ALTER COLUMN "dia_semana_id" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(6);

-- AlterTable
ALTER TABLE "horarios_secciones" DROP COLUMN "diaSemana",
ADD COLUMN     "diaSemana" "DiaSemana" NOT NULL;

-- AlterTable
ALTER TABLE "reservas_aulas_secciones" DROP COLUMN "diaSemana",
ADD COLUMN     "diaSemana" "DiaSemana" NOT NULL;

-- DropTable
DROP TABLE "tipos_aulas";

-- DropTable
DROP TABLE "estados_aulas";

-- DropTable
DROP TABLE "equipamientos";

-- DropTable
DROP TABLE "aulas_equipamientos";

-- CreateIndex
CREATE INDEX "horarios_secciones_diaSemana_idx" ON "horarios_secciones"("diaSemana" ASC);

-- CreateIndex
CREATE INDEX "horarios_secciones_seccionId_diaSemana_horaInicio_idx" ON "horarios_secciones"("seccionId" ASC, "diaSemana" ASC, "horaInicio" ASC);

-- CreateIndex
CREATE INDEX "reservas_aulas_secciones_aulaId_diaSemana_horaInicio_idx" ON "reservas_aulas_secciones"("aulaId" ASC, "diaSemana" ASC, "horaInicio" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "reservas_aulas_secciones_seccionId_aulaId_diaSemana_horaIni_key" ON "reservas_aulas_secciones"("seccionId" ASC, "aulaId" ASC, "diaSemana" ASC, "horaInicio" ASC);

-- AddForeignKey
ALTER TABLE "horarios_actividades" ADD CONSTRAINT "horarios_actividades_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

┌─────────────────────────────────────────────────────────┐
│  Update available 5.22.0 -> 7.0.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
