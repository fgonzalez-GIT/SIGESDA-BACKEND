-- CreateTable
CREATE TABLE "actividades_aulas" (
    "id" SERIAL NOT NULL,
    "actividad_id" INTEGER NOT NULL,
    "aula_id" INTEGER NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_desasignacion" TIMESTAMP(3),
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "prioridad" INTEGER DEFAULT 1,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actividades_aulas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "actividades_aulas_actividad_id_aula_id_key" ON "actividades_aulas"("actividad_id", "aula_id");

-- CreateIndex
CREATE INDEX "actividades_aulas_actividad_id_idx" ON "actividades_aulas"("actividad_id");

-- CreateIndex
CREATE INDEX "actividades_aulas_aula_id_idx" ON "actividades_aulas"("aula_id");

-- CreateIndex
CREATE INDEX "actividades_aulas_activa_idx" ON "actividades_aulas"("activa");

-- AddForeignKey
ALTER TABLE "actividades_aulas" ADD CONSTRAINT "actividades_aulas_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades_aulas" ADD CONSTRAINT "actividades_aulas_aula_id_fkey" FOREIGN KEY ("aula_id") REFERENCES "aulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
