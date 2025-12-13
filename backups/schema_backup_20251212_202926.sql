-- DropForeignKey
ALTER TABLE "contacto_persona" DROP CONSTRAINT "contacto_persona_tipo_contacto_id_fkey";

-- AlterTable
ALTER TABLE "tipo_contacto_catalogo" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(6);

-- AddForeignKey
ALTER TABLE "contacto_persona" ADD CONSTRAINT "fk_contacto_tipo_contacto_id" FOREIGN KEY ("tipo_contacto_id") REFERENCES "tipo_contacto_catalogo"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- RenameIndex
ALTER INDEX "tipo_contacto_catalogo_codigo_idx" RENAME TO "tipo_contacto_codigo_idx";

-- RenameIndex
ALTER INDEX "tipo_contacto_catalogo_activo_idx" RENAME TO "tipo_contacto_activo_idx";

-- RenameIndex
ALTER INDEX "tipo_contacto_catalogo_orden_idx" RENAME TO "tipo_contacto_orden_idx";

┌─────────────────────────────────────────────────────────┐
│  Update available 5.22.0 -> 7.1.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
