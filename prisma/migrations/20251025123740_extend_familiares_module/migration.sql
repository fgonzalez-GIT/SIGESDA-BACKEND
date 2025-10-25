-- AlterEnum
-- Extend TipoParentesco enum with additional family relationship types
ALTER TYPE "TipoParentesco" ADD VALUE IF NOT EXISTS 'ABUELO';
ALTER TYPE "TipoParentesco" ADD VALUE IF NOT EXISTS 'ABUELA';
ALTER TYPE "TipoParentesco" ADD VALUE IF NOT EXISTS 'NIETO';
ALTER TYPE "TipoParentesco" ADD VALUE IF NOT EXISTS 'NIETA';
ALTER TYPE "TipoParentesco" ADD VALUE IF NOT EXISTS 'TIO';
ALTER TYPE "TipoParentesco" ADD VALUE IF NOT EXISTS 'TIA';
ALTER TYPE "TipoParentesco" ADD VALUE IF NOT EXISTS 'SOBRINO';
ALTER TYPE "TipoParentesco" ADD VALUE IF NOT EXISTS 'SOBRINA';
ALTER TYPE "TipoParentesco" ADD VALUE IF NOT EXISTS 'PRIMO';
ALTER TYPE "TipoParentesco" ADD VALUE IF NOT EXISTS 'PRIMA';

-- AlterTable
-- Add new columns to familiares table
ALTER TABLE "familiares" ADD COLUMN IF NOT EXISTS "descripcion" TEXT;
ALTER TABLE "familiares" ADD COLUMN IF NOT EXISTS "permisoResponsableFinanciero" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "familiares" ADD COLUMN IF NOT EXISTS "permisoContactoEmergencia" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "familiares" ADD COLUMN IF NOT EXISTS "permisoAutorizadoRetiro" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "familiares" ADD COLUMN IF NOT EXISTS "descuento" DECIMAL(5,2) NOT NULL DEFAULT 0;
ALTER TABLE "familiares" ADD COLUMN IF NOT EXISTS "activo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "familiares" ADD COLUMN IF NOT EXISTS "grupoFamiliarId" INTEGER;

-- CreateIndex
-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS "familiares_grupoFamiliarId_idx" ON "familiares"("grupoFamiliarId");
CREATE INDEX IF NOT EXISTS "familiares_activo_idx" ON "familiares"("activo");
