#!/bin/bash

##############################################################################
# TEST BÁSICO DEL SIMULADOR DE CUOTAS
# FASE 5 - Task 5.1: Simulador de impacto
#
# Este script prueba los endpoints básicos del simulador de cuotas
##############################################################################

BASE_URL="http://localhost:3001/api"
HEADERS="Content-Type: application/json"

echo "========================================="
echo "TEST: Simulador de Cuotas - FASE 5"
echo "========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para test
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4

  echo -n "Testing: $name... "

  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
  else
    response=$(curl -s -X "$method" -H "$HEADERS" -d "$data" -w "\n%{http_code}" "$BASE_URL$endpoint")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    if [ ! -z "$body" ]; then
      echo "$body" | python3 -m json.tool 2>/dev/null | head -20
    fi
  else
    echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
    echo "$body"
  fi
  echo ""
}

##############################################################################
# TEST 1: Health Check
##############################################################################
echo "--- Test 1: Health Check ---"
test_endpoint "Health Check del Simulador" "GET" "/simulador/cuotas/health" ""

##############################################################################
# TEST 2: Simulación de Generación
##############################################################################
echo "--- Test 2: Simulación de Generación ---"
test_endpoint "Simular generación Diciembre 2025" "POST" "/simulador/cuotas/generacion" '{
  "mes": 12,
  "anio": 2025,
  "aplicarDescuentos": true,
  "aplicarAjustes": true,
  "aplicarExenciones": true,
  "incluirInactivos": false
}'

##############################################################################
# TEST 3: Simulación de Generación (Solo un socio)
##############################################################################
echo "--- Test 3: Simulación para un socio específico ---"
test_endpoint "Simular generación para socio ID 1" "POST" "/simulador/cuotas/generacion" '{
  "mes": 12,
  "anio": 2025,
  "socioIds": [1],
  "aplicarDescuentos": true,
  "aplicarAjustes": false,
  "aplicarExenciones": false
}'

##############################################################################
# TEST 4: Comparación de Escenarios
##############################################################################
echo "--- Test 4: Comparación de Escenarios ---"
test_endpoint "Comparar 2 escenarios" "POST" "/simulador/cuotas/escenarios" '{
  "mes": 12,
  "anio": 2025,
  "escenarios": [
    {
      "nombre": "Escenario Base",
      "descripcion": "Con todos los descuentos actuales",
      "aplicarDescuentos": true,
      "aplicarAjustes": true,
      "aplicarExenciones": true
    },
    {
      "nombre": "Escenario Sin Descuentos",
      "descripcion": "Sin aplicar descuentos automáticos",
      "aplicarDescuentos": false,
      "aplicarAjustes": true,
      "aplicarExenciones": true
    }
  ]
}'

##############################################################################
# TEST 5: Simulación de Impacto Masivo
##############################################################################
echo "--- Test 5: Simulación de Impacto Masivo ---"
test_endpoint "Simular impacto con cambios de configuración" "POST" "/simulador/cuotas/impacto-masivo" '{
  "mes": 12,
  "anio": 2025,
  "cambios": {
    "ajusteGlobalPorcentaje": 10
  },
  "incluirProyeccion": false
}'

##############################################################################
# TEST 6: Simulación con Proyección
##############################################################################
echo "--- Test 6: Simulación con Proyección a 3 meses ---"
test_endpoint "Simular con proyección" "POST" "/simulador/cuotas/impacto-masivo" '{
  "mes": 12,
  "anio": 2025,
  "cambios": {
    "ajusteGlobalPorcentaje": 5
  },
  "incluirProyeccion": true,
  "mesesProyeccion": 3
}'

##############################################################################
# RESUMEN
##############################################################################
echo "========================================="
echo "Tests completados"
echo "========================================="
echo ""
echo "Para probar manualmente con curl:"
echo ""
echo "# Health check:"
echo "curl http://localhost:3001/api/simulador/cuotas/health"
echo ""
echo "# Simular generación:"
echo "curl -X POST http://localhost:3001/api/simulador/cuotas/generacion \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"mes\": 12, \"anio\": 2025, \"aplicarDescuentos\": true}'"
echo ""
