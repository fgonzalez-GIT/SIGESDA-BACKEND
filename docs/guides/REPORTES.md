# Guía de Reportes y Estadísticas

**Versión:** 1.0
**Fecha:** 2025-12-17
**Sistema:** SIGESDA Backend - FASE 4

---

## Introducción

Esta guía explica cómo utilizar los endpoints de reportes y estadísticas para obtener información analítica del sistema de cuotas, cobranza, ajustes y exenciones.

---

## Dashboard General del Mes

**Endpoint:** `GET /api/reportes/cuotas/dashboard`

**Query params:**
- `mes` (requerido): Mes (1-12)
- `anio` (requerido): Año

**Ejemplo:**
```bash
curl "http://localhost:8000/api/reportes/cuotas/dashboard?mes=12&anio=2025"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "periodo": "12/2025",
    "totalCuotas": 250,
    "cuotasPagadas": 180,
    "cuotasPendientes": 60,
    "cuotasVencidas": 10,
    "montoTotal": 2500000,
    "montoPagado": 1800000,
    "montoPendiente": 700000,
    "porcentajeCobranza": 72,
    "promedioMonto": 10000,
    "fechaGeneracion": "2025-12-01T10:00:00Z"
  }
}
```

**Métricas clave:**
- `porcentajeCobranza`: (montoPagado / montoTotal) * 100
- `promedioMonto`: montoTotal / totalCuotas

---

## Reporte por Categoría

**Endpoint:** `GET /api/reportes/cuotas/por-categoria`

**Ejemplo:**
```bash
curl "http://localhost:8000/api/reportes/cuotas/por-categoria?mes=12&anio=2025"
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "categoria": "ADULTO_GENERAL",
      "totalCuotas": 150,
      "cuotasPagadas": 110,
      "cuotasPendientes": 40,
      "montoTotal": 1500000,
      "montoPagado": 1100000,
      "porcentajeCobranza": 73.3
    },
    {
      "categoria": "INFANTIL",
      "totalCuotas": 60,
      "cuotasPagadas": 50,
      "cuotasPendientes": 10,
      "montoTotal": 600000,
      "montoPagado": 500000,
      "porcentajeCobranza": 83.3
    },
    {
      "categoria": "ESTUDIANTE",
      "totalCuotas": 40,
      "cuotasPagadas": 20,
      "cuotasPendientes": 20,
      "montoTotal": 400000,
      "montoPagado": 200000,
      "porcentajeCobranza": 50
    }
  ]
}
```

---

## Reporte de Morosidad

**Endpoint:** `GET /api/reportes/cuotas/morosidad`

**Query params:**
- `fechaCorte` (opcional): Fecha de corte (default: hoy)

**Ejemplo:**
```bash
curl "http://localhost:8000/api/reportes/cuotas/morosidad?fechaCorte=2025-12-17"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "fechaCorte": "2025-12-17",
    "totalMorosos": 25,
    "montoTotalMorosidad": 250000,
    "rangos": {
      "1a30dias": {
        "cantidad": 15,
        "monto": 150000
      },
      "31a60dias": {
        "cantidad": 7,
        "monto": 70000
      },
      "61a90dias": {
        "cantidad": 2,
        "monto": 20000
      },
      "mas90dias": {
        "cantidad": 1,
        "monto": 10000
      }
    },
    "detalle": [
      {
        "socioId": 1,
        "nombreCompleto": "Juan Pérez",
        "cuotasVencidas": 2,
        "montoAdeudado": 20000,
        "diasMora": 45,
        "ultimoPago": "2025-10-15"
      }
    ]
  }
}
```

---

## Resumen de Cobranza Mensual

**Endpoint:** `GET /api/reportes/cuotas/cobranza-mensual`

**Query params:**
- `anio` (requerido): Año

**Ejemplo:**
```bash
curl "http://localhost:8000/api/reportes/cuotas/cobranza-mensual?anio=2025"
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "mes": 1,
      "nombreMes": "Enero",
      "totalCuotas": 240,
      "montoPagado": 1900000,
      "montoPendiente": 500000,
      "porcentajeCobranza": 79.2
    },
    {
      "mes": 2,
      "nombreMes": "Febrero",
      "totalCuotas": 245,
      "montoPagado": 2000000,
      "montoPendiente": 450000,
      "porcentajeCobranza": 81.6
    }
    // ... más meses
  ]
}
```

---

## Estadísticas de Ajustes

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
    "promedioDescuento": 25.5,
    "impactoTotal": -112500
  }
}
```

---

## Estadísticas de Exenciones

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
    },
    "impactoMensual": -80000,
    "sociosBeneficiados": 8
  }
}
```

---

## Reporte de Items de Cuota

**Endpoint:** `GET /api/items-cuota/reporte`

**Query params:**
- `mes`, `anio`: Filtrar por período
- `categoria`: Filtrar por categoría de ítem

**Ejemplo:**
```bash
curl "http://localhost:8000/api/items-cuota/reporte?mes=12&anio=2025&categoria=ACTIVIDAD_MUSICAL"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalItems": 350,
    "montoTotal": 1750000,
    "porCategoria": {
      "CUOTA_BASE": {
        "cantidad": 250,
        "monto": 2500000
      },
      "ACTIVIDAD_MUSICAL": {
        "cantidad": 100,
        "monto": 500000
      }
    },
    "itemsMasComunes": [
      {
        "tipoItem": "CUOTA_BASE_SOCIO",
        "concepto": "Cuota Base",
        "cantidad": 250,
        "montoTotal": 2500000
      },
      {
        "tipoItem": "ACTIVIDAD_MUSICAL",
        "concepto": "Guitarra",
        "cantidad": 60,
        "montoTotal": 300000
      }
    ]
  }
}
```

---

## Comparación Entre Períodos

**Endpoint:** `GET /api/reportes/cuotas/comparacion`

**Query params:**
- `periodo1Mes`, `periodo1Anio`
- `periodo2Mes`, `periodo2Anio`

**Ejemplo:**
```bash
curl "http://localhost:8000/api/reportes/cuotas/comparacion?periodo1Mes=11&periodo1Anio=2025&periodo2Mes=12&periodo2Anio=2025"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "periodo1": {
      "periodo": "11/2025",
      "totalCuotas": 240,
      "montoTotal": 2400000,
      "porcentajeCobranza": 75
    },
    "periodo2": {
      "periodo": "12/2025",
      "totalCuotas": 250,
      "montoTotal": 2500000,
      "porcentajeCobranza": 72
    },
    "diferencias": {
      "cuotas": +10,
      "monto": +100000,
      "porcentajeCobranza": -3
    },
    "variacionPorcentual": {
      "cuotas": +4.2,
      "monto": +4.2,
      "cobranza": -4
    }
  }
}
```

---

## Exportar Reportes

### CSV

**Endpoint:** `GET /api/reportes/cuotas/export/csv`

**Query params:**
- `mes`, `anio`, `categoria`, `estado`

**Ejemplo:**
```bash
curl "http://localhost:8000/api/reportes/cuotas/export/csv?mes=12&anio=2025" \
  -o cuotas_diciembre_2025.csv
```

**Formato CSV:**
```csv
ID,Socio,Categoría,Mes,Año,Monto Base,Monto Actividades,Monto Total,Estado,Fecha Vencimiento
1,Juan Pérez,ADULTO_GENERAL,12,2025,10000,5000,15000,PAGADO,2025-12-15
2,María García,INFANTIL,12,2025,8000,3000,11000,PENDIENTE,2025-12-15
```

### Excel

**Endpoint:** `GET /api/reportes/cuotas/export/excel`

Similar al CSV pero genera formato .xlsx

### PDF

**Endpoint:** `GET /api/reportes/cuotas/export/pdf`

Genera reporte formateado en PDF.

---

## Dashboards Específicos

### Dashboard de Actividades

**Endpoint:** `GET /api/reportes/actividades/dashboard`

```json
{
  "success": true,
  "data": {
    "totalActividades": 15,
    "actividadesActivas": 12,
    "totalParticipantes": 180,
    "capacidadTotal": 250,
    "porcentajeOcupacion": 72,
    "actividadesMasPopulares": [
      {
        "nombre": "Guitarra",
        "participantes": 45,
        "capacidad": 50,
        "ocupacion": 90
      }
    ]
  }
}
```

### Dashboard de Socios

**Endpoint:** `GET /api/reportes/socios/dashboard`

```json
{
  "success": true,
  "data": {
    "totalSocios": 250,
    "sociosActivos": 240,
    "sociosInactivos": 10,
    "nuevosMesActual": 5,
    "bajasMesActual": 2,
    "porCategoria": {
      "ADULTO_GENERAL": 150,
      "INFANTIL": 60,
      "ESTUDIANTE": 30,
      "JUBILADO": 10
    },
    "crecimientoMensual": +1.2
  }
}
```

---

## Filtros Avanzados

Todos los endpoints de reportes soportan filtros:

**Filtros comunes:**
- `mes`, `anio`: Período
- `categoria`: Categoría de socio
- `estado`: Estado del recibo (PENDIENTE, PAGADO, VENCIDO, ANULADO)
- `fechaDesde`, `fechaHasta`: Rango de fechas
- `sortBy`: Campo de ordenamiento
- `order`: Orden (asc/desc)
- `page`, `limit`: Paginación

**Ejemplo:**
```bash
curl "http://localhost:8000/api/reportes/cuotas/dashboard?\
mes=12&\
anio=2025&\
categoria=ADULTO_GENERAL&\
estado=PENDIENTE&\
sortBy=montoTotal&\
order=desc"
```

---

## Webhooks para Alertas

Configurar webhooks para notificaciones automáticas:

**Eventos disponibles:**
- `cuota.vencida`: Cuando una cuota vence
- `morosidad.alta`: Cuando morosidad supera umbral
- `cobranza.baja`: Cuando cobranza cae bajo %

**Configuración:** (Próxima fase)
```json
{
  "evento": "cuota.vencida",
  "url": "https://mi-sistema.com/webhook",
  "metodo": "POST"
}
```

---

## Casos de Uso

### Caso 1: Análisis de Cobranza Mensual

```bash
# 1. Dashboard general
curl "http://localhost:8000/api/reportes/cuotas/dashboard?mes=12&anio=2025"

# 2. Por categoría
curl "http://localhost:8000/api/reportes/cuotas/por-categoria?mes=12&anio=2025"

# 3. Morosidad
curl "http://localhost:8000/api/reportes/cuotas/morosidad"

# 4. Exportar a Excel para presentar a comisión
curl "http://localhost:8000/api/reportes/cuotas/export/excel?mes=12&anio=2025" \
  -o informe_diciembre.xlsx
```

### Caso 2: Seguimiento de Ajustes

```bash
# Ver estadísticas de ajustes
curl "http://localhost:8000/api/ajustes/estadisticas"

# Ver ajustes activos
curl "http://localhost:8000/api/ajustes?activo=true&limit=100"

# Calcular impacto total
# (sumar todos los ajustes aplicados del mes)
```

### Caso 3: Evaluación de Exenciones

```bash
# Estadísticas generales
curl "http://localhost:8000/api/exenciones/estadisticas"

# Exenciones pendientes de aprobación
curl "http://localhost:8000/api/exenciones?estado=PENDIENTE_APROBACION"

# Exenciones activas (para calcular impacto)
curl "http://localhost:8000/api/exenciones?activa=true"
```

---

## Interpretación de Métricas

### Porcentaje de Cobranza

**Fórmula:** `(montoPagado / montoTotal) * 100`

**Interpretación:**
- **>80%**: Excelente
- **70-80%**: Bueno
- **60-70%**: Regular (requiere atención)
- **<60%**: Crítico (acciones inmediatas)

### Días de Mora Promedio

**Interpretación:**
- **<15 días**: Normal
- **15-30 días**: Atención
- **30-60 días**: Problema
- **>60 días**: Crítico (considerar acciones legales)

### Tasa de Conversión (Nuevos Socios)

**Fórmula:** `(nuevosEsteMes / totalConsultas) * 100`

**Interpretación:**
- **>50%**: Excelente
- **30-50%**: Bueno
- **<30%**: Revisar estrategia de captación

---

## Buenas Prácticas

1. **Revisar reportes regularmente:**
   - Dashboard: Diariamente
   - Cobranza: Semanalmente
   - Morosidad: Quincenalmente

2. **Exportar para presentaciones:**
   - Usar Excel/PDF para reuniones de comisión
   - Incluir gráficos y análisis

3. **Monitorear tendencias:**
   - Comparar meses consecutivos
   - Identificar patrones estacionales

4. **Actuar sobre alertas:**
   - Morosidad >30 días → enviar recordatorio
   - Cobranza <70% → revisar estrategia

---

## Próximos Pasos

- Explorar **Swagger Docs**: http://localhost:8000/api-docs
- Usar **Postman Collection** para probar endpoints
- Configurar **dashboards personalizados** según necesidades

---

**Documentación relacionada:**
- `GENERACION_CUOTAS.md` - Para entender flujo de cuotas
- `AJUSTES_EXENCIONES.md` - Para interpretar ajustes
