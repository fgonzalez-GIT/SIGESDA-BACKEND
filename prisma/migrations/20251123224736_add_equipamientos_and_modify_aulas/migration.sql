-- CreateTable tipos_aulas
CREATE TABLE "tipos_aulas" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_aulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable estados_aulas
CREATE TABLE "estados_aulas" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estados_aulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable equipamientos
CREATE TABLE "equipamientos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipamientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable aulas_equipamientos (many-to-many relationship)
CREATE TABLE "aulas_equipamientos" (
    "id" SERIAL NOT NULL,
    "aula_id" INTEGER NOT NULL,
    "equipamiento_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aulas_equipamientos_pkey" PRIMARY KEY ("id")
);

-- AlterTable aulas: Add new columns
ALTER TABLE "aulas" ADD COLUMN "tipo_aula_id" INTEGER;
ALTER TABLE "aulas" ADD COLUMN "estado_aula_id" INTEGER;
ALTER TABLE "aulas" ADD COLUMN "descripcion" TEXT;
ALTER TABLE "aulas" ADD COLUMN "observaciones" TEXT;

-- AlterTable aulas: Drop old equipamiento column (text field)
ALTER TABLE "aulas" DROP COLUMN "equipamiento";

-- CreateIndex
CREATE UNIQUE INDEX "tipos_aulas_codigo_key" ON "tipos_aulas"("codigo");
CREATE INDEX "tipos_aulas_codigo_idx" ON "tipos_aulas"("codigo");
CREATE INDEX "tipos_aulas_activo_idx" ON "tipos_aulas"("activo");
CREATE INDEX "tipos_aulas_orden_idx" ON "tipos_aulas"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "estados_aulas_codigo_key" ON "estados_aulas"("codigo");
CREATE INDEX "estados_aulas_codigo_idx" ON "estados_aulas"("codigo");
CREATE INDEX "estados_aulas_activo_idx" ON "estados_aulas"("activo");
CREATE INDEX "estados_aulas_orden_idx" ON "estados_aulas"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "equipamientos_nombre_key" ON "equipamientos"("nombre");
CREATE INDEX "equipamientos_activo_idx" ON "equipamientos"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "aulas_equipamientos_aula_id_equipamiento_id_key" ON "aulas_equipamientos"("aula_id", "equipamiento_id");
CREATE INDEX "aulas_equipamientos_aula_id_idx" ON "aulas_equipamientos"("aula_id");
CREATE INDEX "aulas_equipamientos_equipamiento_id_idx" ON "aulas_equipamientos"("equipamiento_id");

-- CreateIndex on aulas
CREATE INDEX "aulas_tipo_aula_id_idx" ON "aulas"("tipo_aula_id");
CREATE INDEX "aulas_estado_aula_id_idx" ON "aulas"("estado_aula_id");
CREATE INDEX "aulas_activa_idx" ON "aulas"("activa");

-- AddForeignKey
ALTER TABLE "aulas" ADD CONSTRAINT "aulas_tipo_aula_id_fkey" FOREIGN KEY ("tipo_aula_id") REFERENCES "tipos_aulas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aulas" ADD CONSTRAINT "aulas_estado_aula_id_fkey" FOREIGN KEY ("estado_aula_id") REFERENCES "estados_aulas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aulas_equipamientos" ADD CONSTRAINT "aulas_equipamientos_aula_id_fkey" FOREIGN KEY ("aula_id") REFERENCES "aulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aulas_equipamientos" ADD CONSTRAINT "aulas_equipamientos_equipamiento_id_fkey" FOREIGN KEY ("equipamiento_id") REFERENCES "equipamientos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
