#!/bin/bash

# Test completo de API de Personas y Relaciones Familiares
# Basado en API-PERSONAS-FAMILIARES.md

BASE_URL="http://localhost:8000/api"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables globales para almacenar IDs
PERSONA_ID=""
PERSONA2_ID=""
FAMILIAR_ID=""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  TEST COMPLETO DE API PERSONAS Y FAMILIARES${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Función para mostrar resultado de test
test_result() {
    local test_name=$1
    local response=$2
    local expected_success=$3

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    # Verificar si la respuesta contiene "success":true o "success":false
    if echo "$response" | grep -q '"success":true'; then
        actual_success=true
    else
        actual_success=false
    fi

    if [ "$actual_success" = "$expected_success" ]; then
        echo -e "${GREEN}✓ PASS${NC} - $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} - $test_name"
        echo -e "${YELLOW}Response:${NC} $response"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Función para extraer ID de respuesta JSON
extract_id() {
    local response=$1
    echo "$response" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*'
}

echo -e "${BLUE}=== 1. TESTS DE API DE PERSONAS ===${NC}\n"

# TEST 1: Crear Persona (Socio)
echo -e "${YELLOW}Test 1.1: Crear Persona - Socio${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/personas" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "apellido": "Usuario",
    "dni": "99999999",
    "email": "test.usuario@example.com",
    "telefono": "3515551234",
    "fechaNacimiento": "1990-05-15T00:00:00.000Z"
  }')
test_result "Crear persona base" "$RESPONSE" true
PERSONA_ID=$(extract_id "$RESPONSE")
echo -e "  ${BLUE}→ Persona ID: $PERSONA_ID${NC}\n"

# TEST 2: Obtener Persona por ID
echo -e "${YELLOW}Test 1.2: Obtener Persona por ID${NC}"
RESPONSE=$(curl -s "$BASE_URL/personas/$PERSONA_ID")
test_result "Obtener persona por ID" "$RESPONSE" true
echo ""

# TEST 3: Actualizar Persona
echo -e "${YELLOW}Test 1.3: Actualizar Persona${NC}"
RESPONSE=$(curl -s -X PUT "$BASE_URL/personas/$PERSONA_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test Actualizado",
    "apellido": "Usuario Modificado",
    "telefono": "3515559999"
  }')
test_result "Actualizar persona" "$RESPONSE" true
echo ""

# TEST 4: Listar Personas con paginación
echo -e "${YELLOW}Test 1.4: Listar Personas (paginación)${NC}"
RESPONSE=$(curl -s "$BASE_URL/personas?page=1&limit=5")
test_result "Listar personas con paginación" "$RESPONSE" true
echo ""

# TEST 5: Búsqueda de Personas
echo -e "${YELLOW}Test 1.5: Buscar Personas${NC}"
RESPONSE=$(curl -s "$BASE_URL/personas/buscar?q=Test")
test_result "Buscar personas por nombre" "$RESPONSE" true
echo ""

# TEST 6: Verificar DNI único
echo -e "${YELLOW}Test 1.6: Verificar DNI${NC}"
RESPONSE=$(curl -s "$BASE_URL/personas/verificar-dni/99999999")
test_result "Verificar DNI existente" "$RESPONSE" true
echo ""

# TEST 7: Crear segunda persona para relaciones familiares
echo -e "${YELLOW}Test 1.7: Crear Segunda Persona${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/personas" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Familiar",
    "apellido": "Test",
    "dni": "88888888",
    "email": "familiar.test@example.com",
    "fechaNacimiento": "1995-08-20T00:00:00.000Z"
  }')
test_result "Crear segunda persona" "$RESPONSE" true
PERSONA2_ID=$(extract_id "$RESPONSE")
echo -e "  ${BLUE}→ Persona 2 ID: $PERSONA2_ID${NC}\n"

echo -e "${BLUE}=== 2. TESTS DE API DE RELACIONES FAMILIARES ===${NC}\n"

# TEST 8: Listar tipos de parentesco
echo -e "${YELLOW}Test 2.1: Listar Tipos de Parentesco${NC}"
RESPONSE=$(curl -s "$BASE_URL/familiares/tipos-parentesco")
test_result "Listar tipos de parentesco" "$RESPONSE" true
echo ""

# TEST 9: Crear Relación Familiar
echo -e "${YELLOW}Test 2.2: Crear Relación Familiar${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/familiares" \
  -H "Content-Type: application/json" \
  -d '{
    "socioId": '"$PERSONA_ID"',
    "familiarId": '"$PERSONA2_ID"',
    "parentesco": "HERMANO",
    "autorizadoRetiro": true,
    "descuentoFamiliar": 10
  }')
test_result "Crear relación familiar (hermano)" "$RESPONSE" true
FAMILIAR_ID=$(extract_id "$RESPONSE")
echo -e "  ${BLUE}→ Relación ID: $FAMILIAR_ID${NC}\n"

# TEST 10: Obtener relación por ID
echo -e "${YELLOW}Test 2.3: Obtener Relación por ID${NC}"
RESPONSE=$(curl -s "$BASE_URL/familiares/$FAMILIAR_ID")
test_result "Obtener relación por ID" "$RESPONSE" true
echo ""

# TEST 11: Listar familiares de un socio
echo -e "${YELLOW}Test 2.4: Listar Familiares de un Socio${NC}"
RESPONSE=$(curl -s "$BASE_URL/familiares/socio/$PERSONA_ID/familiares")
test_result "Listar familiares del socio" "$RESPONSE" true
echo ""

# TEST 12: Obtener árbol familiar
echo -e "${YELLOW}Test 2.5: Obtener Árbol Familiar${NC}"
RESPONSE=$(curl -s "$BASE_URL/familiares/socio/$PERSONA_ID/arbol")
test_result "Obtener árbol familiar" "$RESPONSE" true
echo ""

# TEST 13: Verificar relación
echo -e "${YELLOW}Test 2.6: Verificar Relación${NC}"
RESPONSE=$(curl -s "$BASE_URL/familiares/verificar/$PERSONA_ID/$PERSONA2_ID")
test_result "Verificar relación entre personas" "$RESPONSE" true
echo ""

# TEST 14: Actualizar relación familiar
echo -e "${YELLOW}Test 2.7: Actualizar Relación Familiar${NC}"
RESPONSE=$(curl -s -X PUT "$BASE_URL/familiares/$FAMILIAR_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "descuentoFamiliar": 15,
    "autorizadoRetiro": false
  }')
test_result "Actualizar relación familiar" "$RESPONSE" true
echo ""

# TEST 15: Listar todas las relaciones
echo -e "${YELLOW}Test 2.8: Listar Todas las Relaciones${NC}"
RESPONSE=$(curl -s "$BASE_URL/familiares?page=1&limit=10")
test_result "Listar todas las relaciones" "$RESPONSE" true
echo ""

echo -e "${BLUE}=== 3. TESTS DE VALIDACIÓN Y ERRORES ===${NC}\n"

# TEST 16: Intentar crear persona con DNI duplicado (debe fallar)
echo -e "${YELLOW}Test 3.1: DNI Duplicado (debe fallar)${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/personas" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Duplicado",
    "apellido": "Test",
    "dni": "99999999",
    "email": "otro@example.com"
  }')
test_result "Rechazar DNI duplicado" "$RESPONSE" false
echo ""

# TEST 17: Obtener persona inexistente (debe fallar)
echo -e "${YELLOW}Test 3.2: Persona Inexistente (debe fallar)${NC}"
RESPONSE=$(curl -s "$BASE_URL/personas/999999")
test_result "Rechazar persona inexistente" "$RESPONSE" false
echo ""

# TEST 18: Crear relación con parentesco inválido (debe fallar)
echo -e "${YELLOW}Test 3.3: Parentesco Inválido (debe fallar)${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/familiares" \
  -H "Content-Type: application/json" \
  -d '{
    "socioId": '"$PERSONA_ID"',
    "familiarId": '"$PERSONA2_ID"',
    "parentesco": "INVALIDO"
  }')
test_result "Rechazar parentesco inválido" "$RESPONSE" false
echo ""

echo -e "${BLUE}=== 4. CLEANUP - ELIMINAR DATOS DE TEST ===${NC}\n"

# TEST 19: Eliminar relación familiar
echo -e "${YELLOW}Test 4.1: Eliminar Relación Familiar${NC}"
RESPONSE=$(curl -s -X DELETE "$BASE_URL/familiares/$FAMILIAR_ID")
test_result "Eliminar relación familiar" "$RESPONSE" true
echo ""

# TEST 20: Eliminar personas
echo -e "${YELLOW}Test 4.2: Eliminar Personas${NC}"
RESPONSE=$(curl -s -X DELETE "$BASE_URL/personas/$PERSONA_ID")
test_result "Eliminar persona 1" "$RESPONSE" true

RESPONSE=$(curl -s -X DELETE "$BASE_URL/personas/$PERSONA2_ID")
test_result "Eliminar persona 2" "$RESPONSE" true
echo ""

# RESUMEN FINAL
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  RESUMEN DE TESTS${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total de tests:   $TOTAL_TESTS"
echo -e "${GREEN}Tests exitosos:   $PASSED_TESTS${NC}"
echo -e "${RED}Tests fallidos:   $FAILED_TESTS${NC}"
echo -e "${BLUE}========================================${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ TODOS LOS TESTS PASARON EXITOSAMENTE${NC}\n"
    exit 0
else
    echo -e "${RED}✗ ALGUNOS TESTS FALLARON${NC}\n"
    exit 1
fi
