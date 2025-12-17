# Guía de Ajustes y Exenciones

**Versión:** 1.0
**Fecha:** 2025-12-17
**Sistema:** SIGESDA Backend - FASE 4

---

## Introducción

Esta guía explica cómo utilizar los sistemas de **Ajustes Manuales** y **Exenciones** para personalizar las cuotas de socios específicos, gestionar casos especiales y mantener un registro auditable de todas las modificaciones.

---

## Ajustes Manuales

Los ajustes manuales permiten modificar el monto de las cuotas de un socio de forma personalizada y temporal.

### Tipos de Ajustes

#### 1. DESCUENTO_FIJO
Resta un monto fijo del total de la cuota.

**Ejemplo:**
```json
{
  "personaId": 1,
  "tipoAjuste": "DESCUENTO_FIJO",
  "valor": 2000,
  "concepto": "Descuento por colaboración",
  "fechaInicio": "2025-12-01",
  "fechaFin": "2026-02-28",
  "aplicaA": "TODAS_LAS_CUOTAS",
  "motivo": "Colabora como voluntario en eventos"
}
```

**Resultado:**
- Cuota original: $10,000
- Ajuste: -$2,000
- **Monto final: $8,000**

#### 2. DESCUENTO_PORCENTAJE
Resta un porcentaje del total de la cuota.

**Ejemplo:**
```json
{
  "personaId": 1,
  "tipoAjuste": "DESCUENTO_PORCENTAJE",
  "valor": 25,
  "concepto": "Descuento por dificultad económica",
  "fechaInicio": "2025-12-01",
  "fechaFin": "2026-06-30"
}
```

**Resultado:**
- Cuota original: $10,000
- Ajuste: -25% = -$2,500
- **Monto final: $7,500**

#### 3. RECARGO_FIJO
Agrega un monto fijo al total de la cuota.

**Ejemplo:**
```json
{
  "personaId": 1,
  "tipoAjuste": "RECARGO_FIJO",
  "valor": 1000,
  "concepto": "Cargo administrativo especial",
  "fechaInicio": "2025-12-01"
}
```

**Resultado:**
- Cuota original: $10,000
- Ajuste: +$1,000
- **Monto final: $11,000**

#### 4. RECARGO_PORCENTAJE
Agrega un porcentaje al total de la cuota.

**Ejemplo:**
```json
{
  "personaId": 1,
  "tipoAjuste": "RECARGO_PORCENTAJE",
  "valor": 10,
  "concepto": "Recargo por pago tardío recurrente"
}
```

**Resultado:**
- Cuota original: $10,000
- Ajuste: +10% = +$1,000
- **Monto final: $11,000**

#### 5. MONTO_FIJO_TOTAL
Establece un monto fijo como total de la cuota, ignorando el cálculo normal.

**Ejemplo:**
```json
{
  "personaId": 1,
  "tipoAjuste": "MONTO_FIJO_TOTAL",
  "valor": 5000,
  "concepto": "Cuota especial acordada",
  "fechaInicio": "2025-12-01",
  "fechaFin": "2026-12-31"
}
```

**Resultado:**
- Cuota original: $10,000 (ignorada)
- **Monto final: $5,000** (fijo)

---

## Crear Ajuste Manual

**Endpoint:** `POST /api/ajustes`

**Request Body Completo:**
```json
{
  "personaId": 1,
  "tipoAjuste": "DESCUENTO_PORCENTAJE",
  "valor": 30,
  "concepto": "Descuento por situación especial",
  "descripcion": "Socio con dificultades económicas temporales",
  "fechaInicio": "2025-12-01",
  "fechaFin": "2026-06-30",
  "aplicaA": "TODAS_LAS_CUOTAS",
  "itemsAfectados": null,
  "activo": true,
  "motivo": "Solicitud aprobada por comisión directiva",
  "observaciones": "Revisar situación en junio 2026"
}
```

**Parámetros:**
- `personaId` (requerido): ID del socio
- `tipoAjuste` (requerido): Tipo de ajuste (ver tipos arriba)
- `valor` (requerido): Valor del ajuste (monto o porcentaje)
- `concepto` (requerido): Descripción breve
- `fechaInicio` (requerido): Fecha de inicio de vigencia
- `fechaFin` (opcional): Fecha de fin de vigencia (null = indefinido)
- `aplicaA` (default: "TODAS_LAS_CUOTAS"): Alcance del ajuste
  - `TODAS_LAS_CUOTAS`: Se aplica al total
  - `ITEMS_ESPECIFICOS`: Solo a ítems específicos
- `itemsAfectados` (opcional): Array de IDs de tipos de ítems si `aplicaA = ITEMS_ESPECIFICOS`
- `activo` (default: true): Si el ajuste está activo
- `motivo` (opcional): Justificación del ajuste
- `observaciones` (opcional): Notas adicionales

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "personaId": 1,
    "tipoAjuste": "DESCUENTO_PORCENTAJE",
    "valor": 30,
    "concepto": "Descuento por situación especial",
    "fechaInicio": "2025-12-01T00:00:00.000Z",
    "fechaFin": "2026-06-30T00:00:00.000Z",
    "activo": true,
    "createdAt": "2025-12-17T10:00:00.000Z"
  }
}
```

---

## Gestión de Ajustes

### Listar Ajustes

**Endpoint:** `GET /api/ajustes`

**Query params:**
- `personaId`: Filtrar por persona
- `activo`: Filtrar por estado (true/false)
- `tipoAjuste`: Filtrar por tipo
- `page`, `limit`: Paginación

**Ejemplo:**
```bash
curl "http://localhost:8000/api/ajustes?personaId=1&activo=true"
```

### Obtener Ajuste Específico

**Endpoint:** `GET /api/ajustes/:id`

### Actualizar Ajuste

**Endpoint:** `PUT /api/ajustes/:id`

**Request Body:**
```json
{
  "valor": 40,
  "fechaFin": "2026-12-31",
  "observaciones": "Extendido por 6 meses más"
}
```

### Desactivar Ajuste

**Endpoint:** `DELETE /api/ajustes/:id`

**Nota:** Es un soft-delete, solo marca `activo = false`.

### Reactivar Ajuste

**Endpoint:** `PUT /api/ajustes/:id`

```json
{
  "activo": true
}
```

---

## Aplicación de Ajustes

### Aplicación Automática

Los ajustes se aplican automáticamente en:

1. **Generación de cuotas:**
   ```json
   {
     "mes": 12,
     "anio": 2025,
     "aplicarAjustes": true  // ← Aplica ajustes vigentes
   }
   ```

2. **Recálculo de cuotas:**
   ```json
   POST /api/cuotas/:id/recalcular
   {
     "aplicarAjustes": true
   }
   ```

### Múltiples Ajustes

Si un socio tiene múltiples ajustes activos, se aplican **secuencialmente**:

**Ejemplo:**
- Ajuste 1: DESCUENTO_FIJO -$2,000
- Ajuste 2: DESCUENTO_PORCENTAJE -20%

**Cálculo:**
1. Monto original: $10,000
2. Aplicar ajuste 1: $10,000 - $2,000 = $8,000
3. Aplicar ajuste 2: $8,000 - 20% = $8,000 - $1,600 = **$6,400**

### Orden de Aplicación

```
Cuota Base
    ↓
+ Ítems de Actividades
    ↓
= Subtotal
    ↓
- Descuentos Automáticos (Motor de Reglas)
    ↓
± Ajustes Manuales (secuencial)
    ↓
- Exenciones
    ↓
= Monto Total Final
```

---

## Historial de Ajustes

Todos los cambios en ajustes se registran automáticamente.

**Endpoint:** `GET /api/ajustes/:id/historial`

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ajusteId": 1,
      "accion": "CREAR_AJUSTE",
      "datosPrevios": null,
      "datosNuevos": {
        "tipoAjuste": "DESCUENTO_PORCENTAJE",
        "valor": 30
      },
      "usuario": "admin",
      "motivoCambio": "Creación de nuevo ajuste",
      "createdAt": "2025-12-17T10:00:00.000Z"
    },
    {
      "id": 2,
      "ajusteId": 1,
      "accion": "MODIFICAR_AJUSTE",
      "datosPrevios": {
        "valor": 30
      },
      "datosNuevos": {
        "valor": 40
      },
      "usuario": "admin",
      "motivoCambio": "Aumento de descuento por 6 meses",
      "createdAt": "2025-12-20T14:30:00.000Z"
    }
  ]
}
```

---

## Exenciones

Las exenciones permiten liberar total o parcialmente a un socio del pago de cuotas por un período determinado.

### Workflow de Exenciones

```
1. SOLICITUD
   ↓ (Socio o admin crea solicitud)
2. PENDIENTE_APROBACION
   ↓ (Comisión directiva revisa)
3. APROBADA / RECHAZADA
   ↓ (Si aprobada)
4. ACTIVA
   ↓ (Se aplica a cuotas)
5. FINALIZADA / REVOCADA
```

### Tipos de Exención

#### Exención Total (100%)

**Ejemplo:**
```json
{
  "personaId": 1,
  "tipoExencion": "EXENCION_TOTAL",
  "porcentaje": 100,
  "motivoExencion": "Situación de vulnerabilidad económica",
  "fechaInicio": "2025-12-01",
  "fechaFin": "2026-06-30",
  "estado": "PENDIENTE_APROBACION"
}
```

**Resultado:**
- Cuota original: $10,000
- Exención 100%: -$10,000
- **Monto final: $0**

#### Exención Parcial

**Ejemplo:**
```json
{
  "personaId": 1,
  "tipoExencion": "EXENCION_PARCIAL",
  "porcentaje": 50,
  "motivoExencion": "Colabora como docente voluntario",
  "fechaInicio": "2025-12-01",
  "fechaFin": null
}
```

**Resultado:**
- Cuota original: $10,000
- Exención 50%: -$5,000
- **Monto final: $5,000**

---

## Crear Solicitud de Exención

**Endpoint:** `POST /api/exenciones`

**Request Body:**
```json
{
  "personaId": 1,
  "tipoExencion": "EXENCION_PARCIAL",
  "porcentaje": 75,
  "motivoExencion": "Dificultades económicas por pérdida de empleo",
  "fechaInicio": "2025-12-01",
  "fechaFin": "2026-12-31",
  "documentacionAdjunta": "certificado_desempleo.pdf",
  "observaciones": "Solicita revisión cada 6 meses"
}
```

**Estados Iniciales:**
- `PENDIENTE_APROBACION`: Recién creada, esperando revisión
- `SOLICITADA`: Alias de pendiente

---

## Gestión de Exenciones

### Aprobar Exención

**Endpoint:** `POST /api/exenciones/:id/aprobar`

```json
{
  "aprobarObservaciones": "Aprobado por comisión directiva 17/12/2025",
  "usuario": "admin"
}
```

**Cambios:**
- `estado`: `PENDIENTE_APROBACION` → `APROBADA`
- `fechaAprobacion`: timestamp actual

### Activar Exención

**Endpoint:** `POST /api/exenciones/:id/activar`

**Cambios:**
- `estado`: `APROBADA` → `ACTIVA`
- `activa`: true

**Nota:** Solo las exenciones ACTIVAS se aplican a las cuotas.

### Rechazar Exención

**Endpoint:** `POST /api/exenciones/:id/rechazar`

```json
{
  "motivoRechazo": "No se presentó documentación suficiente"
}
```

**Cambios:**
- `estado`: `PENDIENTE_APROBACION` → `RECHAZADA`
- No se podrá activar

### Revocar Exención

**Endpoint:** `POST /api/exenciones/:id/revocar`

```json
{
  "motivoRevocacion": "Situación económica mejoró"
}
```

**Cambios:**
- `estado`: `ACTIVA` → `REVOCADA`
- `activa`: false
- Dejará de aplicarse a cuotas futuras

### Listar Exenciones

**Endpoint:** `GET /api/exenciones`

**Query params:**
- `personaId`: Filtrar por persona
- `estado`: Filtrar por estado
- `activa`: Filtrar activas (true/false)

---

## Verificar Exención Vigente

**Endpoint:** `POST /api/exenciones/check`

```json
{
  "personaId": 1,
  "fecha": "2025-12-15"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "tieneExencion": true,
    "porcentaje": 75,
    "exencion": {
      "id": 1,
      "tipoExencion": "EXENCION_PARCIAL",
      "motivoExencion": "Dificultades económicas",
      "fechaInicio": "2025-12-01",
      "fechaFin": "2026-12-31",
      "estado": "ACTIVA"
    }
  }
}
```

---

## Diferencias: Ajustes vs Exenciones

| Característica | Ajustes Manuales | Exenciones |
|----------------|------------------|------------|
| **Propósito** | Modificar montos | Liberar de pago |
| **Aprobación** | Directa | Workflow de aprobación |
| **Tipos** | 5 tipos (fijo, %, total) | Total o parcial |
| **Alcance** | Todas las cuotas o ítems específicos | Todas las cuotas |
| **Historial** | Auditable | Auditable |
| **Reversible** | Sí (desactivar) | Sí (revocar) |
| **Uso típico** | Descuentos personalizados | Casos sociales, colaboradores |

---

## Estadísticas

### Estadísticas de Ajustes

**Endpoint:** `GET /api/ajustes/estadisticas`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalAjustes": 45,
    "ajustesActivos": 30,
    "ajustesInactivos": 15,
    "porTipo": {
      "DESCUENTO_FIJO": 10,
      "DESCUENTO_PORCENTAJE": 15,
      "RECARGO_FIJO": 3,
      "RECARGO_PORCENTAJE": 2,
      "MONTO_FIJO_TOTAL": 5
    },
    "promedioDescuento": 25.5
  }
}
```

### Estadísticas de Exenciones

**Endpoint:** `GET /api/exenciones/estadisticas`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalExenciones": 20,
    "exencionesActivas": 8,
    "porEstado": {
      "ACTIVA": 8,
      "PENDIENTE_APROBACION": 5,
      "APROBADA": 2,
      "RECHAZADA": 3,
      "REVOCADA": 2
    },
    "porTipo": {
      "EXENCION_TOTAL": 5,
      "EXENCION_PARCIAL": 15
    }
  }
}
```

---

## Casos de Uso Comunes

### Caso 1: Descuento Temporal por Colaboración

Socio colabora 3 meses como voluntario → 50% descuento:

```bash
curl -X POST http://localhost:8000/api/ajustes \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": 1,
    "tipoAjuste": "DESCUENTO_PORCENTAJE",
    "valor": 50,
    "concepto": "Descuento por colaboración voluntaria",
    "fechaInicio": "2025-12-01",
    "fechaFin": "2026-02-28",
    "motivo": "Colabora organizando eventos"
  }'
```

### Caso 2: Exención por Vulnerabilidad Social

Familia en situación de vulnerabilidad → 100% exención 1 año:

1. **Solicitar exención:**
```bash
curl -X POST http://localhost:8000/api/exenciones \
  -d '{
    "personaId": 1,
    "tipoExencion": "EXENCION_TOTAL",
    "porcentaje": 100,
    "motivoExencion": "Situación de vulnerabilidad social",
    "fechaInicio": "2025-12-01",
    "fechaFin": "2026-11-30"
  }'
```

2. **Aprobar:**
```bash
curl -X POST http://localhost:8000/api/exenciones/1/aprobar
```

3. **Activar:**
```bash
curl -X POST http://localhost:8000/api/exenciones/1/activar
```

### Caso 3: Cuota Especial Negociada

Socio con situación económica limitada → cuota fija $3,000/mes:

```bash
curl -X POST http://localhost:8000/api/ajustes \
  -d '{
    "personaId": 1,
    "tipoAjuste": "MONTO_FIJO_TOTAL",
    "valor": 3000,
    "concepto": "Cuota especial acordada",
    "fechaInicio": "2025-12-01",
    "fechaFin": null,
    "motivo": "Acuerdo con comisión directiva"
  }'
```

---

## Buenas Prácticas

1. **Documentar siempre:**
   - Incluir `motivo` y `observaciones` claros
   - Adjuntar documentación si aplica

2. **Establecer fechas de fin:**
   - Evitar ajustes/exenciones indefinidos sin revisión
   - Programar revisiones periódicas

3. **Usar el workflow correcto:**
   - Ajustes: Casos operativos simples
   - Exenciones: Casos que requieren aprobación formal

4. **Monitorear regularmente:**
   - Revisar estadísticas mensuales
   - Identificar ajustes que ya no aplican

5. **Historial completo:**
   - No borrar registros, usar soft-delete
   - Mantener auditoría de cambios

---

## Próximos Pasos

- Leer **REGLAS_DESCUENTO.md** para descuentos automáticos
- Explorar **REPORTES.md** para análisis de ajustes/exenciones

---

**Documentación relacionada:**
- API Docs: http://localhost:8000/api-docs (secciones Ajustes y Exenciones)
