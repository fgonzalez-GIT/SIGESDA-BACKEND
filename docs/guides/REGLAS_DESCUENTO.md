# Guía del Motor de Reglas de Descuentos

**Versión:** 1.0
**Fecha:** 2025-12-17
**Sistema:** SIGESDA Backend - FASE 3

---

## Introducción

El Motor de Reglas de Descuentos permite configurar descuentos automáticos que se aplican a las cuotas según criterios específicos (antigüedad, cantidad de familiares, categoría, etc.). Es un sistema flexible y auditable.

---

## Conceptos Clave

### Regla de Descuento

Una regla define:
- **Tipo** (`ANTIGUEDAD`, `FAMILIAR`, `CATEGORIA`, `COMBINADA`)
- **Condición** (ej: "más de 5 años como socio")
- **Porcentaje de descuento** (ej: 20%)
- **Prioridad** (orden de aplicación)
- **Alcance** (sobre qué se aplica)

### Aplicación de Descuentos

Los descuentos se aplican durante:
1. Generación de cuotas (`POST /api/cuotas/generar`)
2. Recálculo de cuotas (`POST /api/cuotas/:id/recalcular`)

---

## Tipos de Reglas

### 1. Descuento por Antigüedad

**Ejemplo:**
```json
{
  "codigo": "ANTIGUEDAD_5_ANIOS",
  "nombre": "Descuento por 5+ años",
  "tipo": "ANTIGUEDAD",
  "porcentaje": 15,
  "condiciones": {
    "aniosMinimos": 5
  },
  "prioridad": 1,
  "activa": true
}
```

**Lógica:**
- Si el socio lleva ≥5 años → 15% descuento

### 2. Descuento Familiar

**Ejemplo:**
```json
{
  "codigo": "FAMILIAR_2_MIEMBROS",
  "nombre": "Descuento familiar 2 miembros",
  "tipo": "FAMILIAR",
  "porcentaje": 25,
  "condiciones": {
    "minimoMiembros": 2
  },
  "prioridad": 2,
  "activa": true
}
```

**Lógica:**
- Si tiene ≥2 familiares activos en el sistema → 25% descuento

**Escalas comunes:**
- 2 miembros: 25%
- 3 miembros: 35%
- 4+ miembros: 40%

### 3. Descuento por Categoría

**Ejemplo:**
```json
{
  "codigo": "ESTUDIANTE",
  "nombre": "Descuento estudiante",
  "tipo": "CATEGORIA",
  "porcentaje": 40,
  "condiciones": {
    "categorias": ["ESTUDIANTE"]
  },
  "prioridad": 1,
  "activa": true
}
```

### 4. Reglas Combinadas

**Ejemplo:**
```json
{
  "codigo": "ESTUDIANTE_FAMILIAR",
  "nombre": "Estudiante con familia",
  "tipo": "COMBINADA",
  "porcentaje": 50,
  "condiciones": {
    "categorias": ["ESTUDIANTE"],
    "minimoMiembros": 2
  },
  "prioridad": 1,
  "activa": true
}
```

---

## Endpoints Principales

### Crear Regla

**Endpoint:** `POST /api/reglas-descuento`

```json
{
  "codigo": "ANTIGUEDAD_10_ANIOS",
  "nombre": "Descuento por 10 años",
  "descripcion": "Para socios con 10 o más años de antigüedad",
  "tipo": "ANTIGUEDAD",
  "porcentaje": 25,
  "condiciones": {
    "aniosMinimos": 10
  },
  "aplicaSobre": "CUOTA_TOTAL",
  "prioridad": 1,
  "activa": true
}
```

### Listar Reglas

**Endpoint:** `GET /api/reglas-descuento`

**Filtros:**
- `?activa=true` - Solo reglas activas
- `?tipo=ANTIGUEDAD` - Por tipo
- `?sortBy=prioridad` - Ordenar

### Actualizar Regla

**Endpoint:** `PUT /api/reglas-descuento/:id`

### Desactivar Regla

**Endpoint:** `DELETE /api/reglas-descuento/:id` (soft delete)

---

## Orden de Aplicación

Las reglas se aplican según **prioridad** (menor número = mayor prioridad):

```
1. Prioridad 1: Descuentos por categoría (ej: ESTUDIANTE 40%)
2. Prioridad 2: Descuentos familiares (ej: 2 miembros 25%)
3. Prioridad 3: Descuentos por antigüedad (ej: 5 años 15%)
```

**Aplicación secuencial:**
```
Cuota base: $10,000
  ↓ Aplicar ESTUDIANTE (40%)
= $6,000
  ↓ Aplicar FAMILIAR_2 (25% sobre $6,000)
= $4,500
  ↓ Aplicar ANTIGUEDAD_5 (15% sobre $4,500)
= $3,825 (monto final)
```

---

## Límite Global de Descuentos

Para evitar descuentos excesivos:

```typescript
// src/constants/descuentos.constants.ts
export const LIMITE_GLOBAL_DESCUENTOS = 80; // máximo 80%
```

**Ejemplo:**
- Descuento calculado: 90%
- **Aplicado**: 80% (límite)
- Cuota base $10,000 → Monto final: $2,000

---

## Simulación de Descuentos

**Endpoint:** `POST /api/reglas-descuento/simular`

```json
{
  "personaId": 1,
  "mes": 12,
  "anio": 2025,
  "montoBase": 10000
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "montoOriginal": 10000,
    "reglasAplicadas": [
      {
        "codigo": "ESTUDIANTE",
        "porcentaje": 40,
        "descuento": 4000
      },
      {
        "codigo": "FAMILIAR_2",
        "porcentaje": 25,
        "descuento": 1500
      }
    ],
    "descuentoTotal": 5500,
    "montoFinal": 4500,
    "porcentajeTotal": 55
  }
}
```

---

## Auditoría de Aplicaciones

**Endpoint:** `GET /api/aplicaciones-reglas`

Retorna historial de todas las aplicaciones de reglas:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "cuotaId": 1,
      "reglaId": 1,
      "personaId": 1,
      "porcentajeAplicado": 40,
      "descuentoCalculado": 4000,
      "fechaAplicacion": "2025-12-01",
      "regla": {
        "codigo": "ESTUDIANTE",
        "nombre": "Descuento estudiante"
      }
    }
  ]
}
```

---

## Casos de Uso

### Caso 1: Descuento por Antigüedad Escalonado

```bash
# 5-9 años: 15%
curl -X POST http://localhost:8000/api/reglas-descuento -d '{
  "codigo": "ANTIGUEDAD_5_9",
  "tipo": "ANTIGUEDAD",
  "porcentaje": 15,
  "condiciones": {"aniosMinimos": 5, "aniosMaximos": 9}
}'

# 10-14 años: 20%
curl -X POST http://localhost:8000/api/reglas-descuento -d '{
  "codigo": "ANTIGUEDAD_10_14",
  "tipo": "ANTIGUEDAD",
  "porcentaje": 20,
  "condiciones": {"aniosMinimos": 10, "aniosMaximos": 14}
}'

# 15+ años: 25%
curl -X POST http://localhost:8000/api/reglas-descuento -d '{
  "codigo": "ANTIGUEDAD_15_PLUS",
  "tipo": "ANTIGUEDAD",
  "porcentaje": 25,
  "condiciones": {"aniosMinimos": 15}
}'
```

### Caso 2: Promoción Temporal

Descuento 10% para nuevos socios en el primer mes:

```json
{
  "codigo": "PROMO_NUEVOS_SOCIOS",
  "tipo": "COMBINADA",
  "porcentaje": 10,
  "condiciones": {
    "aniosMaximos": 0,
    "mesesMaximos": 1
  },
  "fechaInicio": "2025-12-01",
  "fechaFin": "2025-12-31",
  "activa": true
}
```

---

## Validaciones

1. **Porcentaje válido:** 0-100%
2. **Prioridad única:** No duplicar prioridades en reglas activas
3. **Condiciones válidas:** Según tipo de regla
4. **Código único:** No duplicar códigos

---

## Estadísticas

**Endpoint:** `GET /api/reglas-descuento/estadisticas`

```json
{
  "success": true,
  "data": {
    "totalReglas": 8,
    "reglasActivas": 6,
    "aplicacionesEsteMes": 120,
    "descuentoPromedioAplicado": 28.5,
    "ahorroTotalGenerado": 340000,
    "reglaMasUsada": {
      "codigo": "FAMILIAR_2",
      "aplicaciones": 45
    }
  }
}
```

---

## Mejores Prácticas

1. **Priorizar correctamente:**
   - Descuentos fijos antes que porcentuales
   - Categorías antes que combinadas

2. **Límites razonables:**
   - No superar 80% de descuento total
   - Validar combinaciones

3. **Monitorear:**
   - Revisar estadísticas mensualmente
   - Ajustar porcentajes según impacto

4. **Documentar:**
   - Incluir descripción clara
   - Justificar porcentajes

---

## Diferencia con Ajustes Manuales

| Motor de Reglas | Ajustes Manuales |
|-----------------|------------------|
| Automático | Manual |
| Basado en criterios | Caso por caso |
| Se aplica a todos los que califican | Solo a persona específica |
| Sin aprobación | Con motivo registrado |

---

**Documentación relacionada:**
- `AJUSTES_EXENCIONES.md` - Para casos personalizados
- API Docs: http://localhost:8000/api-docs
