# Guía de Generación de Cuotas

**Versión:** 1.0
**Fecha:** 2025-12-17
**Sistema:** SIGESDA Backend - Sistema de Ítems V2

---

## Introducción

Esta guía explica el proceso completo de generación de cuotas mensuales en SIGESDA, incluyendo el sistema de ítems configurables, aplicación automática de descuentos, ajustes y exenciones.

---

## Arquitectura del Sistema de Cuotas

### Sistema V2: Basado en Ítems

A partir de FASE 2, las cuotas se generan usando un sistema flexible de **ítems desagregados**:

```
CUOTA
├── ITEM 1: Cuota Base Socio ($10,000)
├── ITEM 2: Actividad Guitarra ($5,000)
├── ITEM 3: Actividad Coro ($3,000)
└── TOTAL: $18,000
```

**Ventajas:**
- Flexibilidad total en conceptos de cobro
- Configuración dinámica sin cambios en código
- Trazabilidad de cada componente
- Soporte para fórmulas de cálculo

---

## Proceso de Generación

### 1. Preparación: Configurar Tipos de Ítems

**Endpoint:** `GET /api/catalogos/tipos-items-cuota`

Los tipos de ítems definen qué conceptos se pueden cobrar:

```json
{
  "id": 1,
  "codigo": "CUOTA_BASE_SOCIO",
  "nombre": "Cuota Base Socio",
  "descripcion": "Cuota mensual base según categoría",
  "categoria": "CUOTA_BASE",
  "esObligatorio": true,
  "permiteMultiples": false,
  "formula": "categoria.montoCuota",
  "activo": true
}
```

**Tipos predefinidos:**
- `CUOTA_BASE_SOCIO` - Cuota mensual base
- `ACTIVIDAD_MUSICAL` - Actividades (coro, guitarra, etc.)
- `DESCUENTO_AUTOMATICO` - Descuentos por reglas
- `AJUSTE_MANUAL` - Ajustes manuales

### 2. Generación de Cuotas del Mes

**Endpoint:** `POST /api/cuotas/generar`

**Request Body:**
```json
{
  "mes": 12,
  "anio": 2025,
  "categorias": ["ADULTO_GENERAL", "INFANTIL"],
  "aplicarDescuentos": true,
  "aplicarAjustes": true,
  "aplicarExenciones": true,
  "generarRecibos": true
}
```

**Parámetros:**
- `mes` (requerido): Mes de generación (1-12)
- `anio` (requerido): Año de generación
- `categorias` (opcional): Filtrar por categorías específicas
- `aplicarDescuentos` (default: true): Aplicar motor de reglas de descuentos
- `aplicarAjustes` (default: true): Aplicar ajustes manuales vigentes
- `aplicarExenciones` (default: true): Aplicar exenciones aprobadas
- `generarRecibos` (default: true): Generar recibos automáticamente

### 3. Proceso Interno

La generación sigue estos pasos:

```
┌─────────────────────────────────────┐
│ 1. Obtener socios activos          │
│    (sin cuota generada del período)│
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 2. Para cada socio:                 │
│    - Crear recibo                   │
│    - Crear cuota base               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 3. Crear ítems de cuota:            │
│    - CUOTA_BASE_SOCIO              │
│    - Ítems de actividades          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 4. Aplicar descuentos automáticos:  │
│    - Motor de Reglas de Descuentos │
│    - Descuentos familiares         │
│    - Descuentos por antigüedad     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 5. Aplicar ajustes manuales:        │
│    - Ajustes vigentes del socio    │
│    - Descuentos/recargos fijos     │
│    - Descuentos/recargos %         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 6. Aplicar exenciones:               │
│    - Exenciones aprobadas y activas│
│    - Exenciones totales (100%)     │
│    - Exenciones parciales          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 7. Calcular monto total:             │
│    - Suma de ítems                  │
│    - Validaciones de integridad    │
│    - Actualizar recibo             │
└──────────────────────────────────────┘
```

### 4. Respuesta de Generación

```json
{
  "success": true,
  "data": {
    "generated": 25,
    "errors": [],
    "cuotas": [
      {
        "id": 1,
        "mes": 12,
        "anio": 2025,
        "categoria": "ADULTO_GENERAL",
        "montoTotal": 10000,
        "recibo": {
          "id": 1,
          "numero": "00001-2025",
          "estado": "PENDIENTE",
          "fechaEmision": "2025-12-17",
          "fechaVencimiento": "2025-12-15"
        },
        "items": [
          {
            "id": 1,
            "tipoItem": "CUOTA_BASE_SOCIO",
            "concepto": "Cuota Base Diciembre 2025",
            "monto": 10000
          }
        ]
      }
    ],
    "resumen": {
      "totalSocios": 25,
      "cuotasGeneradas": 25,
      "errores": 0,
      "montoTotal": 250000,
      "descuentosAplicados": 15000
    }
  }
}
```

---

## Casos de Uso Comunes

### Caso 1: Generación Simple (Solo Cuota Base)

Socio sin actividades, sin descuentos:

```bash
curl -X POST http://localhost:8000/api/cuotas/generar \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 12,
    "anio": 2025,
    "aplicarDescuentos": false
  }'
```

**Resultado:**
- 1 ítem: CUOTA_BASE_SOCIO ($10,000)
- Monto total: $10,000

### Caso 2: Socio con Actividades

Socio con 2 actividades (Guitarra $5,000 + Coro $3,000):

```bash
curl -X POST http://localhost:8000/api/cuotas/generar \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 12,
    "anio": 2025
  }'
```

**Resultado:**
- Ítem 1: CUOTA_BASE_SOCIO ($10,000)
- Ítem 2: ACTIVIDAD_MUSICAL - Guitarra ($5,000)
- Ítem 3: ACTIVIDAD_MUSICAL - Coro ($3,000)
- **Monto total: $18,000**

### Caso 3: Socio con Descuento Familiar

Socio con 2 familiares (40% descuento):

**Resultado:**
- Subtotal: $18,000
- Descuento familiar 40%: -$7,200
- **Monto total: $10,800**

### Caso 4: Socio con Exención Total

Socio con exención 100% aprobada:

**Resultado:**
- Subtotal: $18,000
- Exención 100%: -$18,000
- **Monto total: $0**

---

## Regeneración de Cuotas

Si necesitas regenerar cuotas ya existentes:

**Endpoint:** `POST /api/cuotas/regenerar`

```json
{
  "mes": 12,
  "anio": 2025,
  "sobreescribir": true,
  "eliminarPagadas": false,
  "aplicarDescuentos": true
}
```

**⚠️ Advertencias:**
- `sobreescribir: true` eliminará cuotas no pagadas y las regenerará
- `eliminarPagadas: false` (recomendado) no tocará cuotas ya pagadas
- Siempre hacer backup antes de regenerar masivamente

---

## Recálculo de Cuotas Existentes

Para ajustar una cuota ya generada:

**Endpoint:** `POST /api/cuotas/:id/recalcular`

```json
{
  "aplicarAjustes": true,
  "aplicarExenciones": true,
  "aplicarDescuentos": true
}
```

**Casos de uso:**
- Cambió el precio de una actividad
- Se aprobó una exención retroactiva
- Se creó un ajuste manual

**Validación:**
- No se puede recalcular cuotas de recibos PAGADOS
- Se mantiene el historial de cambios

---

## Preview de Recálculo

Antes de aplicar un recálculo masivo, puedes previsualizar los cambios:

**Endpoint:** `POST /api/cuotas/preview-recalculo`

```json
{
  "mes": 12,
  "anio": 2025,
  "aplicarAjustes": true
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "cuotas": [
      {
        "cuotaId": 1,
        "montoActual": 10000,
        "montoRecalculado": 7500,
        "diferencia": -2500,
        "ajustesAplicados": [
          {
            "concepto": "Descuento familiar",
            "valor": -2500
          }
        ]
      }
    ],
    "resumen": {
      "totalCuotas": 25,
      "conCambios": 10,
      "sinCambios": 15,
      "totalAjuste": -25000
    }
  }
}
```

---

## Validaciones y Restricciones

### Validaciones Automáticas

1. **No duplicados:** No se puede generar 2 veces la misma cuota (mismo socio + mes + año)
2. **Socios activos:** Solo se generan para socios con estado `activo = true`
3. **Categorías válidas:** La categoría del socio debe existir en catálogo
4. **Fecha válida:** Mes entre 1-12, año razonable

### Restricciones de Negocio

1. **Cuotas pagadas:** No se pueden modificar cuotas de recibos PAGADOS
2. **Recibos anulados:** No se pueden generar cuotas para recibos ANULADO
3. **Monto mínimo:** El monto total no puede ser negativo (se ajusta a $0)

---

## Configuración de Fecha de Vencimiento

Las cuotas tienen fecha de vencimiento automática:

**Regla:**
- Día 15 del mes de la cuota
- Ejemplo: Cuota de Diciembre 2025 vence el 15/12/2025

**Personalización:**
```typescript
// En src/constants/cuota.constants.ts
export const DIA_VENCIMIENTO_CUOTA = 15;
```

---

## Auditoría y Trazabilidad

Cada cuota generada incluye:

1. **Metadata de ítems:**
   ```json
   {
     "metadata": {
       "generadoEn": "2025-12-17T10:30:00Z",
       "tipoGeneracion": "automatica",
       "reglaAplicada": "DESCUENTO_FAMILIAR_40"
     }
   }
   ```

2. **Historial de cambios:**
   - Tabla `historial_ajustes_cuota` registra todos los ajustes
   - Campos: `accion`, `datosPrevios`, `datosNuevos`, `usuario`, `motivoCambio`

3. **Logs del sistema:**
   - Todas las operaciones se loguean con nivel `INFO`
   - Formato: `[GENERACIÓN CUOTAS] Generadas 25 cuotas para 12/2025`

---

## Troubleshooting

### Error: "Ya existe cuota para este período"
**Solución:** Verificar si ya se generó. Si necesitas regenerar, usar endpoint de regeneración.

### Error: "Socio inactivo"
**Solución:** Verificar campo `activo` de la persona. Reactivar si es necesario.

### Error: "No se encontró tipo de ítem CUOTA_BASE_SOCIO"
**Solución:** Ejecutar seed de catálogos: `npx tsx prisma/seed-items-catalogos.ts`

### Cuota con monto $0
**Causas posibles:**
- Exención total (100%)
- Suma de descuentos = 100%
- Ajuste manual que establece monto fijo en $0

---

## Buenas Prácticas

1. **Generar al inicio del mes:**
   - Generar cuotas del mes el día 1
   - Enviar recordatorios el día 10
   - Aplicar recargos por mora después del día 15

2. **Validar antes de generar:**
   - Verificar que los precios de actividades estén actualizados
   - Revisar ajustes y exenciones vigentes
   - Hacer preview si hay cambios importantes

3. **Backup regular:**
   - Hacer backup de BD antes de regeneraciones masivas
   - Mantener logs de generación

4. **Monitoreo:**
   - Revisar dashboard después de cada generación
   - Verificar que la cantidad de cuotas generadas sea correcta
   - Validar montos totales vs esperados

---

## Próximos Pasos

- Leer guía de **AJUSTES_EXENCIONES.md** para personalizar cuotas
- Leer guía de **REGLAS_DESCUENTO.md** para configurar descuentos automáticos
- Explorar **REPORTES.md** para análisis de cobranza

---

**Documentación relacionada:**
- `docs/FASE2_DISEÑO_ITEMS.md` - Arquitectura del sistema de ítems
- API Docs: http://localhost:8000/api-docs
