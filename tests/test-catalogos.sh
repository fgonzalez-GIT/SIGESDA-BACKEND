#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:8000/api"
PASSED=0
FAILED=0

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       SUITE DE PRUEBAS - CATÁLOGOS DE ACTIVIDADES            ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Función para ejecutar test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected="$3"

    echo -e "${YELLOW}TEST:${NC} $test_name"
    RESULT=$(eval "$test_command" 2>&1)

    if echo "$RESULT" | grep -q "$expected"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "  Expected: $expected"
        echo "  Got: $RESULT"
        ((FAILED++))
    fi
    echo ""
}

# ============================================================================
# TIPOS DE ACTIVIDAD - CRUD
# ============================================================================

echo -e "${BLUE}[1/5] CRUD - TIPOS DE ACTIVIDAD${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1.1: Listar tipos
run_test "Listar todos los tipos" \
  "curl -s '$API_URL/actividades/tipos-actividad'" \
  '"success":true'

# Test 1.2: Obtener tipo por ID
run_test "Obtener tipo por ID=1" \
  "curl -s '$API_URL/actividades/tipos-actividad/1'" \
  '"id":1'

# Test 1.3: Actualizar tipo
run_test "Actualizar nombre del tipo ID=1" \
  "curl -s -X PUT '$API_URL/actividades/tipos-actividad/1' -H 'Content-Type: application/json' -d '{\"nombre\":\"Coro Test Updated\"}'" \
  '"success":true'

# Test 1.4: Código duplicado debe fallar
run_test "Rechazar código duplicado" \
  "curl -s -X POST '$API_URL/actividades/tipos-actividad' -H 'Content-Type: application/json' -d '{\"codigo\":\"CORO\",\"nombre\":\"Duplicado\"}'" \
  "Ya existe"

echo ""

# ============================================================================
# CATEGORÍAS DE ACTIVIDAD - CRUD
# ============================================================================

echo -e "${BLUE}[2/5] CRUD - CATEGORÍAS DE ACTIVIDAD${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 2.1: Listar categorías
run_test "Listar todas las categorías" \
  "curl -s '$API_URL/actividades/categorias-actividad'" \
  '"success":true'

# Test 2.2: Obtener categoría por ID
run_test "Obtener categoría por ID=1" \
  "curl -s '$API_URL/actividades/categorias-actividad/1'" \
  '"id":1'

# Test 2.3: Crear nueva categoría
run_test "Crear nueva categoría SENIOR" \
  "curl -s -X POST '$API_URL/actividades/categorias-actividad' -H 'Content-Type: application/json' -d '{\"codigo\":\"SENIOR\",\"nombre\":\"Adultos Mayores\"}'" \
  '"success":true'

# Test 2.4: Código duplicado debe fallar
run_test "Rechazar código duplicado en categorías" \
  "curl -s -X POST '$API_URL/actividades/categorias-actividad' -H 'Content-Type: application/json' -d '{\"codigo\":\"INFANTIL\",\"nombre\":\"Duplicado\"}'" \
  "Ya existe"

echo ""

# ============================================================================
# BÚSQUEDA Y FILTROS
# ============================================================================

echo -e "${BLUE}[3/5] BÚSQUEDA Y FILTROS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 3.1: Búsqueda por texto
run_test "Búsqueda por 'clase' en tipos" \
  "curl -s '$API_URL/actividades/tipos-actividad?search=clase'" \
  '"success":true'

# Test 3.2: Filtro includeInactive
run_test "Listar solo activos (por defecto)" \
  "curl -s '$API_URL/actividades/tipos-actividad'" \
  '"activo":true'

run_test "Listar incluyendo inactivos" \
  "curl -s '$API_URL/actividades/tipos-actividad?includeInactive=true'" \
  '"success":true'

# Test 3.3: Ordenamiento
run_test "Ordenar por nombre ASC" \
  "curl -s '$API_URL/actividades/tipos-actividad?orderBy=nombre&orderDir=asc'" \
  '"success":true'

run_test "Ordenar por orden DESC" \
  "curl -s '$API_URL/actividades/tipos-actividad?orderBy=orden&orderDir=desc'" \
  '"success":true'

echo ""

# ============================================================================
# REORDENAMIENTO
# ============================================================================

echo -e "${BLUE}[4/5] REORDENAMIENTO${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 4.1: Reordenar tipos
run_test "Reordenar tipos de actividad" \
  "curl -s -X PATCH '$API_URL/actividades/tipos-actividad/reorder' -H 'Content-Type: application/json' -d '{\"ids\":[1,2,3]}'" \
  '"success":true'

# Test 4.2: Reordenar categorías
run_test "Reordenar categorías de actividad" \
  "curl -s -X PATCH '$API_URL/actividades/categorias-actividad/reorder' -H 'Content-Type: application/json' -d '{\"ids\":[1,2,3]}'" \
  '"success":true'

echo ""

# ============================================================================
# VALIDACIONES
# ============================================================================

echo -e "${BLUE}[5/5] VALIDACIONES${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 5.1: ID inválido
run_test "Rechazar ID inválido" \
  "curl -s '$API_URL/actividades/tipos-actividad/abc'" \
  '"error":'

# Test 5.2: Nombre vacío
run_test "Rechazar nombre vacío" \
  "curl -s -X POST '$API_URL/actividades/tipos-actividad' -H 'Content-Type: application/json' -d '{\"codigo\":\"TEST\",\"nombre\":\"\"}'" \
  "error"

# Test 5.3: Código vacío
run_test "Rechazar código vacío" \
  "curl -s -X POST '$API_URL/actividades/tipos-actividad' -H 'Content-Type: application/json' -d '{\"codigo\":\"\",\"nombre\":\"Test\"}'" \
  "error"

# Test 5.4: Array vacío en reorder
run_test "Rechazar array vacío en reorder" \
  "curl -s -X PATCH '$API_URL/actividades/tipos-actividad/reorder' -H 'Content-Type: application/json' -d '{\"ids\":[]}'" \
  "error"

echo ""

# ============================================================================
# RESUMEN
# ============================================================================

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     RESUMEN DE PRUEBAS                        ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total de pruebas ejecutadas: $((PASSED + FAILED))"
echo -e "${GREEN}Pruebas exitosas: $PASSED${NC}"
echo -e "${RED}Pruebas fallidas: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 TODAS LAS PRUEBAS PASARON EXITOSAMENTE 🎉${NC}"
    exit 0
else
    echo -e "${RED}⚠️  ALGUNAS PRUEBAS FALLARON ⚠️${NC}"
    exit 1
fi
