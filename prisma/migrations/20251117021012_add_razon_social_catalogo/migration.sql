-- CreateTable
CREATE TABLE "razon_social_catalogo" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "razon_social_catalogo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "razon_social_catalogo_codigo_key" ON "razon_social_catalogo"("codigo");

-- CreateIndex
CREATE INDEX "razon_social_catalogo_codigo_idx" ON "razon_social_catalogo"("codigo");

-- CreateIndex
CREATE INDEX "razon_social_catalogo_activo_idx" ON "razon_social_catalogo"("activo");

-- CreateIndex
CREATE INDEX "razon_social_catalogo_orden_idx" ON "razon_social_catalogo"("orden");

-- AlterTable persona_tipo: Add razon_social_id column
ALTER TABLE "persona_tipo" ADD COLUMN "razon_social_id" INTEGER;

-- Drop old razon_social column
ALTER TABLE "persona_tipo" DROP COLUMN IF EXISTS "razon_social";

-- AddForeignKey
ALTER TABLE "persona_tipo" ADD CONSTRAINT "persona_tipo_razon_social_id_fkey" FOREIGN KEY ("razon_social_id") REFERENCES "razon_social_catalogo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
