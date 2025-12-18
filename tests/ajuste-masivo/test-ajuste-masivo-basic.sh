#!/bin/bash

##############################################################################
# TEST BÁSICO DE AJUSTE MASIVO DE CUOTAS
# FASE 5 - Task 5.2: Herramienta de ajuste masivo
#
# Este script prueba los endpoints de ajuste masivo
##############################################################################

BASE_URL="http://localhost:3001/api"
HEADERS="Content-Type: application/json"

echo "========================================="
echo "TEST: Ajuste Masivo - FASE 5"
echo "========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

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
      echo "$body" | python3 -m json.tool 2>/dev/null | head -30
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
test_endpoint "Health Check" "GET" "/ajustes/masivo/health" ""

##############################################################################
# TEST 2: Preview de Ajuste Masivo (Descuento 10%)
##############################################################################
echo "--- Test 2: Preview Descuento 10% ---"
test_endpoint "Preview descuento 10% Diciembre 2025" "POST" "/ajustes/masivo" '{
  "filtros": {
    "mes": 12,
    "anio": 2025
  },
  "tipoAjuste": "DESCUENTO_PORCENTAJE",
  "valor": 10,
  "motivo": "Promoción de fin de año",
  "modo": "PREVIEW"
}'

##############################################################################
# TEST 3: Preview con Filtros (Solo categoría específica)
##############################################################################
echo "--- Test 3: Preview con Filtros por Categoría ---"
test_endpoint "Preview solo categoría 1" "POST" "/ajustes/masivo" '{
  "filtros": {
    "mes": 12,
    "anio": 2025,
    "categoriaIds": [1]
  },
  "tipoAjuste": "DESCUENTO_FIJO",
  "valor": 500,
  "motivo": "Descuento especial categoría adultos",
  "condiciones": {
    "montoMinimo": 5000
  },
  "modo": "PREVIEW"
}'

##############################################################################
# TEST 4: Preview Recargo (Inflación)
##############################################################################
echo "--- Test 4: Preview Recargo por Inflación ---"
test_endpoint "Preview recargo 5% inflación" "POST" "/ajustes/masivo" '{
  "filtros": {
    "mes": 1,
    "anio": 2026
  },
  "tipoAjuste": "RECARGO_PORCENTAJE",
  "valor": 5,
  "motivo": "Ajuste por inflación estimada",
  "modo": "PREVIEW"
}'

##############################################################################
# TEST 5: Descuento Global
##############################################################################
echo "--- Test 5: Descuento Global al Período ---"
test_endpoint "Descuento global 15%" "POST" "/ajustes/descuento-global" '{
  "mes": 12,
  "anio": 2025,
  "tipoDescuento": "PORCENTAJE",
  "valor": 15,
  "motivo": "Descuento navideño para todos los socios",
  "modo": "PREVIEW"
}'

##############################################################################
# TEST 6: Modificación Masiva de Ítems
##############################################################################
echo "--- Test 6: Modificar Ítems (Multiplicar Monto) ---"
test_endpoint "Multiplicar montos de actividades" "POST" "/ajustes/modificar-items" '{
  "filtros": {
    "mes": 12,
    "anio": 2025,
    "conceptoContiene": "Guitarra"
  },
  "modificaciones": {
    "multiplicarMonto": 1.1
  },
  "motivo": "Ajuste de precios de actividades musicales 10%",
  "modo": "PREVIEW"
}'

##############################################################################
# TEST 7: Validación de Errores (Sin confirmación en modo APLICAR)
##############################################################################
echo "--- Test 7: Validación - Sin Confirmación ---"
echo -e "${YELLOW}Este test debe fallar (esperado)${NC}"
test_endpoint "Aplicar sin confirmar (debe fallar)" "POST" "/ajustes/masivo" '{
  "filtros": {
    "mes": 12,
    "anio": 2025
  },
  "tipoAjuste": "DESCUENTO_PORCENTAJE",
  "valor": 10,
  "motivo": "Test sin confirmación",
  "modo": "APLICAR"
}'

##############################################################################
# RESUMEN
##############################################################################
echo "========================================="
echo "Tests completados"
echo "========================================="
echo ""
echo -e "${YELLOW}IMPORTANTE:${NC}"
echo "Los tests en modo PREVIEW no modifican la base de datos."
echo "Para aplicar cambios reales, use modo: 'APLICAR' con confirmarAplicacion: true"
echo ""
echo "Para probar manualmente con curl:"
echo ""
echo "# Preview de ajuste masivo:"
echo "curl -X POST http://localhost:3001/api/ajustes/masivo \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"filtros\": {\"mes\": 12, \"anio\": 2025}, \"tipoAjuste\": \"DESCUENTO_PORCENTAJE\", \"valor\": 10, \"motivo\": \"Test\", \"modo\": \"PREVIEW\"}'"
echo ""
echo "# Aplicar ajuste (CUIDADO - modifica BD):"
echo "curl -X POST http://localhost:3001/api/ajustes/masivo \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"filtros\": {\"mes\": 12, \"anio\": 2025}, \"tipoAjuste\": \"DESCUENTO_PORCENTAJE\", \"valor\": 10, \"motivo\": \"Promoción\", \"modo\": \"APLICAR\", \"confirmarAplicacion\": true}'"
echo ""
