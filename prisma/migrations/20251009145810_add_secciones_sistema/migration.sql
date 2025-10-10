-- DropIndex
DROP INDEX "idx_horarios_actividad_dia_activo";

-- DropIndex
DROP INDEX "idx_horarios_actividad_id";

-- DropIndex
DROP INDEX "idx_horarios_activo";

-- DropIndex
DROP INDEX "idx_horarios_dia_hora";

-- DropIndex
DROP INDEX "idx_horarios_dia_semana";

-- CreateTable
CREATE TABLE "secciones_actividades" (
    "id" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT,
    "capacidadMaxima" INTEGER,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "secciones_actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_secciones" (
    "id" TEXT NOT NULL,
    "seccionId" TEXT NOT NULL,
    "diaSemana" "DiaSemana" NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "horarios_secciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participaciones_secciones" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "seccionId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "precioEspecial" DECIMAL(8,2),
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participaciones_secciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas_aulas_secciones" (
    "id" TEXT NOT NULL,
    "seccionId" TEXT NOT NULL,
    "aulaId" TEXT NOT NULL,
    "diaSemana" "DiaSemana" NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "fechaVigencia" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_aulas_secciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DocenteSeccion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "secciones_actividades_actividadId_idx" ON "secciones_actividades"("actividadId");

-- CreateIndex
CREATE INDEX "secciones_actividades_activa_idx" ON "secciones_actividades"("activa");

-- CreateIndex
CREATE UNIQUE INDEX "secciones_actividades_actividadId_nombre_key" ON "secciones_actividades"("actividadId", "nombre");

-- CreateIndex
CREATE INDEX "horarios_secciones_seccionId_diaSemana_horaInicio_idx" ON "horarios_secciones"("seccionId", "diaSemana", "horaInicio");

-- CreateIndex
CREATE INDEX "horarios_secciones_diaSemana_idx" ON "horarios_secciones"("diaSemana");

-- CreateIndex
CREATE INDEX "horarios_secciones_activo_idx" ON "horarios_secciones"("activo");

-- CreateIndex
CREATE INDEX "participaciones_secciones_seccionId_idx" ON "participaciones_secciones"("seccionId");

-- CreateIndex
CREATE INDEX "participaciones_secciones_personaId_idx" ON "participaciones_secciones"("personaId");

-- CreateIndex
CREATE INDEX "participaciones_secciones_activa_idx" ON "participaciones_secciones"("activa");

-- CreateIndex
CREATE UNIQUE INDEX "participaciones_secciones_personaId_seccionId_key" ON "participaciones_secciones"("personaId", "seccionId");

-- CreateIndex
CREATE INDEX "reservas_aulas_secciones_aulaId_diaSemana_horaInicio_idx" ON "reservas_aulas_secciones"("aulaId", "diaSemana", "horaInicio");

-- CreateIndex
CREATE INDEX "reservas_aulas_secciones_seccionId_idx" ON "reservas_aulas_secciones"("seccionId");

-- CreateIndex
CREATE UNIQUE INDEX "reservas_aulas_secciones_seccionId_aulaId_diaSemana_horaIni_key" ON "reservas_aulas_secciones"("seccionId", "aulaId", "diaSemana", "horaInicio");

-- CreateIndex
CREATE UNIQUE INDEX "_DocenteSeccion_AB_unique" ON "_DocenteSeccion"("A", "B");

-- CreateIndex
CREATE INDEX "_DocenteSeccion_B_index" ON "_DocenteSeccion"("B");

-- AddForeignKey
ALTER TABLE "secciones_actividades" ADD CONSTRAINT "secciones_actividades_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_secciones" ADD CONSTRAINT "horarios_secciones_seccionId_fkey" FOREIGN KEY ("seccionId") REFERENCES "secciones_actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participaciones_secciones" ADD CONSTRAINT "participaciones_secciones_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participaciones_secciones" ADD CONSTRAINT "participaciones_secciones_seccionId_fkey" FOREIGN KEY ("seccionId") REFERENCES "secciones_actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_aulas_secciones" ADD CONSTRAINT "reservas_aulas_secciones_seccionId_fkey" FOREIGN KEY ("seccionId") REFERENCES "secciones_actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_aulas_secciones" ADD CONSTRAINT "reservas_aulas_secciones_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "aulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocenteSeccion" ADD CONSTRAINT "_DocenteSeccion_A_fkey" FOREIGN KEY ("A") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocenteSeccion" ADD CONSTRAINT "_DocenteSeccion_B_fkey" FOREIGN KEY ("B") REFERENCES "secciones_actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- MIGRACIÓN AUTOMÁTICA DE DATOS EXISTENTES
-- ============================================================================

-- 1. Crear una sección por defecto para cada actividad existente
INSERT INTO "secciones_actividades" (
  "id",
  "actividadId",
  "nombre",
  "codigo",
  "capacidadMaxima",
  "activa",
  "createdAt",
  "updatedAt"
)
SELECT
  'sec_' || "id" as "id",
  "id" as "actividadId",
  'Sección Principal' as "nombre",
  CONCAT(UPPER(SUBSTRING("nombre" FROM 1 FOR 3)), '-DEFAULT') as "codigo",
  "capacidadMaxima",
  "activa",
  "createdAt",
  NOW() as "updatedAt"
FROM "actividades";

-- 2. Migrar horarios de actividades a secciones
INSERT INTO "horarios_secciones" (
  "id",
  "seccionId",
  "diaSemana",
  "horaInicio",
  "horaFin",
  "activo",
  "createdAt",
  "updatedAt"
)
SELECT
  h."id",
  'sec_' || h."actividadId" as "seccionId",
  h."diaSemana",
  h."horaInicio",
  h."horaFin",
  h."activo",
  h."createdAt",
  h."updatedAt"
FROM "horarios_actividades" h;

-- 3. Migrar relación docentes -> sección (solo docentes válidos)
INSERT INTO "_DocenteSeccion" ("A", "B")
SELECT
  da."A" as "A",
  'sec_' || da."B" as "B"
FROM "_DocenteActividad" da
WHERE EXISTS (
  SELECT 1 FROM "personas" p WHERE p."id" = da."A"
);

-- 4. Migrar participaciones a secciones
INSERT INTO "participaciones_secciones" (
  "id",
  "personaId",
  "seccionId",
  "fechaInicio",
  "fechaFin",
  "precioEspecial",
  "activa",
  "observaciones",
  "createdAt",
  "updatedAt"
)
SELECT
  p."id",
  p."personaId",
  'sec_' || p."actividadId" as "seccionId",
  p."fechaInicio",
  p."fechaFin",
  p."precioEspecial",
  p."activa",
  p."observaciones",
  p."createdAt",
  p."updatedAt"
FROM "participacion_actividades" p;

-- 5. Migrar reservas de aulas a secciones (solo si están vinculadas a actividad y tienen horarios)
INSERT INTO "reservas_aulas_secciones" (
  "id",
  "seccionId",
  "aulaId",
  "diaSemana",
  "horaInicio",
  "horaFin",
  "fechaVigencia",
  "fechaFin",
  "observaciones",
  "createdAt",
  "updatedAt"
)
SELECT DISTINCT ON (r."actividadId", r."aulaId", h."diaSemana", h."horaInicio")
  md5(random()::text || clock_timestamp()::text)::uuid::text as "id",
  'sec_' || r."actividadId" as "seccionId",
  r."aulaId",
  h."diaSemana",
  h."horaInicio",
  h."horaFin",
  r."fechaInicio" as "fechaVigencia",
  r."fechaFin",
  r."observaciones",
  r."createdAt",
  NOW() as "updatedAt"
FROM "reserva_aulas" r
JOIN "horarios_actividades" h ON h."actividadId" = r."actividadId"
WHERE r."actividadId" IS NOT NULL;

-- ============================================================================
-- COMENTARIOS EXPLICATIVOS
-- ============================================================================

-- NOTA: Esta migración NO elimina las tablas antiguas (horarios_actividades,
-- participacion_actividades, etc.) para permitir rollback si es necesario.
-- Las tablas antiguas deben ser renombradas manualmente después de validar
-- que la migración fue exitosa.

-- Para renombrar tablas antiguas (ejecutar manualmente después de validación):
-- ALTER TABLE "horarios_actividades" RENAME TO "horarios_actividades_backup";
-- ALTER TABLE "participacion_actividades" RENAME TO "participacion_actividades_backup";
-- ALTER TABLE "_DocenteActividad" RENAME TO "_DocenteActividad_backup";
-- ALTER TABLE "reserva_aulas" RENAME TO "reserva_aulas_backup";

-- Las tablas backup pueden eliminarse después de 30 días de operación estable.
