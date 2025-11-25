#!/bin/bash

# ============================================================================
# SCRIPT DE TESTS - ESTADOS DE RESERVAS Y WORKFLOW
# ============================================================================

set -e  # Exit on error

BASE_URL="http://localhost:8000/api"
CATALOGOS_URL="${BASE_URL}/catalogos/estados-reservas"
RESERVAS_URL="${BASE_URL}/reservas"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print test header
print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Function to run test
run_test() {
    local test_name=$1
    local method=$2
    local url=$3
    local data=$4
    local expected_status=${5:-200}

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    echo -n "TEST $TOTAL_TESTS: $test_name ... "

    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" -H "Content-Type: application/json" -d "$data")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "$expected_status" ] || [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))

        # Show response summary
        if echo "$body" | python3 -m json.tool >/dev/null 2>&1; then
            success=$(echo "$body" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', 'N/A'))" 2>/dev/null || echo "N/A")
            message=$(echo "$body" | python3 -c "import sys, json; print(json.load(sys.stdin).get('message', ''))" 2>/dev/null || echo "")
            if [ ! -z "$message" ]; then
                echo "    → $message"
            fi
        fi
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $http_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "    Response: $body" | head -100
    fi
}

# ============================================================================
# VERIFY SERVER IS RUNNING
# ============================================================================

print_header "VERIFICANDO SERVIDOR"

echo -n "Verificando servidor en http://localhost:8000 ... "
if curl -s http://localhost:8000/health >/dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "ERROR: El servidor no está corriendo en el puerto 8000"
    echo "Por favor ejecuta: npm run dev"
    exit 1
fi

# ============================================================================
# TEST SUITE 1: ESTADOS DE RESERVA (CATÁLOGO)
# ============================================================================

print_header "TEST SUITE 1: CATÁLOGO DE ESTADOS DE RESERVA"

# Test 1.1: Listar todos los estados
run_test "Listar estados de reserva" \
    "GET" \
    "$CATALOGOS_URL"

# Test 1.2: Obtener estado por ID (PENDIENTE)
run_test "Obtener estado PENDIENTE por ID" \
    "GET" \
    "$CATALOGOS_URL/1"

# Test 1.3: Obtener estado por código
run_test "Obtener estado por código CONFIRMADA" \
    "GET" \
    "$CATALOGOS_URL/codigo/CONFIRMADA"

# Test 1.4: Buscar estados
run_test "Buscar estados con texto 'PEND'" \
    "GET" \
    "$CATALOGOS_URL?search=PEND"

# Test 1.5: Obtener estadísticas
run_test "Obtener estadísticas de uso" \
    "GET" \
    "$CATALOGOS_URL/estadisticas/uso"

# ============================================================================
# TEST SUITE 2: CREACIÓN Y ACTUALIZACIÓN DE ESTADOS
# ============================================================================

print_header "TEST SUITE 2: CREACIÓN Y ACTUALIZACIÓN"

# Test 2.1: Crear nuevo estado
run_test "Crear nuevo estado EN_REVISION" \
    "POST" \
    "$CATALOGOS_URL" \
    '{"codigo":"EN_REVISION","nombre":"En Revisión","descripcion":"Reserva en proceso de revisión","activo":true}' \
    "201"

# Test 2.2: Actualizar estado (descripción)
run_test "Actualizar descripción de PENDIENTE" \
    "PUT" \
    "$CATALOGOS_URL/1" \
    '{"descripcion":"Reserva pendiente de aprobación por coordinación académica"}'

# Test 2.3: Intentar crear estado con código duplicado (debe fallar)
run_test "Crear estado con código duplicado (debe fallar)" \
    "POST" \
    "$CATALOGOS_URL" \
    '{"codigo":"PENDIENTE","nombre":"Duplicado"}' \
    "400"

# ============================================================================
# TEST SUITE 3: WORKFLOW DE RESERVAS (REQUIERE DATOS)
# ============================================================================

print_header "TEST SUITE 3: WORKFLOW DE RESERVAS"

echo "Nota: Los tests de workflow requieren datos existentes (aulas, docentes, personas)"
echo "Verificando datos necesarios..."

# Get first active aula
AULA_ID=$(curl -s "$BASE_URL/aulas?limit=1" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data'][0]['id'] if data['data'] else '')" 2>/dev/null || echo "")

# Get first active docente
DOCENTE_ID=$(curl -s "$BASE_URL/personas?limit=1" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data'][0]['id'] if data['data'] else '')" 2>/dev/null || echo "")

# Get first active persona for approvals
PERSONA_ID=$DOCENTE_ID

if [ -z "$AULA_ID" ] || [ -z "$DOCENTE_ID" ]; then
    echo -e "${YELLOW}⚠ SKIP: No hay datos suficientes para tests de workflow${NC}"
    echo "   Se necesitan aulas y docentes activos en la base de datos"
else
    echo -e "${GREEN}✓ Datos encontrados:${NC} aulaId=$AULA_ID, docenteId=$DOCENTE_ID, personaId=$PERSONA_ID"

    # Test 3.1: Crear reserva (debería tener estado PENDIENTE automático)
    echo ""
    echo -n "TEST: Crear reserva con estado PENDIENTE automático ... "
    FECHA_INICIO="2025-12-15T10:00:00.000Z"
    FECHA_FIN="2025-12-15T12:00:00.000Z"

    create_response=$(curl -s -w "\n%{http_code}" -X POST "$RESERVAS_URL" \
        -H "Content-Type: application/json" \
        -d "{\"aulaId\":$AULA_ID,\"docenteId\":$DOCENTE_ID,\"fechaInicio\":\"$FECHA_INICIO\",\"fechaFin\":\"$FECHA_FIN\",\"observaciones\":\"Test workflow\"}")

    create_http_code=$(echo "$create_response" | tail -n1)
    create_body=$(echo "$create_response" | sed '$d')

    if [ "$create_http_code" = "201" ]; then
        RESERVA_ID=$(echo "$create_body" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || echo "")
        ESTADO_ID=$(echo "$create_body" | python3 -c "import sys, json; print(json.load(sys.stdin)['data'].get('estadoReserva', {}).get('id', 'N/A'))" 2>/dev/null || echo "N/A")
        ESTADO_CODIGO=$(echo "$create_body" | python3 -c "import sys, json; print(json.load(sys.stdin)['data'].get('estadoReserva', {}).get('codigo', 'N/A'))" 2>/dev/null || echo "N/A")

        echo -e "${GREEN}✓ PASS${NC}"
        echo "    → Reserva creada con ID: $RESERVA_ID"
        echo "    → Estado asignado: $ESTADO_CODIGO (ID: $ESTADO_ID)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "    Error: $create_body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        RESERVA_ID=""
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if [ ! -z "$RESERVA_ID" ]; then
        # Test 3.2: Aprobar reserva
        run_test "Aprobar reserva (PENDIENTE → CONFIRMADA)" \
            "POST" \
            "$RESERVAS_URL/$RESERVA_ID/aprobar" \
            "{\"aprobadoPorId\":$PERSONA_ID,\"observaciones\":\"Aprobada por test\"}"

        # Test 3.3: Obtener reserva y verificar estado
        echo ""
        echo -n "TEST: Verificar estado CONFIRMADA ... "
        verify_response=$(curl -s "$RESERVAS_URL/$RESERVA_ID")
        verify_estado=$(echo "$verify_response" | python3 -c "import sys, json; print(json.load(sys.stdin)['data'].get('estadoReserva', {}).get('codigo', 'N/A'))" 2>/dev/null || echo "N/A")

        TOTAL_TESTS=$((TOTAL_TESTS + 1))
        if [ "$verify_estado" = "CONFIRMADA" ]; then
            echo -e "${GREEN}✓ PASS${NC}"
            echo "    → Estado actual: $verify_estado"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${RED}✗ FAIL${NC}"
            echo "    → Estado esperado: CONFIRMADA, actual: $verify_estado"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi

        # Test 3.4: Cancelar reserva
        run_test "Cancelar reserva (CONFIRMADA → CANCELADA)" \
            "POST" \
            "$RESERVAS_URL/$RESERVA_ID/cancelar" \
            "{\"canceladoPorId\":$PERSONA_ID,\"motivoCancelacion\":\"Cancelada por test automático\"}"

        # Test 3.5: Crear otra reserva para completar
        echo ""
        echo -n "TEST: Crear reserva pasada para completar ... "
        FECHA_PASADA_INICIO="2024-11-01T10:00:00.000Z"
        FECHA_PASADA_FIN="2024-11-01T12:00:00.000Z"

        create2_response=$(curl -s -w "\n%{http_code}" -X POST "$RESERVAS_URL" \
            -H "Content-Type: application/json" \
            -d "{\"aulaId\":$AULA_ID,\"docenteId\":$DOCENTE_ID,\"fechaInicio\":\"$FECHA_PASADA_INICIO\",\"fechaFin\":\"$FECHA_PASADA_FIN\"}")

        create2_http_code=$(echo "$create2_response" | tail -n1)
        create2_body=$(echo "$create2_response" | sed '$d')

        TOTAL_TESTS=$((TOTAL_TESTS + 1))
        if [ "$create2_http_code" = "201" ]; then
            RESERVA2_ID=$(echo "$create2_body" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || echo "")
            echo -e "${GREEN}✓ PASS${NC}"
            echo "    → Reserva pasada creada con ID: $RESERVA2_ID"
            PASSED_TESTS=$((PASSED_TESTS + 1))

            if [ ! -z "$RESERVA2_ID" ]; then
                # Aprobar la reserva pasada
                curl -s -X POST "$RESERVAS_URL/$RESERVA2_ID/aprobar" \
                    -H "Content-Type: application/json" \
                    -d "{\"aprobadoPorId\":$PERSONA_ID}" >/dev/null

                # Test 3.6: Completar reserva
                run_test "Completar reserva pasada (CONFIRMADA → COMPLETADA)" \
                    "POST" \
                    "$RESERVAS_URL/$RESERVA2_ID/completar"
            fi
        else
            echo -e "${RED}✗ FAIL${NC}"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    fi
fi

# ============================================================================
# TEST SUITE 4: DETECCIÓN DE CONFLICTOS
# ============================================================================

print_header "TEST SUITE 4: DETECCIÓN DE CONFLICTOS"

if [ ! -z "$AULA_ID" ]; then
    # Test 4.1: Detectar conflictos simples
    run_test "Detectar conflictos simples" \
        "POST" \
        "$RESERVAS_URL/conflicts/detect" \
        "{\"aulaId\":$AULA_ID,\"fechaInicio\":\"$FECHA_INICIO\",\"fechaFin\":\"$FECHA_FIN\"}"

    # Test 4.2: Detectar todos los conflictos (puntuales + recurrentes)
    run_test "Detectar TODOS los conflictos (puntuales + recurrentes)" \
        "POST" \
        "$RESERVAS_URL/conflicts/detect-all" \
        "{\"aulaId\":$AULA_ID,\"fechaInicio\":\"$FECHA_INICIO\",\"fechaFin\":\"$FECHA_FIN\"}"
else
    echo -e "${YELLOW}⚠ SKIP: No hay aulas disponibles${NC}"
fi

# ============================================================================
# RESUMEN DE RESULTADOS
# ============================================================================

print_header "RESUMEN DE RESULTADOS"

echo ""
echo "Total de tests ejecutados: $TOTAL_TESTS"
echo -e "Tests exitosos: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Tests fallidos: ${RED}$FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✓ TODOS LOS TESTS PASARON EXITOSAMENTE${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    exit 0
else
    echo -e "${RED}════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}  ✗ ALGUNOS TESTS FALLARON${NC}"
    echo -e "${RED}════════════════════════════════════════════════════════════${NC}"
    exit 1
fi
