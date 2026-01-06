# 📋 PLAN DE IMPLEMENTACIÓN: Sistema de Cuotas V2 Completo

**Fecha de Creación:** 2026-01-04
**Proyecto:** SIGESDA Backend
**Objetivo:** Completar implementación y integración del Sistema de Cuotas V2

---

## 🔍 ANÁLISIS EJECUTIVO

### Hallazgo Crítico: Backend V2 YA ESTÁ IMPLEMENTADO (95%)

**Descubrimiento:** Contrario al análisis inicial del frontend, el backend **SÍ tiene implementada la arquitectura V2** casi en su totalidad.

### ✅ Componentes V2 Encontrados en el Backend

| Componente | Estado | Ubicación | Completitud |
|------------|--------|-----------|-------------|
| **ItemCuotaService** | ✅ Implementado | `src/services/item-cuota.service.ts` | 100% |
| **ItemCuotaController** | ✅ Implementado | `src/controllers/item-cuota.controller.ts` | 100% |
| **ItemCuotaRepository** | ✅ Implementado | `src/repositories/item-cuota.repository.ts` | 100% |
| **MotorReglasDescuentos** | ✅ Implementado | `src/services/motor-reglas-descuentos.service.ts` | 100% |
| **AjusteCuotaService** | ✅ Implementado | `src/services/ajuste-cuota.service.ts` | 100% |
| **ExencionCuotaService** | ✅ Implementado | `src/services/exencion-cuota.service.ts` | 100% |
| **HistorialAjusteCuota** | ✅ Implementado | Incluido en AjusteCuotaService | 100% |
| **Endpoints V2** | ✅ Montados | `src/routes/cuota.routes.ts` líneas 44-79 | 100% |

---

## 📊 ENDPOINTS V2 DISPONIBLES Y FUNCIONALES

### Generación y Cálculo V2
```
✅ POST   /api/cuotas/generar-v2               - Generación con items + descuentos
✅ POST   /api/cuotas/:id/recalcular           - Recalcular cuota individual
✅ POST   /api/cuotas/preview-recalculo        - Preview de recálculo
✅ POST   /api/cuotas/regenerar                - Regenerar cuotas del período
✅ GET    /api/cuotas/:id/comparar             - Comparar cuota actual vs recalculada
✅ GET    /api/cuotas/validar/:mes/:anio/generacion - Validar antes de generar
✅ GET    /api/cuotas/periodos/disponibles     - Períodos disponibles
```

### Ítems de Cuota
```
✅ GET    /api/cuotas/:cuotaId/items           - Listar items con resumen
✅ GET    /api/cuotas/:cuotaId/items/desglose  - Desglose por categoría
✅ GET    /api/cuotas/:cuotaId/items/segmentados - Items automáticos vs manuales
✅ POST   /api/cuotas/:cuotaId/items           - Agregar item manual
✅ POST   /api/cuotas/:cuotaId/items/regenerar - Regenerar todos los items
✅ POST   /api/cuotas/:cuotaId/items/descuento-global - Aplicar descuento %
```

### Ítems Individuales
```
✅ GET    /api/items-cuota/:id                 - Obtener item por ID
✅ PUT    /api/items-cuota/:id                 - Actualizar item editable
✅ DELETE /api/items-cuota/:id                 - Eliminar item editable
✅ POST   /api/items-cuota/:id/duplicar        - Duplicar item
✅ GET    /api/items-cuota/estadisticas        - Estadísticas globales
✅ GET    /api/items-cuota/tipo/:codigo        - Buscar por tipo
✅ GET    /api/items-cuota/categoria/:codigo   - Buscar por categoría
```

### Ajustes Manuales
```
✅ POST   /api/ajustes-cuota                   - Crear ajuste
✅ GET    /api/ajustes-cuota/persona/:id       - Listar por persona
✅ PUT    /api/ajustes-cuota/:id               - Actualizar ajuste
✅ DELETE /api/ajustes-cuota/:id               - Eliminar ajuste
```

### Exenciones
```
✅ POST   /api/exenciones-cuota                - Solicitar exención
✅ POST   /api/exenciones-cuota/:id/aprobar    - Aprobar exención
✅ POST   /api/exenciones-cuota/:id/rechazar   - Rechazar exención
✅ POST   /api/exenciones-cuota/:id/revocar    - Revocar exención
✅ GET    /api/exenciones-cuota/check/:personaId/:fecha - Verificar exención activa
```

### Catálogos V2
```
✅ GET    /api/catalogos/categorias-items      - Catálogo de categorías
✅ GET    /api/catalogos/tipos-items-cuota     - Catálogo de tipos
```

---

## ❌ GAPS REALES IDENTIFICADOS

### 1. 🔴 CRÍTICO: RecibosSlice No Conectado a Backend

**Problema:** El módulo de recibos usa mock data en lugar de la API real.

**Archivo:** Frontend `src/store/slices/recibosSlice.ts` líneas 114-478

**Evidencia:**
```typescript
// Líneas 114-330: Mock data (217 líneas)
const mockRecibos = [
  { id: 1, numero: "REC-20241215-0001", tipo: "CUOTA", estado: "PENDIENTE", ... },
  { id: 2, numero: "REC-20241215-0002", tipo: "CUOTA", estado: "PAGADO", ... },
  // ... más mock data
];

// Líneas 331-478: Thunks que NO llaman a recibosService
export const fetchRecibos = createAsyncThunk(
  'recibos/fetchRecibos',
  async (filters: RecibosFilters = {}) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula latencia
    return {
      recibos: mockRecibos.filter(...), // NO usa recibosService.getRecibos()
      pagination: {...}
    };
  }
);
```

**Impacto:**
- ✅ UI funciona perfectamente
- ❌ Datos NO se persisten en backend
- ❌ No sincroniza con DB real

---

### 2. 🟡 MODERADO: Seeds Sin Datos de ItemCuota

**Problema:** El seed crea 2 cuotas legacy pero CERO items de cuota.

**Archivo:** `prisma/seed.ts`

**Estado Actual:**
```typescript
// Aproximadamente líneas 350-400
await prisma.cuota.create({
  data: {
    mes: 11,
    anio: 2024,
    montoBase: 50.00,        // ← Usa campos legacy
    montoActividades: 30.00,  // ← Usa campos legacy
    montoTotal: 80.00,
    recibo: { connect: { id: recibo1.id } }
    // NO crea items_cuota
  }
});
```

**Impacto:**
- ⚠️ No se puede probar el desglose de items visualmente
- ⚠️ DetalleCuotaModal muestra tablas vacías

---

### 3. 🟢 MENOR: Sin Schemas Zod en Frontend

**Problema:** Frontend no tiene schemas de validación Zod.

**Faltantes:**
```
❌ src/schemas/cuota.schema.ts
❌ src/schemas/recibo.schema.ts
❌ src/schemas/ajuste.schema.ts
❌ src/schemas/exencion.schema.ts
```

**Comparación:**
```
✅ Backend: src/dto/cuota.dto.ts - Existe con Zod
✅ Backend: src/dto/recibo.dto.ts - Existe con Zod
✅ Backend: src/dto/ajuste-cuota.dto.ts - Existe con Zod
✅ Backend: src/dto/exencion-cuota.dto.ts - Existe con Zod

❌ Frontend: Sin schemas Zod
```

---

### 4. 🟢 MENOR: Features UI Incompletas

| Feature | Estado | Observación |
|---------|--------|-------------|
| Exportar reportes | ⚠️ Incompleto | Solo `console.log('exportar')` |
| Charts en reportes | ⚠️ Placeholder | Texto sin gráficos reales |
| Agregar ítem manual | ⚠️ Comentado | Botón deshabilitado en DetalleCuotaModal:149 |
| Importar recibos | ⚠️ Sin UI | API existe pero falta componente |

---

## 🎯 ANÁLISIS FINAL

### Funcionalidades Backend V2: ✅ 95% COMPLETO

| Feature | Backend | Frontend | Gap |
|---------|---------|----------|-----|
| ItemCuota System | ✅ 100% | ✅ 90% | Conectar + Seeds |
| Motor Descuentos | ✅ 100% | ✅ 80% | Conectar + Probar |
| Ajustes Manuales | ✅ 100% | ✅ 100% | Conectar |
| Exenciones | ✅ 100% | ✅ 100% | Conectar |
| Recibos CRUD | ✅ 100% | ⚠️ MOCK | **Conectar API Real** |
| Reportes Dashboard | ✅ 100% | ✅ 100% | Conectar |

### Gap Real: **INTEGRACIÓN, NO IMPLEMENTACIÓN**

El problema NO es que falten features, sino que:
1. Frontend usa mock data en lugar de API real
2. Seeds no demuestran V2 (usan campos legacy)
3. Falta testing E2E para validar integración

---

---

# 📅 PLAN DE IMPLEMENTACIÓN POR FASES

---

# **FASE 1: INTEGRACIÓN BÁSICA**

**Duración:** 1 semana
**Esfuerzo:** 24-32 horas
**Prioridad:** 🔴 ALTA

**Objetivo:** Conectar frontend al backend V2 real

---

## 1.1 Conectar RecibosSlice a API Real

**Estimación:** 6-8 horas

### Tarea 1.1.1: Eliminar Mock Data

**Archivo:** Frontend `src/store/slices/recibosSlice.ts`
**Líneas:** 114-330
**Acción:** Eliminar 217 líneas de mock data

### Tarea 1.1.2-1.1.10: Modificar Thunks

Modificar los siguientes thunks para usar `recibosService` real:

1. `fetchRecibos` (líneas 331-357)
2. `fetchReciboById` (líneas 359-366)
3. `createRecibo` (líneas 368-375)
4. `updateRecibo` (líneas 377-391)
5. `deleteRecibo` (líneas 393-403)
6. `pagarRecibo` (líneas 405-418)
7. `generarRecibo` (líneas 420-430)
8. `anularRecibo` (líneas 432-443)
9. `fetchEstadisticas` (líneas 445-457)
10. `fetchVencidos` (líneas 459-469)

**Patrón de cambio:**
```typescript
// ANTES (Mock):
async (filters) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockRecibos.filter(...);
}

// DESPUÉS (Real API):
async (filters) => {
  const response = await recibosService.getRecibos(filters);
  return response.data;
}
```

### Tarea 1.1.11: Probar Flujo Completo

**Verificaciones:**
- [ ] Crear recibo desde UI
- [ ] Verificar en DB PostgreSQL con Prisma Studio
- [ ] Actualizar recibo
- [ ] Pagar recibo
- [ ] Anular recibo
- [ ] No hay errores 404 en consola

---

## 1.2 Probar Endpoints V2 de Cuotas

**Estimación:** 4-6 horas

### Tarea 1.2.1: Probar Generación V2 desde Wizard

**Componente:** `GeneracionMasivaModal.tsx`
**Endpoint:** `POST /api/cuotas/generar-v2`

**Verificaciones:**
- [ ] Wizard completa 3 pasos sin errores
- [ ] Request incluye `aplicarDescuentos: true`
- [ ] Response incluye `resumenDescuentos`
- [ ] Cuotas creadas tienen items asociados
- [ ] Verificar en Prisma Studio tabla `items_cuota`

### Tarea 1.2.2: Verificar Desglose de Items

**Componente:** `DetalleCuotaModal.tsx`
**Endpoint:** `GET /api/cuotas/:id/items/desglose`

**Verificaciones:**
- [ ] Tabla BASE muestra items de cuota base
- [ ] Tabla ACTIVIDAD muestra items de actividades
- [ ] Tabla DESCUENTO muestra descuentos aplicados
- [ ] Subtotales correctos
- [ ] Total final correcto

### Tarea 1.2.3: Probar Recálculo de Cuota

**Endpoint:** `POST /api/cuotas/:id/recalcular`

**Verificaciones:**
- [ ] Botón "Recalcular" funciona
- [ ] Muestra preview de cambios
- [ ] Actualiza montoTotal
- [ ] Regenera items correctamente

### Tarea 1.2.4: Probar Validación de Generación

**Endpoint:** `GET /api/cuotas/validar/:mes/:anio/generacion`

**Verificaciones:**
- [ ] Wizard paso 2 muestra warnings si período ya tiene cuotas
- [ ] Lista socios correctamente
- [ ] Muestra cantidad estimada a generar

---

## 1.3 Probar Ajustes y Exenciones

**Estimación:** 4-6 horas

### Tarea 1.3.1: Crear Ajuste Manual

**Componente:** `GestionAjustesModal.tsx`
**Endpoint:** `POST /api/ajustes-cuota`

**Verificaciones:**
- [ ] Formulario valida campos
- [ ] Se crea en DB (`ajustes_cuota_socio`)
- [ ] Aparece en lista
- [ ] Fechas validan correctamente
- [ ] `itemsAfectados` funciona si `aplicaA = ITEMS_ESPECIFICOS`
- [ ] Se crea registro en `historial_ajustes_cuota`

### Tarea 1.3.2: Actualizar Ajuste

**Endpoint:** `PUT /api/ajustes-cuota/:id`

**Verificaciones:**
- [ ] Edición funciona
- [ ] Cambios persisten
- [ ] History tracking funciona

### Tarea 1.3.3: Eliminar Ajuste

**Endpoint:** `DELETE /api/ajustes-cuota/:id`

**Verificaciones:**
- [ ] Soft delete (`activo = false`)
- [ ] No aparece en activos
- [ ] History tracking registra eliminación

### Tarea 1.3.4: Solicitar Exención

**Componente:** `GestionExencionesModal.tsx`
**Endpoint:** `POST /api/exenciones-cuota`

**Verificaciones:**
- [ ] Formulario valida tipo (TOTAL vs PARCIAL)
- [ ] Si PARCIAL, requiere porcentaje
- [ ] Estado inicial = `PENDIENTE_APROBACION`
- [ ] Se crea en DB

### Tarea 1.3.5: Aprobar Exención

**Endpoint:** `POST /api/exenciones-cuota/:id/aprobar`

**Verificaciones:**
- [ ] Estado cambia a `APROBADA`
- [ ] `fechaAprobacion` se registra
- [ ] `aprobadoPor` se guarda
- [ ] History tracking funciona

### Tarea 1.3.6: Rechazar Exención

**Endpoint:** `POST /api/exenciones-cuota/:id/rechazar`

**Verificaciones:**
- [ ] Estado cambia a `RECHAZADA`
- [ ] Motivo se guarda
- [ ] History tracking funciona

### Tarea 1.3.7: Revocar Exención

**Endpoint:** `POST /api/exenciones-cuota/:id/revocar`

**Verificaciones:**
- [ ] Estado cambia a `REVOCADA`
- [ ] Motivo se guarda
- [ ] Ya no aplica en cálculos futuros

---

## 1.4 Feature Flags (Opcional)

**Estimación:** 2-3 horas

### Tarea 1.4.1: Crear Archivo de Configuración

**Crear:** Frontend `src/config/features.ts`

```typescript
export const FEATURES = {
  CUOTAS_V2: true,
  MOTOR_DESCUENTOS: true,
  AJUSTES_MANUALES: true,
  EXENCIONES: true,
  REPORTES_AVANZADOS: true,
};
```

### Tarea 1.4.2: Integrar en GeneracionMasivaModal

```typescript
import { FEATURES } from '@/config/features';

const handleGenerar = async () => {
  const endpoint = FEATURES.CUOTAS_V2 ? 'generar-v2' : 'generar';
  await dispatch(generarCuotas(endpoint, formData));
};
```

### Tarea 1.4.3: Integrar en DetalleCuotaModal

```typescript
{FEATURES.CUOTAS_V2 && (
  <Box>
    <Typography variant="h6">Desglose de Ítems</Typography>
    {/* Tablas de items */}
  </Box>
)}
```

---

## 📋 Criterios de Aceptación - Fase 1

### ✅ Fase 1 Completa Cuando:

1. **Recibos se guardan en PostgreSQL**
   - Crear recibo desde UI persiste en DB
   - No hay mock data en uso
   - Prisma Studio muestra recibos reales

2. **Generar cuotas crea items automáticamente**
   - Endpoint `/cuotas/generar-v2` funciona
   - Cada cuota tiene 2+ items
   - Items tienen tipos correctos

3. **Desglose muestra items reales**
   - DetalleCuotaModal carga desglose
   - Tablas por categoría tienen datos
   - Subtotales correctos

4. **Ajustes y exenciones persisten**
   - CRUD ajuste funciona
   - Workflow exención funciona
   - History tracking registra acciones

5. **No hay errores 404**
   - Todos endpoints V2 responden
   - No hay llamadas fallidas

---

---

# **FASE 2: POBLADO DE DATOS DE DEMOSTRACIÓN**

**Duración:** 3 días
**Esfuerzo:** 12-16 horas
**Prioridad:** 🔴 ALTA

**Objetivo:** Seeds demuestran arquitectura V2 completa

---

## 2.1 Actualizar Seed de Cuotas

**Estimación:** 4-6 horas

### Tarea 2.1.1: Modificar Cuota 1 con Items

**Archivo:** `prisma/seed.ts`
**Ubicación:** Aproximadamente líneas 350-400

```typescript
// DESPUÉS (V2 con Items):
const cuota1 = await prisma.cuota.create({
  data: {
    mes: 11,
    anio: 2024,
    montoBase: null,         // ← Arquitectura V2
    montoActividades: null,  // ← Arquitectura V2
    montoTotal: 80.00,
    recibo: { connect: { id: recibo1.id } },
    items: {
      create: [
        {
          tipoItemId: 1, // CUOTA_BASE_SOCIO
          concepto: "Cuota Base Socio Activo",
          monto: 50.00,
          cantidad: 1,
          esAutomatico: true,
          esEditable: false,
          metadata: {
            categoriaId: 2,
            periodo: "2024-11"
          }
        },
        {
          tipoItemId: 3, // ACTIVIDAD_INDIVIDUAL
          concepto: "Piano Nivel 1",
          monto: 30.00,
          cantidad: 1,
          esAutomatico: true,
          esEditable: false,
          metadata: {
            actividadId: 1,
            nombreActividad: "Piano Nivel 1"
          }
        }
      ]
    }
  },
  include: { items: true }
});
```

### Tarea 2.1.2: Crear Cuota 2 con Descuento

```typescript
const cuota2 = await prisma.cuota.create({
  data: {
    mes: 11,
    anio: 2024,
    montoTotal: 68.00, // 80 - 12 (descuento familiar 15%)
    items: {
      create: [
        {
          tipoItemId: 1,
          concepto: "Cuota Base Socio Activo",
          monto: 50.00,
          cantidad: 1,
          esAutomatico: true,
          esEditable: false
        },
        {
          tipoItemId: 3,
          concepto: "Piano Nivel 1",
          monto: 30.00,
          cantidad: 1,
          esAutomatico: true,
          esEditable: false
        },
        {
          tipoItemId: 5, // DESCUENTO_FAMILIAR
          concepto: "Descuento Familiar 15%",
          monto: -12.00,
          cantidad: 1,
          porcentaje: 15.0,
          esAutomatico: true,
          esEditable: false,
          metadata: {
            reglaId: 2,
            familiares: [
              { personaId: 5, parentesco: "HERMANO" }
            ]
          }
        }
      ]
    }
  }
});
```

### Tarea 2.1.3: Crear Cuota 3 con Recargo por Mora

```typescript
const cuota3 = await prisma.cuota.create({
  data: {
    mes: 10,
    anio: 2024,
    montoTotal: 88.00, // 80 + 8 (recargo 10%)
    items: {
      create: [
        {
          tipoItemId: 1,
          concepto: "Cuota Base Socio General",
          monto: 40.00,
          cantidad: 1,
          esAutomatico: true,
          esEditable: false
        },
        {
          tipoItemId: 3,
          concepto: "Guitarra Nivel 2",
          monto: 40.00,
          cantidad: 1,
          esAutomatico: true,
          esEditable: false
        },
        {
          tipoItemId: 7, // RECARGO_MORA
          concepto: "Recargo por Mora 10%",
          monto: 8.00,
          cantidad: 1,
          porcentaje: 10.0,
          esAutomatico: true,
          esEditable: false,
          metadata: {
            diasVencido: 15,
            fechaVencimiento: "2024-11-10"
          }
        }
      ]
    }
  }
});
```

### Tarea 2.1.4: Probar Seed Completo

```bash
npx prisma migrate reset
```

**Verificaciones:**
- [ ] No hay errores durante el seed
- [ ] Se crean 3+ cuotas
- [ ] Cada cuota tiene 2-3 items
- [ ] Al menos 1 cuota tiene descuento
- [ ] Al menos 1 cuota tiene recargo
- [ ] Prisma Studio muestra items correctamente

---

## 2.2 Crear HistorialAjusteCuota en Seeds

**Estimación:** 2-3 horas

### Tarea 2.2.1: Agregar Log de Creación de Ajuste

```typescript
// Después de crear ajuste1
await prisma.historialAjusteCuota.create({
  data: {
    ajusteId: ajuste1.id,
    personaId: socio4.id,
    accion: 'CREAR_AJUSTE',
    datosPrevios: null,
    datosNuevos: {
      tipoAjuste: ajuste1.tipoAjuste,
      valor: ajuste1.valor.toString(),
      concepto: ajuste1.concepto,
      aplicaA: ajuste1.aplicaA,
      motivo: ajuste1.motivo
    },
    usuario: 'SEED_SCRIPT',
    motivoCambio: 'Creación inicial desde seed'
  }
});
```

### Tarea 2.2.2: Agregar Log de Modificación de Ajuste

```typescript
await prisma.historialAjusteCuota.create({
  data: {
    ajusteId: ajuste1.id,
    personaId: socio4.id,
    accion: 'MODIFICAR_AJUSTE',
    datosPrevios: { valor: "10.00" },
    datosNuevos: { valor: "15.00" },
    usuario: 'ADMIN_USER',
    motivoCambio: 'Ajuste por inflación trimestral'
  }
});
```

### Tarea 2.2.3: Agregar Log de Exención

```typescript
await prisma.historialAjusteCuota.create({
  data: {
    exencionId: exencion1.id,
    personaId: socio5.id,
    accion: 'CREAR_EXENCION',
    datosPrevios: null,
    datosNuevos: {
      tipoExencion: 'PARCIAL',
      porcentajeExencion: 50,
      motivoExencion: 'BECA',
      descripcion: exencion1.descripcionMotivo
    },
    usuario: 'SEED_SCRIPT',
    motivoCambio: 'Exención por beca artística'
  }
});
```

### Tarea 2.2.4: Verificar en Prisma Studio

```bash
npm run db:studio
```

**Verificaciones:**
- [ ] Tabla `historial_ajustes_cuota` tiene 3+ registros
- [ ] `datosPrevios` y `datosNuevos` son JSONB válidos
- [ ] Relaciones funcionan

---

## 2.3 Crear AplicacionRegla en Seeds

**Estimación:** 2-3 horas

### Tarea 2.3.1: Obtener IDs de Reglas

```typescript
const reglaFamiliar = await prisma.reglaDescuento.findUnique({
  where: { codigo: 'DESC_FAMILIAR' }
});

const reglaAntiguedad = await prisma.reglaDescuento.findUnique({
  where: { codigo: 'DESC_ANTIGUEDAD' }
});
```

### Tarea 2.3.2: Crear Aplicación de Regla Familiar

```typescript
const itemDescuentoFamiliar = await prisma.itemCuota.findFirst({
  where: {
    cuotaId: cuota2.id,
    tipoItem: { codigo: 'DESCUENTO_FAMILIAR' }
  }
});

await prisma.aplicacionRegla.create({
  data: {
    cuotaId: cuota2.id,
    reglaId: reglaFamiliar.id,
    itemCuotaId: itemDescuentoFamiliar?.id,
    porcentajeAplicado: 15.0,
    montoDescuento: 12.00,
    metadata: {
      familiares: [
        {
          personaId: socio5.id,
          nombreCompleto: "María González",
          parentesco: "HERMANO",
          actividadesCompartidas: ["Piano Nivel 1"]
        }
      ],
      criterioAplicacion: 'FAMILIAR_INSCRITO_MISMA_ACTIVIDAD',
      baseCalculo: 80.00
    }
  }
});
```

### Tarea 2.3.3: Crear Aplicación de Regla de Antigüedad

```typescript
await prisma.aplicacionRegla.create({
  data: {
    cuotaId: cuotaSocioAntiguo.id,
    reglaId: reglaAntiguedad.id,
    itemCuotaId: itemDescuentoAntiguedad?.id,
    porcentajeAplicado: 10.0,
    montoDescuento: 8.00,
    metadata: {
      aniosAntiguedad: 5,
      fechaAltaSocio: '2019-01-15',
      criterioAplicacion: 'ANTIGUEDAD_MAYOR_5_ANIOS',
      baseCalculo: 80.00
    }
  }
});
```

### Tarea 2.3.4: Verificar en Prisma Studio

**Verificaciones:**
- [ ] Tabla `aplicaciones_reglas` tiene 2+ registros
- [ ] Relaciones funcionan
- [ ] Metadata JSONB válido

---

## 📋 Criterios de Aceptación - Fase 2

### ✅ Fase 2 Completa Cuando:

1. **`npx prisma migrate reset` funciona**
   - Proceso termina sin errores
   - Todas las tablas tienen datos

2. **Seeds incluyen 2+ cuotas con items**
   - Mínimo 3 cuotas
   - Cada una con 2-4 items
   - Items variados (BASE, ACTIVIDAD, DESCUENTO, RECARGO)

3. **Hay al menos 2 logs de historial**
   - Tabla `historial_ajustes_cuota` con datos
   - Incluye log de ajuste y exención

4. **Hay al menos 1 aplicación de regla**
   - Tabla `aplicaciones_reglas` con datos
   - Relaciones funcionan
   - Metadata completo

---

---

# **FASE 3: SCHEMAS ZOD Y VALIDACIONES**

**Duración:** 4 días
**Esfuerzo:** 12-16 horas
**Prioridad:** 🟡 MEDIA

**Objetivo:** Validaciones client-side robustas con type safety

---

## 3.1 Crear Schema de Cuotas

**Estimación:** 3-4 horas

### Tarea 3.1.1: Crear Archivo Base

**Crear:** Frontend `src/schemas/cuota.schema.ts`

```typescript
import { z } from 'zod';

export const createCuotaSchema = z.object({
  receptorId: z.number().int().positive('Receptor requerido'),
  reciboId: z.number().int().positive().optional().nullable(),
  mes: z.number().int().min(1).max(12),
  anio: z.number().int().min(2020).max(2100),
  montoBase: z.number().min(0).optional().nullable(),
  montoActividades: z.number().min(0).optional().nullable(),
  montoTotal: z.number().min(0),
  observaciones: z.string().max(500).optional().nullable(),
});

export const updateCuotaSchema = createCuotaSchema.partial();

export const generarCuotasSchema = z.object({
  mes: z.number().int().min(1).max(12),
  anio: z.number().int().min(2020).max(2100),
  categorias: z.array(z.string()).min(1, 'Seleccione al menos una categoría'),
  aplicarDescuentos: z.boolean().default(true),
  soloNuevas: z.boolean().default(true),
});

export type CreateCuotaFormData = z.infer<typeof createCuotaSchema>;
export type UpdateCuotaFormData = z.infer<typeof updateCuotaSchema>;
export type GenerarCuotasFormData = z.infer<typeof generarCuotasSchema>;
```

### Tarea 3.1.2: Agregar Validaciones Personalizadas

```typescript
export const cuotaPeriodoSchema = z.object({
  mes: z.number().int().min(1).max(12),
  anio: z.number().int().min(2020).max(2100),
}).refine(data => {
  const periodoDate = new Date(data.anio, data.mes - 1, 1);
  const now = new Date();
  const maxFutureMonths = 12;

  const monthsDiff = (periodoDate.getFullYear() - now.getFullYear()) * 12
                     + (periodoDate.getMonth() - now.getMonth());

  return monthsDiff <= maxFutureMonths;
}, {
  message: 'No se pueden generar cuotas con más de 12 meses de anticipación',
  path: ['mes'],
});

export const recalcularCuotaSchema = z.object({
  aplicarDescuentos: z.boolean().default(true),
  mantenerItemsManuales: z.boolean().default(true),
  recalcularAjustes: z.boolean().default(false),
});
```

### Tarea 3.1.3: Integrar en CuotaForm

```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCuotaSchema, type CreateCuotaFormData } from '@/schemas/cuota.schema';

const { control, handleSubmit, formState: { errors } } = useForm<CreateCuotaFormData>({
  resolver: zodResolver(createCuotaSchema),
  defaultValues: {
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear()
  }
});
```

---

## 3.2 Crear Schema de Ajustes

**Estimación:** 3-4 horas

### Tarea 3.2.1: Crear Archivo de Ajustes

**Crear:** Frontend `src/schemas/ajuste.schema.ts`

```typescript
import { z } from 'zod';

export const createAjusteSchema = z.object({
  personaId: z.number().int().positive('Persona requerida'),
  tipoAjuste: z.enum([
    'DESCUENTO_FIJO',
    'DESCUENTO_PORCENTAJE',
    'RECARGO_FIJO',
    'RECARGO_PORCENTAJE',
    'MONTO_FIJO_TOTAL'
  ]),
  valorAjuste: z.number().positive('Valor debe ser mayor a 0'),
  aplicaA: z.enum(['TOTAL_CUOTA', 'BASE', 'ACTIVIDADES', 'ITEMS_ESPECIFICOS']),
  itemsEspecificos: z.array(z.number()).optional(),
  concepto: z.string().min(3).max(200),
  motivo: z.string().max(500).optional().nullable(),
  fechaInicio: z.string().datetime(),
  fechaFin: z.string().datetime().optional().nullable(),
})
.refine(data => {
  if (data.aplicaA === 'ITEMS_ESPECIFICOS') {
    return data.itemsEspecificos && data.itemsEspecificos.length > 0;
  }
  return true;
}, {
  message: 'Debe especificar al menos un item cuando aplicaA es ITEMS_ESPECIFICOS',
  path: ['itemsEspecificos'],
})
.refine(data => {
  if (data.fechaFin) {
    return new Date(data.fechaFin) > new Date(data.fechaInicio);
  }
  return true;
}, {
  message: 'Fecha de fin debe ser posterior a fecha de inicio',
  path: ['fechaFin'],
});

export const updateAjusteSchema = createAjusteSchema.partial().omit({ personaId: true });

export type CreateAjusteFormData = z.infer<typeof createAjusteSchema>;
export type UpdateAjusteFormData = z.infer<typeof updateAjusteSchema>;
```

### Tarea 3.2.2: Integrar en GestionAjustesModal

```typescript
const { control, handleSubmit, watch, formState: { errors } } = useForm<CreateAjusteFormData>({
  resolver: zodResolver(createAjusteSchema),
  defaultValues: {
    personaId,
    tipoAjuste: 'DESCUENTO_PORCENTAJE',
    aplicaA: 'TOTAL_CUOTA',
    fechaInicio: new Date().toISOString()
  }
});

const aplicaA = watch('aplicaA');

// Renderizar campo itemsEspecificos condicionalmente
{aplicaA === 'ITEMS_ESPECIFICOS' && (
  <Controller
    name="itemsEspecificos"
    control={control}
    render={({ field }) => (
      <Select multiple {...field} error={!!errors.itemsEspecificos}>
        {/* opciones */}
      </Select>
    )}
  />
)}
```

---

## 3.3 Crear Schema de Exenciones

**Estimación:** 3-4 horas

### Tarea 3.3.1: Crear Archivo de Exenciones

**Crear:** Frontend `src/schemas/exencion.schema.ts`

```typescript
import { z } from 'zod';

export const createExencionSchema = z.object({
  personaId: z.number().int().positive(),
  tipoExencion: z.enum(['TOTAL', 'PARCIAL']),
  porcentajeExencion: z.number().min(1).max(100).optional().nullable(),
  motivoExencion: z.enum([
    'BECA',
    'SOCIO_FUNDADOR',
    'SOCIO_HONORARIO',
    'SITUACION_ECONOMICA',
    'MERITO_ACADEMICO',
    'COLABORACION_INSTITUCIONAL',
    'EMERGENCIA_FAMILIAR',
    'OTRO'
  ]),
  descripcionMotivo: z.string().max(1000).optional().nullable(),
  fechaInicio: z.string().datetime(),
  fechaFin: z.string().datetime(),
  justificacion: z.string().min(10).max(2000),
  documentoRespaldo: z.string().max(500).optional().nullable(),
})
.refine(data => {
  if (data.tipoExencion === 'PARCIAL') {
    return data.porcentajeExencion !== null;
  }
  return true;
}, {
  message: 'Porcentaje requerido para exención parcial',
  path: ['porcentajeExencion'],
})
.refine(data => {
  return new Date(data.fechaFin) > new Date(data.fechaInicio);
}, {
  message: 'Fecha de fin debe ser posterior a fecha de inicio',
  path: ['fechaFin'],
})
.refine(data => {
  const diffYears = (new Date(data.fechaFin).getTime() - new Date(data.fechaInicio).getTime()) / (1000 * 60 * 60 * 24 * 365);
  return diffYears <= 2;
}, {
  message: 'El período de exención no puede exceder 2 años',
  path: ['fechaFin'],
});

export const aprobarExencionSchema = z.object({
  aprobadoPor: z.string().min(1),
  observaciones: z.string().max(1000).optional().nullable(),
});

export const rechazarExencionSchema = z.object({
  motivoRechazo: z.string().min(10),
});

export const revocarExencionSchema = z.object({
  motivoRevocacion: z.string().min(10),
});

export type CreateExencionFormData = z.infer<typeof createExencionSchema>;
export type AprobarExencionFormData = z.infer<typeof aprobarExencionSchema>;
export type RechazarExencionFormData = z.infer<typeof rechazarExencionSchema>;
export type RevocarExencionFormData = z.infer<typeof revocarExencionSchema>;
```

### Tarea 3.3.2: Integrar en GestionExencionesModal

```typescript
const { control, handleSubmit, watch, formState: { errors } } = useForm<CreateExencionFormData>({
  resolver: zodResolver(createExencionSchema),
  defaultValues: {
    personaId,
    tipoExencion: 'PARCIAL',
    motivoExencion: 'BECA',
    fechaInicio: new Date().toISOString(),
    fechaFin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  }
});

const tipoExencion = watch('tipoExencion');

{tipoExencion === 'PARCIAL' && (
  <Controller
    name="porcentajeExencion"
    control={control}
    render={({ field }) => (
      <TextField
        {...field}
        type="number"
        label="Porcentaje de Exención (%)"
        error={!!errors.porcentajeExencion}
        helperText={errors.porcentajeExencion?.message}
        inputProps={{ min: 1, max: 100 }}
      />
    )}
  />
)}
```

---

## 📋 Criterios de Aceptación - Fase 3

### ✅ Fase 3 Completa Cuando:

1. **Formularios muestran errores en tiempo real**
   - Errores aparecen al perder foco
   - Mensajes descriptivos en español
   - Estilos de error correctos

2. **No se pueden enviar datos inválidos**
   - Botón submit deshabilitado si hay errores
   - Validaciones bloquean submit

3. **Type inference funciona en TypeScript**
   - IntelliSense muestra tipos correctos
   - No hay errores de compilación
   - Autocomplete funciona

---

---

# **FASE 4: COMPLETAR FEATURES UI**

**Duración:** 1 semana
**Esfuerzo:** 20-28 horas
**Prioridad:** 🟡 MEDIA

**Objetivo:** Completar features UI faltantes

---

## 4.1 Implementar Exportar Reportes

**Estimación:** 4-6 horas

### Tarea 4.1.1: Modificar Handler de Exportación

**Archivo:** Frontend `src/pages/Cuotas/ReportesCuotasPage.tsx` línea 42

```typescript
// ANTES:
const handleExportar = () => {
  console.log('Exportar reporte');
};

// DESPUÉS:
const handleExportar = async () => {
  try {
    setLoading(true);

    const response = await reportesService.exportarReporte({
      mes: filtros.mes,
      anio: filtros.anio,
      formato: 'EXCEL',
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-cuotas-${filtros.anio}-${filtros.mes.toString().padStart(2, '0')}.xlsx`;
    link.click();

    window.URL.revokeObjectURL(url);

    enqueueSnackbar('Reporte exportado exitosamente', { variant: 'success' });
  } catch (error) {
    console.error('Error al exportar:', error);
    enqueueSnackbar('Error al exportar reporte', { variant: 'error' });
  } finally {
    setLoading(false);
  }
};
```

### Tarea 4.1.2: Agregar Selector de Formato

```typescript
const [formatoExportar, setFormatoExportar] = useState<'EXCEL' | 'PDF' | 'CSV'>('EXCEL');

<FormControl>
  <InputLabel>Formato</InputLabel>
  <Select value={formatoExportar} onChange={(e) => setFormatoExportar(e.target.value)}>
    <MenuItem value="EXCEL">Excel (.xlsx)</MenuItem>
    <MenuItem value="PDF">PDF (.pdf)</MenuItem>
    <MenuItem value="CSV">CSV (.csv)</MenuItem>
  </Select>
</FormControl>

<Button variant="contained" onClick={handleExportar} disabled={loading}>
  {loading ? <CircularProgress size={24} /> : 'Exportar'}
</Button>
```

### Tarea 4.1.3: Verificar Endpoint Backend

Confirmar que existe: `POST /api/reportes/cuotas/exportar`

### Tarea 4.1.4: Probar Descarga

**Verificaciones:**
- [ ] Exportar como Excel
- [ ] Verificar que descarga archivo
- [ ] Abrir Excel y validar datos
- [ ] Probar PDF y CSV

---

## 4.2 Agregar Charts Reales

**Estimación:** 6-8 horas

### Tarea 4.2.1: Instalar Recharts

```bash
npm install recharts
```

### Tarea 4.2.2: Crear Componente DistribucionEstadoChart

**Crear:** Frontend `src/components/Cuotas/Charts/DistribucionEstadoChart.tsx`

```typescript
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  data: {
    estado: string;
    cantidad: number;
    monto: number;
  }[];
}

const COLORS = {
  PAGADO: '#4caf50',
  PENDIENTE: '#ff9800',
  VENCIDO: '#f44336',
  CANCELADO: '#9e9e9e'
};

export const DistribucionEstadoChart: React.FC<Props> = ({ data }) => {
  const chartData = data.map(item => ({
    name: item.estado,
    value: item.cantidad,
    fill: COLORS[item.estado as keyof typeof COLORS]
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
```

### Tarea 4.2.3: Crear Componente RecaudacionMensualChart

**Crear:** Frontend `src/components/Cuotas/Charts/RecaudacionMensualChart.tsx`

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  data: {
    categoria: string;
    cantidad: number;
    monto: number;
  }[];
}

export const RecaudacionMensualChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="categoria" />
        <YAxis />
        <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
        <Legend />
        <Bar dataKey="monto" fill="#2196f3" name="Recaudado" />
      </BarChart>
    </ResponsiveContainer>
  );
};
```

### Tarea 4.2.4: Integrar en ReportesCuotasPage

**Archivo:** Frontend `src/pages/Cuotas/ReportesCuotasPage.tsx` líneas 97-152

```typescript
// ANTES:
<Typography variant="body2" color="text.secondary">
  Gráfico de distribución por estado (placeholder)
</Typography>

// DESPUÉS:
<DistribucionEstadoChart
  data={dashboardData?.distribucion.porEstado || []}
/>
```

### Tarea 4.2.5: Probar Renderizado

**Verificaciones:**
- [ ] Charts renderizan sin errores
- [ ] Datos se actualizan al cambiar mes/año
- [ ] Tooltips funcionan
- [ ] Leyendas son legibles
- [ ] Responsive en mobile

---

## 4.3 Habilitar "Agregar Ítem Manual"

**Estimación:** 6-8 horas

### Tarea 4.3.1: Descomentar Botón

**Archivo:** Frontend `src/components/Cuotas/DetalleCuotaModal.tsx` línea 149

```typescript
<Button
  variant="outlined"
  startIcon={<AddIcon />}
  onClick={handleAgregarItem}
  disabled={cuota.recibo?.estado === 'PAGADO'}
>
  Agregar Ítem Manual
</Button>
```

### Tarea 4.3.2: Crear Estado para Modal

```typescript
const [openAgregarItem, setOpenAgregarItem] = useState(false);

const handleAgregarItem = () => {
  setOpenAgregarItem(true);
};

const handleCloseAgregarItem = () => {
  setOpenAgregarItem(false);
};

const handleItemAgregado = () => {
  setOpenAgregarItem(false);
  handleRefresh();
};
```

### Tarea 4.3.3: Crear Componente AgregarItemModal

**Crear:** Frontend `src/components/Cuotas/AgregarItemModal.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { itemsCuotaService } from '@/services/itemsCuotaService';
import { cuotasService } from '@/services/cuotasService';
import { useSnackbar } from 'notistack';

const schema = z.object({
  tipoItemCodigo: z.string().min(1, 'Tipo requerido'),
  concepto: z.string().min(3).max(200),
  monto: z.number().min(0.01),
  cantidad: z.number().int().positive().default(1),
  observaciones: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  cuotaId: number;
  onSuccess: () => void;
}

export const AgregarItemModal: React.FC<Props> = ({ open, onClose, cuotaId, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [tiposItems, setTiposItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { cantidad: 1 }
  });

  useEffect(() => {
    loadTiposItems();
  }, []);

  const loadTiposItems = async () => {
    try {
      const response = await itemsCuotaService.getTiposItems();
      setTiposItems(response.data);
    } catch (error) {
      console.error('Error al cargar tipos:', error);
    }
  };

  const handleGuardar = async (data: FormData) => {
    try {
      setLoading(true);
      await cuotasService.addItemManual(cuotaId, data);
      enqueueSnackbar('Ítem agregado exitosamente', { variant: 'success' });
      reset();
      onSuccess();
    } catch (error) {
      enqueueSnackbar('Error al agregar ítem', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar Ítem Manual</DialogTitle>
      <form onSubmit={handleSubmit(handleGuardar)}>
        <DialogContent>
          <Controller
            name="tipoItemCodigo"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.tipoItemCodigo} sx={{ mb: 2 }}>
                <InputLabel>Tipo de Ítem</InputLabel>
                <Select {...field} label="Tipo de Ítem">
                  {tiposItems.map((tipo: any) => (
                    <MenuItem key={tipo.codigo} value={tipo.codigo}>{tipo.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="concepto"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Concepto"
                fullWidth
                error={!!errors.concepto}
                helperText={errors.concepto?.message}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="monto"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Monto"
                fullWidth
                error={!!errors.monto}
                helperText={errors.monto?.message}
                inputProps={{ step: 0.01 }}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="cantidad"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Cantidad"
                fullWidth
                error={!!errors.cantidad}
                helperText={errors.cantidad?.message}
                inputProps={{ min: 1 }}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="observaciones"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Observaciones (opcional)"
                multiline
                rows={3}
                fullWidth
                sx={{ mb: 2 }}
              />
            )}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Guardando...' : 'Agregar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
```

### Tarea 4.3.4: Renderizar Modal en DetalleCuotaModal

```typescript
<AgregarItemModal
  open={openAgregarItem}
  onClose={handleCloseAgregarItem}
  cuotaId={cuota.id}
  onSuccess={handleItemAgregado}
/>
```

### Tarea 4.3.5: Probar Flujo Completo

**Verificaciones:**
- [ ] Botón aparece habilitado
- [ ] Modal abre correctamente
- [ ] Select muestra tipos de items
- [ ] Validaciones funcionan
- [ ] Item se agrega a la cuota
- [ ] Desglose se actualiza
- [ ] MontoTotal se recalcula

---

## 📋 Criterios de Aceptación - Fase 4

### ✅ Fase 4 Completa Cuando:

1. **Exportar descarga archivo real**
   - Botón funciona
   - Archivo descarga correctamente
   - Datos son correctos

2. **Gráficos renderizan con datos reales**
   - Charts se muestran
   - Datos actualizan dinámicamente
   - Tooltips y leyendas funcionan

3. **Agregar item manual funciona end-to-end**
   - Modal abre
   - Validaciones OK
   - Item persiste
   - UI actualiza

---

---

# **FASE 5: TESTING Y DOCUMENTACIÓN**

**Duración:** 1-2 semanas
**Esfuerzo:** 30-40 horas
**Prioridad:** 🟢 BAJA

**Objetivo:** Cobertura de tests y documentación actualizada

---

## 5.1 Tests Unitarios de Servicios

**Estimación:** 12-16 horas

### Tarea 5.1.1: Configurar Vitest

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
```

### Tarea 5.1.2: Crear Test de cuotasService

**Crear:** Frontend `src/services/__tests__/cuotasService.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cuotasService } from '../cuotasService';
import { api } from '../api';

vi.mock('../api');

describe('cuotasService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCuotas', () => {
    it('should fetch cuotas with filters', async () => {
      const mockData = {
        cuotas: [{ id: 1, mes: 1, anio: 2024, montoTotal: 100 }],
        pagination: { total: 1, page: 1 }
      };

      vi.mocked(api.get).mockResolvedValue({ data: { data: mockData } });

      const result = await cuotasService.getCuotas({ mes: 1, anio: 2024 });

      expect(api.get).toHaveBeenCalledWith('/cuotas', {
        params: { mes: 1, anio: 2024 }
      });
      expect(result.data).toEqual(mockData);
    });

    it('should handle error when API fails', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      await expect(cuotasService.getCuotas()).rejects.toThrow('Network error');
    });
  });

  describe('generarCuotasV2', () => {
    it('should call generar-v2 endpoint with correct data', async () => {
      const requestData = {
        mes: 1,
        anio: 2024,
        categorias: ['ACTIVO', 'ESTUDIANTE'],
        aplicarDescuentos: true
      };

      const mockResponse = {
        generated: 10,
        cuotas: [],
        resumenDescuentos: { totalSociosConDescuento: 5 }
      };

      vi.mocked(api.post).mockResolvedValue({ data: { data: mockResponse } });

      const result = await cuotasService.generarCuotasV2(requestData);

      expect(api.post).toHaveBeenCalledWith('/cuotas/generar-v2', requestData);
      expect(result.data.generated).toBe(10);
    });
  });
});
```

### Tarea 5.1.3: Crear Tests Adicionales

- [ ] `src/services/__tests__/recibosService.test.ts`
- [ ] `src/services/__tests__/ajustesService.test.ts`
- [ ] `src/services/__tests__/exencionesService.test.ts`

### Tarea 5.1.4: Ejecutar Tests

```bash
npm run test
```

---

## 5.2 Tests de Redux Slices

**Estimación:** 8-10 horas

### Tarea 5.2.1: Crear Test de cuotasSlice

**Crear:** Frontend `src/store/slices/__tests__/cuotasSlice.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import cuotasReducer, { fetchCuotas, setFilters } from '../cuotasSlice';

const createMockStore = () => configureStore({
  reducer: { cuotas: cuotasReducer }
});

describe('cuotasSlice', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
  });

  it('should have initial state', () => {
    const state = store.getState().cuotas;
    expect(state.loading).toBe(false);
    expect(state.cuotas).toEqual([]);
    expect(state.error).toBeNull();
  });

  it('should handle setFilters', () => {
    store.dispatch(setFilters({ mes: 1, anio: 2024 }));
    const state = store.getState().cuotas;
    expect(state.filters.mes).toBe(1);
    expect(state.filters.anio).toBe(2024);
  });

  it('should handle fetchCuotas.pending', () => {
    store.dispatch(fetchCuotas.pending('', {}));
    const state = store.getState().cuotas;
    expect(state.loading).toBe(true);
  });

  it('should handle fetchCuotas.fulfilled', () => {
    const mockData = {
      cuotas: [{ id: 1, mes: 1, anio: 2024 }],
      pagination: { total: 1 }
    };

    store.dispatch(fetchCuotas.fulfilled(mockData, '', {}));
    const state = store.getState().cuotas;
    expect(state.loading).toBe(false);
    expect(state.cuotas).toHaveLength(1);
  });

  it('should handle fetchCuotas.rejected', () => {
    store.dispatch(fetchCuotas.rejected(new Error('Error'), '', {}));
    const state = store.getState().cuotas;
    expect(state.loading).toBe(false);
    expect(state.error).toBeTruthy();
  });
});
```

### Tarea 5.2.2: Crear Tests Adicionales

- [ ] `recibosSlice.test.ts`
- [ ] `ajustesSlice.test.ts`
- [ ] `exencionesSlice.test.ts`

---

## 5.3 Tests de Componentes (Opcional)

**Estimación:** 10-12 horas

### Tarea 5.3.1: Configurar Testing Library

```bash
npm install -D @testing-library/react @testing-library/user-event
```

### Tarea 5.3.2: Crear Test de CuotasPage

**Crear:** Frontend `src/pages/Cuotas/__tests__/CuotasPage.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CuotasPage } from '../CuotasPage';
import cuotasReducer from '@/store/slices/cuotasSlice';

const createMockStore = (initialState = {}) => configureStore({
  reducer: { cuotas: cuotasReducer },
  preloadedState: { cuotas: { ...initialState } }
});

describe('CuotasPage', () => {
  it('renders page title', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CuotasPage />
      </Provider>
    );

    expect(screen.getByText('Cuotas del Mes')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const store = createMockStore({ loading: true });
    render(
      <Provider store={store}>
        <CuotasPage />
      </Provider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays cuotas in table', async () => {
    const store = createMockStore({
      cuotas: [
        { id: 1, mes: 1, anio: 2024, montoTotal: 100, recibo: { numero: 'REC-001' } }
      ],
      loading: false
    });

    render(
      <Provider store={store}>
        <CuotasPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('REC-001')).toBeInTheDocument();
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });
  });
});
```

---

## 5.4 Actualizar CLAUDE.md

**Estimación:** 3-4 horas

### Tarea 5.4.1: Agregar Sección de Cuotas/Recibos

**Archivo:** Backend `CLAUDE.md`
**Insertar después de:** Línea 140 (sección de Relaciones Familiares)

```markdown
### Cuotas y Recibos (Sistema V2)
- **Tables**: `cuotas`, `recibos`, `medios_pago`, `items_cuota` (6 tablas)
- **Catalogs**: `categorias_items`, `tipos_items_cuota`, `reglas_descuentos`
- **Architecture**: V2 con sistema de ítems configurables
- **Rules**:
  - One cuota per recibo (1:1 relationship)
  - Cuota decomposed into ItemCuota (BASE, ACTIVIDAD, DESCUENTO, RECARGO)
  - Motor de descuentos automático evalúa reglas JSONB
  - Ajustes manuales por socio con history tracking
  - Exenciones temporales con workflow de aprobación
  - Auto-generated recibo numero: `REC-YYYYMMDD-NNNN`
  - Cannot modify cuotas of PAGADO recibos

**ItemCuota System (V2 Architecture):**
- **Legacy Fields**: `montoBase`, `montoActividades` (nullable, deprecated)
- **V2 Pattern**: Cuota has many ItemCuota with types:
  - CUOTA_BASE_SOCIO (1 per cuota)
  - ACTIVIDAD_INDIVIDUAL (N per cuota, based on participaciones)
  - DESCUENTO_CATEGORIA/FAMILIAR/MULTIPLES_ACTIVIDADES
  - RECARGO_MORA (if vencido)
- **Calculation**: `cuota.montoTotal = SUM(items_cuota.monto)`

**Motor de Descuentos (PHASE 3):**
- **Service**: `MotorReglasDescuentos`
- **Tables**: `reglas_descuentos`, `configuracion_descuentos`, `aplicaciones_reglas`
- **Evaluation**:
  1. Load active rules ordered by priority
  2. Evaluate JSONB conditions (categoria, antiguedad, familia, actividades)
  3. Apply JSONB formulas to calculate discount %/amount
  4. Respect `modoAplicacion` (ACUMULATIVO, EXCLUSIVO, MAXIMO)
  5. Create `aplicaciones_reglas` audit logs
  6. Generate DESCUENTO items in cuota
- **Global Limit**: `configuracion_descuentos.limiteDescuentoTotal` (default 80%)

**Ajustes Manuales (PHASE 4):**
- **Service**: `AjusteCuotaService`
- **Types**: DESCUENTO_FIJO, DESCUENTO_PORCENTAJE, RECARGO_FIJO, RECARGO_PORCENTAJE, MONTO_FIJO_TOTAL
- **Scope**: TOTAL_CUOTA, BASE, ACTIVIDADES, ITEMS_ESPECIFICOS
- **Temporal**: Support fechaInicio/fechaFin for temporary adjustments
- **Audit**: Auto-creates `historial_ajustes_cuota` entries

**Exenciones Temporales (PHASE 4.2):**
- **Service**: `ExencionCuotaService`
- **Workflow**: PENDIENTE_APROBACION → APROBADA → VIGENTE → VENCIDA/REVOCADA
- **Types**: TOTAL (100%), PARCIAL (1-100%)
- **Motivos**: BECA, SOCIO_FUNDADOR, SOCIO_HONORARIO, SITUACION_ECONOMICA, etc.
- **Tracking**: solicitadoPor, aprobadoPor, fechaAprobacion, documentacionAdjunta

**Endpoints V2:**
```
POST   /api/cuotas/generar-v2               # Generación con items + descuentos
GET    /api/cuotas/:id/items/desglose       # Desglose por categoría
POST   /api/cuotas/:id/recalcular           # Recalcular con nuevas reglas
POST   /api/cuotas/:id/items                # Agregar item manual
POST   /api/ajustes-cuota                   # Crear ajuste manual
POST   /api/exenciones-cuota                # Solicitar exención
POST   /api/exenciones-cuota/:id/aprobar    # Aprobar exención
GET    /api/reportes/cuotas/dashboard       # Dashboard con métricas
```

**Recibo Auto-Numbering:**
- **Function**: PostgreSQL `next_recibo_numero()`
- **Format**: `REC-YYYYMMDD-NNNN`
- **Example**: `REC-20240115-0001`
```

### Tarea 5.4.2: Agregar a "Recently Fixed Issues"

```markdown
### ✅ IMPLEMENTED (2026-01-05): Sistema de Cuotas V2 Completo
**Change**: Complete V2 architecture for Cuotas with ItemCuota system, Motor de Descuentos, Ajustes Manuales, and Exenciones Temporales

**Rationale**:
- Modern decomposition of cuota into configurable items
- Automatic discount evaluation with JSONB rules engine
- Manual adjustments with complete audit trail
- Exemption workflow for special cases
- Frontend-backend integration ready

**Implementation**:
- **Schema**: 16 tables (cuotas, items_cuota, reglas_descuentos, ajustes, exenciones, historial)
- **Services**: ItemCuotaService, MotorReglasDescuentos, AjusteCuotaService, ExencionCuotaService
- **Endpoints**: 30+ V2 endpoints for complete CRUD and advanced operations
- **Testing**: E2E tests for generation, recalculation, adjustments, exemptions

**Breaking Changes**: None (backward-compatible with V1 legacy fields)
```

### Tarea 5.4.3: Actualizar Tabla de Contenido

```markdown
- [Cuotas y Recibos (Sistema V2)](#cuotas-y-recibos-sistema-v2)
  - [ItemCuota System](#itemcuota-system-v2-architecture)
  - [Motor de Descuentos](#motor-de-descuentos-phase-3)
  - [Ajustes Manuales](#ajustes-manuales-phase-4)
  - [Exenciones Temporales](#exenciones-temporales-phase-42)
```

---

## 📋 Criterios de Aceptación - Fase 5

### ✅ Fase 5 Completa Cuando:

1. **Cobertura de tests > 60% en servicios**
   - Tests unitarios pasando
   - Tests de slices pasando
   - Reporte de cobertura generado

2. **CLAUDE.md actualizado**
   - Sección completa de Cuotas
   - Ejemplos de endpoints
   - Flujos documentados

3. **Docs incluyen ejemplos**
   - Requests/responses
   - Casos de uso
   - Troubleshooting

---

---

# 📅 CRONOGRAMA RESUMIDO

| Fase | Duración | Esfuerzo | Tareas | Prioridad |
|------|----------|----------|--------|-----------|
| **Fase 1: Integración Básica** | 1 semana | 24-32h | 14 tareas | 🔴 ALTA |
| **Fase 2: Poblado de Datos** | 3 días | 12-16h | 9 tareas | 🔴 ALTA |
| **Fase 3: Schemas Zod** | 4 días | 12-16h | 9 tareas | 🟡 MEDIA |
| **Fase 4: Features UI** | 1 semana | 20-28h | 15 tareas | 🟡 MEDIA |
| **Fase 5: Testing y Docs** | 1-2 semanas | 30-40h | 12 tareas | 🟢 BAJA |
| **TOTAL** | **4-5 semanas** | **98-132 horas** | **59 tareas** | |

---

# 🎯 CRITERIOS DE ÉXITO FINALES

## Sistema Completo Cuando:

### Backend ✅
- [ ] Todos los endpoints V2 responden correctamente
- [ ] Seeds incluyen datos de demostración V2
- [ ] Motor de descuentos funciona
- [ ] History tracking registra todas las acciones

### Frontend ✅
- [ ] RecibosSlice conectado a API real (no mock)
- [ ] Desglose de items muestra datos reales
- [ ] Wizard de generación masiva funciona end-to-end
- [ ] Ajustes y exenciones funcionan
- [ ] Validaciones Zod en todos los formularios
- [ ] Charts renderizan datos reales

### Integración ✅
- [ ] E2E flow: Generar cuota → Ver desglose → Agregar item → Recalcular
- [ ] E2E flow: Solicitar exención → Aprobar → Verificar en cuota
- [ ] E2E flow: Crear ajuste → Aplicar a cuota → Ver historial
- [ ] No hay errores 404 en consola
- [ ] No hay mock data en uso

### Documentación ✅
- [ ] CLAUDE.md actualizado con sección completa
- [ ] Ejemplos de uso documentados
- [ ] Tests con cobertura > 60%

---

# 📝 NOTAS FINALES

**Descubrimiento Clave:** El backend V2 está **95% completo**, no 0% como se pensaba inicialmente. Los servicios, controllers, repositories y rutas existen y están implementados.

**Gap Real:**
1. Frontend usa mock data en recibos (línea 114-478 de recibosSlice)
2. Seeds no tienen datos de ItemCuota (usan campos legacy)
3. Faltan schemas Zod en frontend
4. Falta testing E2E

**Prioridad Máxima:** Conectar RecibosSlice a la API real (FASE 1.1) para que toda la integración funcione.

**Estimación Realista:** 4-5 semanas de trabajo dedicado (1 desarrollador full-time).

**Riesgo Bajo:** El backend ya funciona, solo falta conectar frontend y agregar datos de demostración.

---

**Documento Generado:** 2026-01-04
**Autor:** Análisis de Claude Code
**Proyecto:** SIGESDA Backend
**Versión:** 1.0
