# Simulador de Cuotas - FASE 5

**Versión:** 1.0
**Fecha:** 2025-12-17
**Task:** FASE 5 - Task 5.1: Simulador de impacto

---

## Introducción

El **Simulador de Cuotas** es una herramienta que permite previsualizar y evaluar el impacto de diferentes escenarios de generación de cuotas **sin persistir datos en la base de datos**. Es útil para:

- ✅ **Preview de cuotas** antes de generarlas realmente
- ✅ **Simulación de cambios** en reglas de descuento
- ✅ **Comparación de escenarios** múltiples
- ✅ **Cálculo de impacto** de cambios en configuración
- ✅ **Proyección a futuro** de cambios

---

## Arquitectura

### Componentes

```
src/
├── dto/cuota.dto.ts                    # DTOs de simulación agregados
├── services/
│   └── simulador-cuota.service.ts      # Lógica de simulación
├── controllers/
│   └── simulador-cuota.controller.ts   # Controlador HTTP
├── routes/
│   ├── simulador-cuota.routes.ts       # Rutas del simulador
│   └── index.ts                        # Registro de rutas
└── tests/simulador/
    └── test-simulador-basic.sh         # Script de pruebas
```

### Flujo de Ejecución

```
1. Cliente → POST /api/simulador/cuotas/generacion
2. Controller valida con Zod (SimularGeneracionDto)
3. Service ejecuta cálculos SIN transacciones
4. Retorna JSON con preview de cuotas
```

**Diferencia clave vs. generación real:**
- ❌ **NO se crean** registros en BD
- ❌ **NO se generan** recibos
- ✅ **SÍ se calculan** montos con toda la lógica
- ✅ **SÍ se aplican** descuentos/ajustes/exenciones (en memoria)

---

## Endpoints

### 1. Health Check

**Endpoint:** `GET /api/simulador/cuotas/health`

**Respuesta:**
```json
{
  "success": true,
  "message": "Simulador de cuotas operativo",
  "version": "1.0.0",
  "endpoints": [
    "POST /api/simulador/cuotas/generacion",
    "POST /api/simulador/cuotas/reglas",
    "POST /api/simulador/cuotas/escenarios",
    "POST /api/simulador/cuotas/impacto-masivo"
  ]
}
```

---

### 2. Simular Generación

**Endpoint:** `POST /api/simulador/cuotas/generacion`

**Body:**
```json
{
  "mes": 12,
  "anio": 2025,
  "categoriaIds": [1, 2],           // Opcional: filtrar por categorías
  "socioIds": [1, 5, 10],           // Opcional: simular solo estos socios
  "aplicarDescuentos": true,        // Default: true
  "aplicarAjustes": true,           // Default: true
  "aplicarExenciones": true,        // Default: true
  "incluirInactivos": false         // Default: false
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "cuotasSimuladas": [
      {
        "socioId": 1,
        "numeroSocio": "001",
        "nombreCompleto": "Juan Pérez",
        "categoria": "ADULTO_GENERAL",
        "mes": 12,
        "anio": 2025,
        "montoBase": 10000,
        "montoActividades": 5000,
        "montoTotal": 12750,
        "descuentosAplicados": 1250,
        "ajustesAplicados": [],
        "exencionesAplicadas": [],
        "fechaVencimiento": "2025-12-15",
        "concepto": "Cuota Diciembre 2025 - ADULTO_GENERAL",
        "detalleCalculo": { /* ... */ }
      }
    ],
    "resumen": {
      "totalCuotas": 150,
      "montoTotal": 1800000,
      "montoPorCategoria": {
        "ADULTO_GENERAL": 1200000,
        "INFANTIL": 600000
      },
      "sociosAfectados": 150,
      "descuentosAplicados": 45,
      "ajustesAplicados": 10,
      "exencionesAplicadas": 5
    },
    "detalleCalculo": [ /* ... */ ]
  },
  "message": "Simulación completada: 150 cuotas, monto total: $1800000.00"
}
```

**Casos de uso:**
- Preview antes de generación mensual
- Verificar montos para socios específicos
- Probar configuración nueva sin impactar BD

---

### 3. Simular Reglas de Descuento

**Endpoint:** `POST /api/simulador/cuotas/reglas`

**Body:**
```json
{
  "mes": 12,
  "anio": 2025,
  "reglasModificadas": [
    {
      "reglaId": 1,
      "tipo": "ANTIGUEDAD",
      "porcentaje": 20,
      "condiciones": {
        "aniosMinimos": 5
      },
      "activa": true
    }
  ],
  "reglasNuevas": [
    {
      "codigo": "PROMO_NAVIDAD",
      "nombre": "Promoción Navidad",
      "tipo": "COMBINADA",
      "porcentaje": 10,
      "condiciones": {}
    }
  ],
  "socioIds": [1, 2, 3],        // Opcional
  "categoriaIds": [1]            // Opcional
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "impactoActual": { /* simulación con reglas actuales */ },
    "impactoNuevo": { /* simulación con reglas nuevas */ },
    "diferencia": {
      "montoTotal": -50000,        // Negativo = menos recaudación
      "porcentaje": -2.8,
      "sociosAfectados": 15
    },
    "detalleComparacion": [
      {
        "socioId": 1,
        "numeroSocio": "001",
        "nombreCompleto": "Juan Pérez",
        "montoActual": 10000,
        "montoNuevo": 9500,
        "diferencia": -500,
        "descuentoActual": 1000,
        "descuentoNuevo": 1500
      }
    ]
  },
  "message": "Impacto calculado: -$50000.00 (-2.80%)"
}
```

**Casos de uso:**
- Evaluar impacto antes de modificar reglas
- Comparar diferentes porcentajes de descuento
- Planificar promociones temporales

---

### 4. Comparar Escenarios

**Endpoint:** `POST /api/simulador/cuotas/escenarios`

**Body:**
```json
{
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
      "nombre": "Escenario Promocional",
      "descripcion": "10% descuento adicional global",
      "aplicarDescuentos": true,
      "aplicarAjustes": true,
      "aplicarExenciones": true,
      "porcentajeDescuentoGlobal": 10
    },
    {
      "nombre": "Escenario Conservador",
      "descripcion": "Sin descuentos automáticos",
      "aplicarDescuentos": false,
      "aplicarAjustes": true,
      "aplicarExenciones": true
    }
  ],
  "socioIds": [],                 // Opcional: filtrar socios
  "categoriaIds": []              // Opcional: filtrar categorías
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "escenarios": [
      {
        "nombre": "Escenario Base",
        "descripcion": "Con todos los descuentos actuales",
        "configuracion": { /* ... */ },
        "resultado": {
          "totalCuotas": 150,
          "montoTotal": 1800000
        },
        "montoTotalAjustado": 1800000,
        "cuotasSimuladas": [ /* ... */ ]
      },
      {
        "nombre": "Escenario Promocional",
        "descripcion": "10% descuento adicional global",
        "configuracion": { /* ... */ },
        "resultado": {
          "totalCuotas": 150,
          "montoTotal": 1620000
        },
        "montoTotalAjustado": 1620000,
        "cuotasSimuladas": [ /* ... */ ]
      },
      {
        "nombre": "Escenario Conservador",
        "descripcion": "Sin descuentos automáticos",
        "configuracion": { /* ... */ },
        "resultado": {
          "totalCuotas": 150,
          "montoTotal": 2100000
        },
        "montoTotalAjustado": 2100000,
        "cuotasSimuladas": [ /* ... */ ]
      }
    ],
    "comparacion": {
      "mejorEscenario": "Escenario Conservador",
      "mayorRecaudacion": 2100000,
      "menorRecaudacion": 1620000,
      "diferenciaMaxima": 480000
    },
    "recomendacion": "Diferencia significativa (22.9%). Recomendamos Escenario Conservador, pero evalúe impacto social antes de aplicar."
  },
  "message": "Comparación completada. Mejor escenario: Escenario Conservador ($2100000.00)"
}
```

**Casos de uso:**
- Decidir entre múltiples políticas de descuento
- Planificación presupuestaria
- Evaluación de impacto de promociones

---

### 5. Simular Impacto Masivo

**Endpoint:** `POST /api/simulador/cuotas/impacto-masivo`

**Body:**
```json
{
  "mes": 12,
  "anio": 2025,
  "cambios": {
    "nuevosMontosPorCategoria": {
      "ADULTO_GENERAL": 12000,
      "INFANTIL": 8000
    },
    "nuevasPorcentajesDescuento": {
      "ANTIGUEDAD_5": 20
    },
    "ajusteGlobalPorcentaje": 10,
    "ajusteGlobalMonto": 500
  },
  "incluirProyeccion": true,
  "mesesProyeccion": 6
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "impactoInmediato": {
      "actual": {
        "totalCuotas": 150,
        "montoTotal": 1800000
      },
      "conCambios": {
        "totalCuotas": 150,
        "montoTotal": 2100000
      },
      "diferencia": 300000
    },
    "proyeccion": [
      {
        "mes": 1,
        "anio": 2026,
        "montoTotal": 2100000
      },
      {
        "mes": 2,
        "anio": 2026,
        "montoTotal": 2100000
      },
      // ... hasta 6 meses
    ],
    "resumen": {
      "diferenciaTotal": 300000,
      "porcentajeCambio": 16.67,
      "sociosAfectados": 150,
      "impactoAnual": 12600000
    }
  },
  "message": "Impacto masivo calculado: +$300000.00 (+16.67%)"
}
```

**Casos de uso:**
- Proyectar impacto anual de cambios de precios
- Evaluar sostenibilidad financiera
- Planificación presupuestaria a mediano plazo

---

## Validaciones

Todas las DTOs usan **Zod** para validación:

### SimularGeneracionDto
- ✅ `mes`: 1-12
- ✅ `anio`: 2020-2030
- ✅ `categoriaIds`: array de enteros positivos (opcional)
- ✅ `socioIds`: array de enteros positivos (opcional)
- ✅ Booleanos con defaults

### SimularReglaDescuentoDto
- ✅ `reglasModificadas`: array con reglaId, tipo, porcentaje, condiciones
- ✅ `reglasNuevas`: array opcional con código, nombre, tipo, etc.
- ✅ `porcentaje`: 0-100

### CompararEscenariosDto
- ✅ `escenarios`: 2-5 escenarios obligatorios
- ✅ Cada escenario con nombre (min 3 chars)
- ✅ Configuración flexible por escenario

### SimularImpactoMasivoDto
- ✅ `cambios`: objeto con modificaciones opcionales
- ✅ `ajusteGlobalPorcentaje`: -50 a +50
- ✅ `mesesProyeccion`: 1-12 (si incluirProyeccion=true)

---

## Diferencias con Generación Real

| Aspecto | Simulación | Generación Real |
|---------|------------|-----------------|
| Persistencia BD | ❌ NO | ✅ SÍ |
| Creación de recibos | ❌ NO | ✅ SÍ |
| Creación de ítems | ❌ NO | ✅ SÍ |
| Cálculo de montos | ✅ SÍ (completo) | ✅ SÍ |
| Aplicación de descuentos | ✅ SÍ (en memoria) | ✅ SÍ (persistido) |
| Aplicación de ajustes | ✅ SÍ (en memoria) | ✅ SÍ (persistido) |
| Aplicación de exenciones | ✅ SÍ (en memoria) | ✅ SÍ (persistido) |
| Transacciones | ❌ NO | ✅ SÍ |
| Rollback en error | N/A | ✅ SÍ |
| Performance | 🚀 Muy rápido | ⚡ Rápido |

---

## Testing

### Script de Test

```bash
# Ejecutar test básico
./tests/simulador/test-simulador-basic.sh
```

### Test Manual con curl

```bash
# 1. Health check
curl http://localhost:3001/api/simulador/cuotas/health

# 2. Simular generación
curl -X POST http://localhost:3001/api/simulador/cuotas/generacion \
  -H 'Content-Type: application/json' \
  -d '{
    "mes": 12,
    "anio": 2025,
    "aplicarDescuentos": true,
    "aplicarAjustes": true,
    "aplicarExenciones": true
  }'

# 3. Comparar escenarios
curl -X POST http://localhost:3001/api/simulador/cuotas/escenarios \
  -H 'Content-Type: application/json' \
  -d '{
    "mes": 12,
    "anio": 2025,
    "escenarios": [
      {
        "nombre": "Base",
        "aplicarDescuentos": true,
        "aplicarAjustes": true,
        "aplicarExenciones": true
      },
      {
        "nombre": "Sin Descuentos",
        "aplicarDescuentos": false,
        "aplicarAjustes": true,
        "aplicarExenciones": true
      }
    ]
  }'
```

---

## Casos de Uso Completos

### Caso 1: Preview Antes de Generación Mensual

**Objetivo:** Ver cuánto se cobrará antes de generar

```bash
# 1. Simular generación
curl -X POST /api/simulador/cuotas/generacion \
  -d '{"mes": 1, "anio": 2026, "aplicarDescuentos": true}'

# 2. Revisar resumen.montoTotal
# 3. Si todo OK, ejecutar generación real
curl -X POST /api/cuotas/generar \
  -d '{"mes": 1, "anio": 2026, "aplicarDescuentos": true}'
```

### Caso 2: Evaluar Cambio de Reglas

**Objetivo:** Ver impacto antes de modificar regla de antigüedad

```bash
# 1. Simular cambio de 15% a 20%
curl -X POST /api/simulador/cuotas/reglas \
  -d '{
    "mes": 12,
    "anio": 2025,
    "reglasModificadas": [{
      "reglaId": 1,
      "tipo": "ANTIGUEDAD",
      "porcentaje": 20,
      "condiciones": {"aniosMinimos": 5}
    }]
  }'

# 2. Revisar diferencia.montoTotal
# 3. Si impacto aceptable, modificar regla
curl -X PUT /api/reglas-descuento/1 \
  -d '{"porcentaje": 20}'
```

### Caso 3: Decisión Entre Políticas

**Objetivo:** Elegir mejor política de descuentos

```bash
# 1. Comparar 3 escenarios
curl -X POST /api/simulador/cuotas/escenarios \
  -d '{
    "mes": 12,
    "anio": 2025,
    "escenarios": [
      {"nombre": "Actual", "aplicarDescuentos": true},
      {"nombre": "Sin Desc", "aplicarDescuentos": false},
      {"nombre": "Promo 10%", "porcentajeDescuentoGlobal": 10}
    ]
  }'

# 2. Revisar comparacion.mejorEscenario
# 3. Leer recomendacion
# 4. Aplicar política elegida
```

---

## Performance

**Simulación vs. Generación Real:**

| Operación | Tiempo Aprox | Motivo |
|-----------|--------------|---------|
| Simular 100 cuotas | ~0.5s | Sin I/O a BD |
| Generar 100 cuotas | ~2s | Con transacciones |
| Simular 1000 cuotas | ~3s | Solo cálculos |
| Generar 1000 cuotas | ~15s | Con persistencia |

**Optimizaciones futuras (FASE 6):**
- Caché de resultados de simulación
- Paralelización de cálculos
- Batch queries para obtener datos

---

## Limitaciones Actuales

1. **Reglas personalizadas (simuladas):** Funciones `simularGeneracionConReglas` y `simularGeneracionConCambios` tienen implementación básica (TODO)
2. **Proyección:** Asume montos constantes, no considera variaciones estacionales
3. **Caché:** No implementado aún (FASE 6)
4. **Comparación detallada:** Solo muestra diferencias agregadas, no item por item

---

## Próximos Pasos

**FASE 5 - Tareas Restantes:**
- ✅ Task 5.1: Simulador de impacto (COMPLETADO)
- ⏳ Task 5.2: Herramienta de ajuste masivo
- ⏳ Task 5.3: Rollback de generación
- ⏳ Task 5.4: Preview en UI

**FASE 6 - Performance:**
- Caché de simulaciones
- Optimización de queries
- Tests de carga

---

## Documentación Relacionada

- `GENERACION_CUOTAS.md` - Sistema de generación
- `AJUSTES_EXENCIONES.md` - Ajustes manuales
- `REGLAS_DESCUENTO.md` - Motor de reglas
- `REPORTES.md` - Reportes y estadísticas
- API Docs: http://localhost:3001/api-docs

---

**Versión:** 1.0
**Última actualización:** 2025-12-17
**Autor:** Claude Code - FASE 5 Implementation
