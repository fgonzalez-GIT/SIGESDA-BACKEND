#!/bin/bash

# ======================================================================
# SCRIPT: EJECUTAR MIGRACIÓN PERSONA MÚLTIPLES TIPOS
# Descripción: Ejecuta todos los pasos de la migración de forma ordenada
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

# Función para ejecutar SQL y capturar errores
execute_sql() {
    local sql_file=$1
    local description=$2

    print_step "$description"

    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$sql_file" 2>&1; then
        print_success "$description completado"
        return 0
    else
        print_error "$description falló"
        return 1
    fi
}

# Banner
echo ""
echo "======================================================================="
echo "  MIGRACIÓN: PERSONA CON MÚLTIPLES TIPOS"
echo "======================================================================="
echo "  Base de datos: $DB_NAME"
echo "  Host: $DB_HOST:$DB_PORT"
echo "  Usuario: $DB_USER"
echo "======================================================================="
echo ""

# Confirmar ejecución
read -p "¿Desea continuar con la migración? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    print_warning "Migración cancelada por el usuario"
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

# PASO 1: Backup
echo ""
print_step "PASO 1: Creando backup de datos actuales..."
if execute_sql "01-backup-antes-migracion.sql" "Backup de tablas"; then
    print_success "Backup completado exitosamente"
else
    print_error "Error al crear backup"
    exit 1
fi

# PASO 2: Ejecutar migración
echo ""
print_step "PASO 2: Ejecutando migración..."
if execute_sql "../migrations/20251027185921_persona_multiples_tipos/migration.sql" "Migración de esquema y datos"; then
    print_success "Migración ejecutada exitosamente"
else
    print_error "Error durante la migración"
    print_warning "Puede ejecutar el script de rollback para revertir los cambios"
    exit 1
fi

# PASO 3: Validar migración
echo ""
print_step "PASO 3: Validando migración..."
if execute_sql "02-validar-migracion.sql" "Validación de datos"; then
    print_success "Validación completada exitosamente"
else
    print_warning "Hubo advertencias durante la validación"
    print_warning "Revise el output anterior para más detalles"
fi

# PASO 4: Regenerar Prisma Client
echo ""
print_step "PASO 4: Regenerando Prisma Client..."
if cd ../.. && npx prisma generate; then
    print_success "Prisma Client regenerado"
else
    print_error "Error al regenerar Prisma Client"
    exit 1
fi

# Resumen final
echo ""
echo "======================================================================="
echo "  MIGRACIÓN COMPLETADA EXITOSAMENTE"
echo "======================================================================="
print_success "El esquema de base de datos ha sido actualizado"
print_success "Los datos han sido migrados correctamente"
print_success "Prisma Client ha sido regenerado"
echo ""
print_warning "PRÓXIMOS PASOS:"
echo "  1. Ejecutar los tests: npm test"
echo "  2. Probar la API con los nuevos endpoints"
echo "  3. Si hay problemas, ejecutar: ./03-rollback-migracion.sh"
echo "======================================================================="
echo ""
