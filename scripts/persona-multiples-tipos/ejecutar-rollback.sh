#!/bin/bash

# ======================================================================
# SCRIPT: ROLLBACK MIGRACIÓN PERSONA MÚLTIPLES TIPOS
# Descripción: Revierte la migración y restaura el estado anterior
# Fecha: 2025-10-27
# ======================================================================

set -e  # Salir si hay error

# Configuración de conexión a la base de datos
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-asociacion_musical}"
DB_USER="${DB_USER:-sigesda_user}"
PGPASSWORD="${PGPASSWORD:-SiGesda2024!}"

export PGPASSWORD

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Banner
echo ""
echo "======================================================================="
echo "  ROLLBACK: PERSONA CON MÚLTIPLES TIPOS"
echo "======================================================================="
echo "  Base de datos: $DB_NAME"
echo "  Host: $DB_HOST:$DB_PORT"
echo "  Usuario: $DB_USER"
echo "======================================================================="
echo ""
print_warning "ADVERTENCIA: Este script revertirá todos los cambios de la migración"
print_warning "Se perderán todos los datos nuevos creados después de la migración"
echo ""

# Confirmar ejecución
read -p "¿Está seguro de que desea continuar con el rollback? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    print_warning "Rollback cancelado por el usuario"
    exit 1
fi

echo ""
read -p "Escriba 'CONFIRMAR' para proceder: " confirm
if [[ "$confirm" != "CONFIRMAR" ]]; then
    print_warning "Rollback cancelado"
    exit 1
fi

# Verificar conexión
print_step "Verificando conexión a la base de datos..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
    print_success "Conexión exitosa"
else
    print_error "No se pudo conectar a la base de datos"
    exit 1
fi

# Verificar que existe el backup
print_step "Verificando existencia de backups..."
backup_exists=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'personas_backup_20251027'")

if [[ "$backup_exists" -eq "0" ]]; then
    print_error "No se encontró el backup personas_backup_20251027"
    print_error "No es posible realizar el rollback sin backup"
    exit 1
else
    print_success "Backup encontrado"
fi

# Ejecutar rollback
echo ""
print_step "Ejecutando rollback..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "03-rollback-migracion.sql"; then
    print_success "Rollback ejecutado exitosamente"
else
    print_error "Error durante el rollback"
    exit 1
fi

# Regenerar Prisma Client con el esquema anterior
echo ""
print_step "Regenerando Prisma Client..."

# Primero necesitamos revertir el schema.prisma (esto debe hacerse manualmente)
print_warning "IMPORTANTE: Debe revertir manualmente el archivo prisma/schema.prisma al estado anterior"
print_warning "Puede usar git: git checkout HEAD~1 -- prisma/schema.prisma"
echo ""
read -p "¿Ya revirtió el schema.prisma? (s/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Ss]$ ]]; then
    if cd ../.. && npx prisma generate; then
        print_success "Prisma Client regenerado"
    else
        print_error "Error al regenerar Prisma Client"
        exit 1
    fi
else
    print_warning "Debe regenerar Prisma Client manualmente después de revertir el schema"
fi

# Resumen final
echo ""
echo "======================================================================="
echo "  ROLLBACK COMPLETADO"
echo "======================================================================="
print_success "La base de datos ha sido restaurada al estado anterior"
echo ""
print_warning "ACCIONES MANUALES REQUERIDAS:"
echo "  1. Revertir prisma/schema.prisma: git checkout HEAD~1 -- prisma/schema.prisma"
echo "  2. Regenerar Prisma Client: npx prisma generate"
echo "  3. Reiniciar la aplicación"
echo "======================================================================="
echo ""
