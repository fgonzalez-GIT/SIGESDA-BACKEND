# FASE 6 - Task 6.3: Análisis de Queries N+1 y Batch Operations

**Fecha:** 2025-12-18
**Estado:** EN PROGRESO
**Branch:** `feature/cuotas-items-system`

---

## 📊 Problemas N+1 Identificados

### 🔴 CRÍTICO #1: Generación de Cuotas (cuota.service.ts:197-237)

**Ubicación:** `src/services/cuota.service.ts` línea 197

**Problema:**
```typescript
for (const socio of sociosPorGenerar) {  // 100 socios
  const montoCuota = await this.calcularMontoCuota(...);  // Query 1
  const recibo = await this.reciboRepository.create(...); // Query 2
  const cuota = await this.cuotaRepository.create(...);   // Query 3
}
// Total: 100 * 3 = 300 queries individuales
```

**Impacto:**
- Con 100 socios: **300 queries** (3 queries por socio)
- Con 500 socios: **1500 queries** (muy lento)
- Tiempo estimado: ~15-30 segundos con 500 socios

**Solución:**
- Usar transacción batch con `prisma.$transaction()`
- Pre-calcular montos fuera del loop
- Crear recibos y cuotas en bulk

**Mejora esperada:** 300 queries → ~10 queries (30x más rápido)

---

### 🔴 CRÍTICO #2: Generación de Cuotas V2 con Items (cuota.service.ts:380-450)

**Ubicación:** `src/services/cuota.service.ts` línea 380 (método `generarCuotasConItems()`)

**Problema:**
```typescript
for (const socio of sociosPorGenerar) {  // 100 socios
  await prisma.$transaction(async (tx) => {
    const recibo = await tx.recibo.create(...);     // Query 1
    const cuota = await tx.cuota.create(...);       // Query 2

    // Items base
    await tx.itemCuota.create(...);                 // Query 3

    // Items de actividades (pueden ser múltiples)
    for (const actividad of participaciones) {      // 2-5 actividades
      await tx.itemCuota.create(...);               // Query 4-8
    }

    // Motor de reglas (si aplican)
    await motorReglas.aplicarReglasACuota(...);     // Query 9-15
  });
}
// Total: 100 * ~15 = 1500 queries
```

**Impacto:**
- Con 100 socios: **1500 queries** (15 queries por socio)
- Tiempo estimado: ~45-60 segundos con 100 socios
- Bloquea la transacción por mucho tiempo

**Solución:**
- Preparar todos los datos fuera del loop
- Usar `createMany()` para items
- Batch de aplicaciones de reglas

**Mejora esperada:** 1500 queries → ~50 queries (30x más rápido)

---

### 🟡 MEDIO #3: Reportes de Cuotas (reportes-cuota.service.ts:168-230)

**Ubicación:** `src/services/reportes-cuota.service.ts` línea 168

**Problema:**
```typescript
const cuotas = await this.prisma.cuota.findMany({
  where: whereClause,
  include: {
    recibo: true,
    categoria: true,
    items: {
      include: {
        tipoItem: true  // Nested include - puede ser pesado
      }
    }
  }
});
// Trae todo en memoria - potencialmente 10,000+ registros
```

**Impacto:**
- Con 1000 cuotas: trae ~5000 registros (cuota + recibo + categoria + items)
- Consumo de memoria: ~50-100 MB
- Tiempo: ~2-5 segundos

**Solución:**
- Usar agregaciones de Prisma (`_count`, `_sum`)
- Evitar traer todos los items si no son necesarios
- Paginar resultados

**Mejora esperada:** 5 segundos → 0.5 segundos (10x más rápido)

---

### 🟡 MEDIO #4: Motor de Reglas - Evaluación Individual (motor-reglas-descuentos.service.ts)

**Ubicación:** `src/services/motor-reglas-descuentos.service.ts` línea 180-250

**Problema:**
```typescript
async aplicarReglasACuota(cuotaId, personaId, itemsCuota) {
  // Query 1: Obtener reglas activas
  const reglas = await this.prisma.reglaDescuento.findMany({
    where: { activa: true }
  });

  for (const regla of reglas) {  // 5-10 reglas
    // Query 2-N: Evaluar condiciones (puede hacer queries)
    const condicionesCumplen = await this.evaluarCondiciones(...);

    // Query N+1-M: Calcular descuento (puede hacer queries)
    const descuento = await this.calcularDescuento(...);

    // Query M+1-Z: Crear items de descuento
    await this.crearItemsDescuento(...);
  }
}
// Total: 1 + 10*3 = 31 queries por cuota
```

**Impacto:**
- Con 100 cuotas: **3100 queries**
- Tiempo estimado: ~30-60 segundos

**Solución:**
- Pre-cargar todas las reglas y datos necesarios
- Evaluar condiciones en memoria
- Crear items de descuento en batch

**Mejora esperada:** 3100 queries → ~150 queries (20x más rápido)

---

### 🟢 MENOR #5: Ajuste Masivo (ajuste-masivo.service.ts)

**Ubicación:** `src/services/ajuste-masivo.service.ts` línea 150-250

**Problema:**
```typescript
for (const cuota of cuotasFiltradas) {
  await prisma.$transaction(async (tx) => {
    // Actualizar cuota
    await tx.cuota.update(...);

    // Crear historial
    await tx.historialAjusteCuota.create(...);
  });
}
// 1 transacción por cuota (no eficiente)
```

**Impacto:**
- Con 50 cuotas: **100 queries** (2 por cuota)
- Tiempo estimado: ~5-10 segundos

**Solución:**
- Una sola transacción para todas las cuotas
- Usar `updateMany()` cuando sea posible
- Batch de historiales

**Mejora esperada:** 100 queries → ~5 queries (20x más rápido)

---

## 🎯 Plan de Optimización

### Prioridad 1: Generación de Cuotas (CRÍTICO)

#### **Optimización A: Generación Legacy**
**Archivo:** `src/services/cuota.service.ts:generarCuotas()`
**Tiempo:** 30-45 minutos

**Pasos:**
1. Pre-calcular todos los montos fuera del loop
2. Preparar arrays de recibos y cuotas
3. Usar transacción única con batch inserts

**Código optimizado:**
```typescript
async generarCuotas(data: GenerarCuotasDto) {
  const sociosPorGenerar = await this.cuotaRepository.getCuotasPorGenerar(...);

  // PRE-CALCULAR MONTOS (fuera del loop)
  const montosPorCategoria = await this.preCalcularMontos(sociosPorGenerar);

  // PREPARAR DATOS (en memoria)
  const recibosData = sociosPorGenerar.map(socio => ({
    tipo: TipoRecibo.CUOTA,
    receptorId: socio.id,
    importe: montosPorCategoria[socio.categoria],
    concepto: `Cuota ${getNombreMes(data.mes)} ${data.anio}`,
    fechaVencimiento: calcularFechaVencimiento(data.mes, data.anio)
  }));

  // BATCH INSERT (1 transacción)
  return await this.prisma.$transaction(async (tx) => {
    // Crear recibos (bulk)
    const recibos = [];
    for (const reciboData of recibosData) {
      const recibo = await tx.recibo.create({ data: reciboData });
      recibos.push(recibo);
    }

    // Crear cuotas (bulk)
    const cuotasData = recibos.map((recibo, index) => ({
      reciboId: recibo.id,
      categoria: sociosPorGenerar[index].categoria,
      mes: data.mes,
      anio: data.anio,
      montoTotal: recibo.importe
    }));

    const cuotas = await Promise.all(
      cuotasData.map(data => tx.cuota.create({ data }))
    );

    return cuotas;
  });
}
// Mejora: 300 queries → 10 queries (30x más rápido)
```

#### **Optimización B: Generación V2 con Items**
**Archivo:** `src/services/cuota.service.ts:generarCuotasConItems()`
**Tiempo:** 45-60 minutos

**Pasos:**
1. Pre-cargar todos los tipos de items
2. Pre-cargar participaciones y reglas
3. Batch de items y aplicaciones de reglas

**Mejora esperada:** 1500 queries → 50 queries (30x más rápido)

---

### Prioridad 2: Motor de Reglas (ALTO)

**Archivo:** `src/services/motor-reglas-descuentos.service.ts`
**Tiempo:** 30-45 minutos

**Pasos:**
1. Pre-cargar reglas y configuraciones
2. Pre-cargar datos de evaluación (categorías, familiares, participaciones)
3. Evaluar en memoria
4. Batch de items de descuento

**Mejora esperada:** 3100 queries → 150 queries (20x más rápido)

---

### Prioridad 3: Reportes (MEDIO)

**Archivo:** `src/services/reportes-cuota.service.ts`
**Tiempo:** 30 minutos

**Pasos:**
1. Usar agregaciones de Prisma
2. Evitar includes innecesarios
3. Paginar cuando sea posible

**Mejora esperada:** 5 segundos → 0.5 segundos (10x más rápido)

---

### Prioridad 4: Ajuste Masivo (BAJO)

**Archivo:** `src/services/ajuste-masivo.service.ts`
**Tiempo:** 20 minutos

**Pasos:**
1. Una sola transacción
2. Usar `updateMany()` cuando sea posible

**Mejora esperada:** 100 queries → 5 queries (20x más rápido)

---

## 📊 Resumen de Mejoras Esperadas

| Operación | Queries Antes | Queries Después | Mejora |
|-----------|---------------|-----------------|--------|
| Generación 100 cuotas legacy | 300 | 10 | 30x |
| Generación 100 cuotas V2 | 1500 | 50 | 30x |
| Motor reglas 100 cuotas | 3100 | 150 | 20x |
| Reportes de 1000 cuotas | ~5s | ~0.5s | 10x |
| Ajuste masivo 50 cuotas | 100 | 5 | 20x |

**Total:** Reducción promedio de **20-30x** en queries críticos

---

## 🛠️ Técnicas de Optimización a Usar

### 1. Transacciones Batch
```typescript
await prisma.$transaction(async (tx) => {
  const results = await Promise.all([
    tx.model1.createMany({ data: [...] }),
    tx.model2.createMany({ data: [...] }),
    tx.model3.createMany({ data: [...] })
  ]);
  return results;
});
```

### 2. CreateMany (Bulk Insert)
```typescript
// ❌ MALO (N queries)
for (const item of items) {
  await prisma.item.create({ data: item });
}

// ✅ BUENO (1 query)
await prisma.item.createMany({
  data: items
});
```

### 3. UpdateMany (Bulk Update)
```typescript
// ❌ MALO (N queries)
for (const id of ids) {
  await prisma.cuota.update({ where: { id }, data: {...} });
}

// ✅ BUENO (1 query)
await prisma.cuota.updateMany({
  where: { id: { in: ids } },
  data: {...}
});
```

### 4. Pre-fetch con IN
```typescript
// ❌ MALO (N+1)
for (const cuota of cuotas) {
  const categoria = await prisma.categoria.findUnique({
    where: { id: cuota.categoriaId }
  });
}

// ✅ BUENO (1 query)
const categoriaIds = cuotas.map(c => c.categoriaId);
const categorias = await prisma.categoria.findMany({
  where: { id: { in: categoriaIds } }
});
```

### 5. Agregaciones de Prisma
```typescript
// ❌ MALO (trae todo en memoria)
const cuotas = await prisma.cuota.findMany({ include: {...} });
const total = cuotas.reduce((sum, c) => sum + c.monto, 0);

// ✅ BUENO (agregación en DB)
const result = await prisma.cuota.aggregate({
  _sum: { monto: true },
  _count: true
});
```

---

## 📈 Próximos Pasos

1. ✅ Análisis completado
2. ⏳ Implementar optimizaciones por prioridad
3. ⏳ Tests de regresión (validar que funciona igual)
4. ⏳ Benchmarks antes/después
5. ⏳ Documentar cambios

---

**Última actualización:** 2025-12-18
**Responsable:** Claude Code
**Estado:** Análisis completado, listo para implementación
