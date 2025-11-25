-- CreateTable
CREATE TABLE "estados_reservas" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estados_reservas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estados_reservas_codigo_key" ON "estados_reservas"("codigo");

-- CreateIndex
CREATE INDEX "estados_reservas_codigo_idx" ON "estados_reservas"("codigo");

-- CreateIndex
CREATE INDEX "estados_reservas_activo_idx" ON "estados_reservas"("activo");

-- CreateIndex
CREATE INDEX "estados_reservas_orden_idx" ON "estados_reservas"("orden");

-- Insert initial estados_reservas data
INSERT INTO "estados_reservas" ("codigo", "nombre", "descripcion", "activo", "orden", "updated_at") VALUES
('PENDIENTE', 'Pendiente', 'Reserva creada, esperando aprobación', true, 1, CURRENT_TIMESTAMP),
('CONFIRMADA', 'Confirmada', 'Reserva aprobada y activa', true, 2, CURRENT_TIMESTAMP),
('COMPLETADA', 'Completada', 'Reserva finalizada (fecha fin pasada)', true, 3, CURRENT_TIMESTAMP),
('CANCELADA', 'Cancelada', 'Reserva cancelada por usuario o administrador', true, 4, CURRENT_TIMESTAMP),
('RECHAZADA', 'Rechazada', 'Reserva no aprobada por administrador', true, 5, CURRENT_TIMESTAMP);

-- AlterTable: Add new columns to reserva_aulas
ALTER TABLE "reserva_aulas" ADD COLUMN "estado_reserva_id" INTEGER;
ALTER TABLE "reserva_aulas" ADD COLUMN "activa" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "reserva_aulas" ADD COLUMN "motivo_cancelacion" TEXT;
ALTER TABLE "reserva_aulas" ADD COLUMN "cancelado_por_id" INTEGER;
ALTER TABLE "reserva_aulas" ADD COLUMN "aprobado_por_id" INTEGER;

-- Migrate existing reservations to CONFIRMADA state
UPDATE "reserva_aulas"
SET "estado_reserva_id" = (SELECT id FROM "estados_reservas" WHERE codigo = 'CONFIRMADA')
WHERE "estado_reserva_id" IS NULL;

-- AddForeignKey
ALTER TABLE "reserva_aulas" ADD CONSTRAINT "reserva_aulas_estado_reserva_id_fkey" FOREIGN KEY ("estado_reserva_id") REFERENCES "estados_reservas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_aulas" ADD CONSTRAINT "reserva_aulas_cancelado_por_id_fkey" FOREIGN KEY ("cancelado_por_id") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_aulas" ADD CONSTRAINT "reserva_aulas_aprobado_por_id_fkey" FOREIGN KEY ("aprobado_por_id") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex: Performance indexes
CREATE INDEX "reserva_aulas_aulaId_fechaInicio_fechaFin_idx" ON "reserva_aulas"("aulaId", "fechaInicio", "fechaFin");

CREATE INDEX "reserva_aulas_docenteId_fechaInicio_idx" ON "reserva_aulas"("docenteId", "fechaInicio");

CREATE INDEX "reserva_aulas_actividadId_idx" ON "reserva_aulas"("actividadId");

CREATE INDEX "reserva_aulas_estado_reserva_id_idx" ON "reserva_aulas"("estado_reserva_id");

CREATE INDEX "reserva_aulas_fechaInicio_fechaFin_idx" ON "reserva_aulas"("fechaInicio", "fechaFin");

CREATE INDEX "reserva_aulas_activa_idx" ON "reserva_aulas"("activa");
