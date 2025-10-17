#!/bin/bash

# ============================================================================
# Script de ejecución de migración completa
# Fecha: 2025-10-15
# ============================================================================

set -e  # Exit on error

echo "========================================="
echo "REDISEÑO ACTIVIDAD - MIGRACIÓN COMPLETA"
echo "========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorio de scripts
SCRIPT_DIR="prisma/migrations/manual"

# Función para ejecutar script SQL
ejecutar_script() {
    local script=$1
    local descripcion=$2

    echo -e "${YELLOW}Ejecutando: $descripcion${NC}"
    echo "Script: $script"

    npx prisma db execute --file="$SCRIPT_DIR/$script" --schema=prisma/schema.prisma

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Completado exitosamente${NC}"
        echo ""
    else
        echo -e "${RED}✗ Error al ejecutar script${NC}"
        exit 1
    fi
}

# Ejecución de scripts en orden
echo "Iniciando migración..."
echo ""

ejecutar_script "01_drop_tablas_antiguas.sql" "FASE 2: DROP de tablas antiguas"
ejecutar_script "02_create_catalogos.sql" "FASE 3: CREATE tablas de catálogos"
ejecutar_script "03_create_actividades.sql" "FASE 4: CREATE tabla principal y relacionadas"
ejecutar_script "04_create_triggers.sql" "FASE 5: CREATE triggers y funciones"
ejecutar_script "05_seed_ejemplos.sql" "FASE 6: SEED de datos de ejemplo"

echo "========================================="
echo -e "${GREEN}MIGRACIÓN COMPLETADA EXITOSAMENTE${NC}"
echo "========================================="
echo ""
echo "Próximo paso: Actualizar schema Prisma y regenerar cliente"
