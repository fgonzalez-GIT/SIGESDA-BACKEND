# Análisis de Refactoring - FASE 7 Task 7.3

**Fecha:** 2025-12-17
**Estado:** Análisis completado
**Archivos analizados:** cuota.service.ts (1445 líneas), motor-reglas-descuentos.service.ts (755 líneas), ajuste-cuota.service.ts (415 líneas)

---

## Resumen Ejecutivo

Se identificaron **7 categorías principales** de mejoras:
1. Código duplicado (15+ instancias)
2. Magic numbers (10+ constantes hardcodeadas)
3. Métodos largos (3 métodos >150 líneas)
4. Helpers faltantes (6 utilidades genéricas)
5. Validaciones repetidas (5+ validaciones)
6. Queries potencialmente optimizables
7. Oportunidades para patrones de diseño

**Impacto estimado:** Reducir ~300 líneas de código duplicado, mejorar mantenibilidad en 40%.

---

## 1. CÓDIGO DUPLICADO

### 1.1 Validación de Recibo Pagado (3 instancias)

**Ubicaciones:**
- `cuota.service.ts:123-126` - updateCuota()
- `cuota.service.ts:158-160` - deleteCuota()
- `cuota.service.ts:836-838` - recalcularCuota()

**Código duplicado:**
```typescript
if (cuota.recibo.estado === 'PAGADO') {
  throw new Error('No se puede [operación] una cuota de un recibo pagado');
}
```

**Solución:** Extraer a helper `validateReciboPagado(recibo, operacion)`

---

### 1.2 Validación de Fechas (2 instancias)

**Ubicaciones:**
- `ajuste-cuota.service.ts:50-52` - createAjuste()
- `ajuste-cuota.service.ts:119-121` - updateAjuste()

**Código duplicado:**
```typescript
if (data.fechaFin && data.fechaFin < data.fechaInicio) {
  throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
}
```

**Solución:** Extraer a helper `validateFechaRange(fechaInicio, fechaFin)`

---

### 1.3 Cálculo de Monto Base y Actividades (3 instancias)

**Ubicaciones:**
- `cuota.service.ts:849-861` - recalcularCuota()
- `cuota.service.ts:1209-1217` - previewRecalculo()
- `cuota.service.ts:1335-1344` - compararCuota()

**Código duplicado (~15 líneas cada uno):**
```typescript
const categoriaId = await this.getCategoriaIdByCodigo(cuota.categoria);
let montoBase = await this.cuotaRepository.getMontoBasePorCategoria(categoriaId);

const montoActividades = await this.calcularCostoActividades(
  cuota.recibo.receptorId.toString(),
  cuota.mes,
  cuota.anio
).then(result => result.total);

let subtotal = montoBase + montoActividades;
```

**Solución:** Extraer a método privado `calcularMontosCuota(cuota)`

---

### 1.4 Aplicación de Ajustes y Exenciones (3 instancias)

**Ubicaciones:**
- `cuota.service.ts:870-918` - recalcularCuota() (~49 líneas)
- `cuota.service.ts:1220-1263` - previewRecalculo() (~44 líneas)
- `cuota.service.ts:1347-1381` - compararCuota() (~35 líneas)

**Código duplicado (~40 líneas cada uno):**
```typescript
// Apply manual adjustments
const ajustesAplicados: any[] = [];
if (data.aplicarAjustes && this.ajusteService) {
  const fechaCuota = new Date(cuota.anio, cuota.mes - 1, 1);
  const ajustes = await this.ajusteService.getAjustesActivosParaPeriodo(...);
  // ... más lógica
}

// Apply exemptions
const exencionesAplicadas: any[] = [];
if (data.aplicarExenciones && this.exencionService) {
  const fechaCuota = new Date(cuota.anio, cuota.mes - 1, 1);
  // ... más lógica
}
```

**Solución:** Extraer a método privado `aplicarAjustesYExenciones(cuota, opciones)`

---

### 1.5 Obtención de Categoría (2 métodos helper)

**Ubicaciones:**
- `cuota.service.ts:1422-1432` - getCategoriaIdByCodigo()
- `cuota.service.ts:1434-1444` - getCategoriaCodigoByCategoriaId()

**Solución:** Mover a `src/utils/categoria.helper.ts` o `categoria.repository.ts`

---

### 1.6 Helpers de Fechas (2 instancias)

**Ubicaciones:**
- `motor-reglas-descuentos.service.ts:743-750`

```typescript
private calcularMesesEntreFechas(fecha1: Date, fecha2: Date): number {
  const diff = fecha2.getTime() - fecha1.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
}

private calcularAniosEntreFechas(fecha1: Date, fecha2: Date): number {
  const diff = fecha2.getTime() - fecha1.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
}
```

**Problemas:**
- Magic numbers (30, 365)
- No considera meses con diferente número de días
- Debería usar librería date-fns

**Solución:** Crear `src/utils/date.helper.ts` con funciones correctas

---

### 1.7 Nombre de Meses (1 instancia)

**Ubicación:**
- `cuota.service.ts:499-505` - getNombreMes()

**Solución:** Mover a `src/utils/date.helper.ts`

---

## 2. MAGIC NUMBERS

### 2.1 Descuentos Hardcodeados

**Ubicaciones:**
- `cuota.service.ts:469` - `0.4` (40% descuento estudiante)
- `cuota.service.ts:481` - `0.25` (25% descuento jubilado)

**Problema:** Descuentos hardcodeados que deberían venir del motor de reglas

**Solución:**
```typescript
// src/constants/descuentos.constants.ts
export const DESCUENTO_ESTUDIANTE = 0.40;
export const DESCUENTO_JUBILADO = 0.25;
```

---

### 2.2 Día de Vencimiento

**Ubicación:**
- `cuota.service.ts:495` - `15` (día de vencimiento)

**Solución:**
```typescript
// src/constants/cuota.constants.ts
export const DIA_VENCIMIENTO_CUOTA = 15;
```

---

### 2.3 Límites de Descuento

**Ubicación:**
- `motor-reglas-descuentos.service.ts:513` - `15` (máximo años antigüedad)

**Solución:**
```typescript
// src/constants/descuentos.constants.ts
export const MAX_ANIOS_ANTIGUEDAD_DESCUENTO = 15;
export const PORCENTAJE_DESCUENTO_POR_ANIO = 1;
```

---

### 2.4 Cálculos de Tiempo

**Ubicaciones:**
- `motor-reglas-descuentos.service.ts:745` - `30` (días por mes)
- `motor-reglas-descuentos.service.ts:750` - `365` (días por año)

**Problema:** Imprecisos, no consideran meses con diferente cantidad de días

**Solución:** Usar date-fns en lugar de magic numbers

---

## 3. MÉTODOS LARGOS (>100 líneas)

### 3.1 generarCuotasConItems() - 282 líneas

**Ubicación:** `cuota.service.ts:521-802`

**Problemas:**
- Demasiadas responsabilidades
- Difícil de testear
- Difícil de mantener

**Solución:** Extraer sub-métodos:
```typescript
private async crearReciboCuota(socio, mes, anio, observaciones): Promise<Recibo>
private async crearItemsBaseCuota(cuota, socio, tipoCuotaBase): Promise<number>
private async crearItemsActividades(cuota, socio, tipoActividad): Promise<number>
private async aplicarDescuentosMotor(cuota, socio, mes, anio, tx): Promise<ResultadoDescuentos>
private async recalcularTotalesCuota(cuotaId, tx): Promise<void>
```

---

### 3.2 recalcularCuota() - 216 líneas

**Ubicación:** `cuota.service.ts:818-1033`

**Solución:** Ya identificado en sección 1.3 y 1.4, extraer:
- `calcularMontosCuota()`
- `aplicarAjustesYExenciones()`
- `actualizarCuotaYRecibo()`
- `crearHistorialRecalculo()`

---

### 3.3 previewRecalculo() - 152 líneas

**Ubicación:** `cuota.service.ts:1152-1303`

**Solución:** Reutilizar métodos extraídos de recalcularCuota()

---

## 4. HELPERS FALTANTES

### 4.1 src/utils/date.helper.ts

**Funciones necesarias:**
```typescript
export function getNombreMes(mes: number): string;
export function calcularMesesEntreFechas(fecha1: Date, fecha2: Date): number;
export function calcularAniosEntreFechas(fecha1: Date, fecha2: Date): number;
export function calcularFechaVencimiento(mes: number, anio: number, dia?: number): Date;
export function esFechaFutura(fecha: Date): boolean;
export function esFechaPasada(fecha: Date): boolean;
```

---

### 4.2 src/utils/categoria.helper.ts

**Funciones necesarias:**
```typescript
export async function getCategoriaIdByCodigo(codigo: string, prisma?: PrismaClient): Promise<number>;
export async function getCategoriaCodigoByCategoriaId(id: number, prisma?: PrismaClient): Promise<string>;
export async function getMontoCuotaPorCategoria(categoriaId: number, prisma?: PrismaClient): Promise<number>;
```

---

### 4.3 src/utils/validation.helper.ts

**Funciones necesarias:**
```typescript
export function validateFechaRange(fechaInicio: Date, fechaFin?: Date | null): void;
export function validatePorcentaje(valor: number, min?: number, max?: number): void;
export function validateMontoPositivo(monto: number): void;
```

---

### 4.4 src/utils/recibo.helper.ts

**Funciones necesarias:**
```typescript
export function validateReciboPagado(recibo: Recibo, operacion: string): void;
export function validateReciboEditable(recibo: Recibo): void;
export function canDeleteRecibo(recibo: Recibo): { canDelete: boolean; reason?: string };
```

---

## 5. VALIDACIONES REPETIDAS

### 5.1 Validación de Persona Activa

**Ubicaciones:**
- Múltiples services

**Solución:**
```typescript
// Ya existe en persona.helper.ts
import { isPersonaActiva } from '@/utils/persona.helper';
```

---

### 5.2 Validación de Porcentaje

**Ubicaciones:**
- `ajuste-cuota.service.ts:55-59`
- `ajuste-cuota.service.ts:127-131`

**Solución:**
```typescript
// src/utils/validation.helper.ts
export function validatePorcentaje(valor: number, max = 100, min = 0): void {
  if (valor < min || valor > max) {
    throw new Error(`El porcentaje debe estar entre ${min}% y ${max}%`);
  }
}
```

---

## 6. QUERIES N+1 POTENCIALES

### 6.1 generarCuotasConItems() Loop

**Ubicación:** `cuota.service.ts:581-775`

**Problema:** Loop que procesa socios uno por uno

```typescript
for (const socio of sociosPorGenerar) {
  await this.prisma.$transaction(async (tx) => {
    // ... múltiples queries dentro de transaction
  });
}
```

**Impacto:** Para 100 socios, ejecuta 100 transacciones secuenciales

**Solución potencial:**
- Batch processing (procesar en lotes de 10-20)
- Paralelización con `Promise.all()` si no hay dependencias

**Nota:** Mantener transacciones individuales por socio para integridad de datos

---

### 6.2 Evaluación de Condiciones en Motor de Reglas

**Ubicación:** `motor-reglas-descuentos.service.ts:122-134`

**Problema:** Loop que evalúa cada regla con queries separadas

```typescript
for (const regla of reglas) {
  const cumpleCondiciones = await this.evaluarCondiciones(regla, personaId);
  // ... más queries
}
```

**Solución:** Pre-cargar datos del socio una sola vez:
```typescript
const datosSocio = await this.cargarDatosSocioCompletos(personaId);
for (const regla of reglas) {
  const cumple = this.evaluarCondicionesLocal(regla, datosSocio);
}
```

---

## 7. PATRONES DE DISEÑO A APLICAR

### 7.1 Strategy Pattern - Tipos de Ajuste

**Problema actual:** Switch statement en `calcularAjuste()`

**Ubicación:** `ajuste-cuota.service.ts:322-366`

**Solución:**
```typescript
// src/strategies/ajuste.strategy.ts
interface AjusteStrategy {
  calcular(valor: number, montoOriginal: number): number;
}

class DescuentoFijoStrategy implements AjusteStrategy {
  calcular(valor: number, montoOriginal: number): number {
    return -Math.min(valor, montoOriginal);
  }
}

class DescuentoPorcentajeStrategy implements AjusteStrategy {
  calcular(valor: number, montoOriginal: number): number {
    return -((montoOriginal * valor) / 100);
  }
}

// ... más strategies

class AjusteCalculator {
  private strategies: Map<TipoAjusteCuota, AjusteStrategy>;

  constructor() {
    this.strategies = new Map([
      ['DESCUENTO_FIJO', new DescuentoFijoStrategy()],
      ['DESCUENTO_PORCENTAJE', new DescuentoPorcentajeStrategy()],
      // ...
    ]);
  }

  calcular(tipo: TipoAjusteCuota, valor: number, monto: number): number {
    const strategy = this.strategies.get(tipo);
    if (!strategy) throw new Error(`Tipo de ajuste desconocido: ${tipo}`);
    return strategy.calcular(valor, monto);
  }
}
```

**Beneficios:**
- Elimina switch statement
- Fácil agregar nuevos tipos de ajuste
- Testeable unitariamente

---

### 7.2 Factory Pattern - Creación de Items de Cuota

**Problema actual:** Lógica de creación de items dispersa

**Ubicaciones:**
- `cuota.service.ts:622-637` - Item base
- `cuota.service.ts:662-678` - Item actividad
- `motor-reglas-descuentos.service.ts:708-718` - Item descuento

**Solución:**
```typescript
// src/factories/item-cuota.factory.ts
export class ItemCuotaFactory {
  static crearItemBase(cuotaId: number, socio: any, tipoItem: TipoItemCuota): ItemCuotaCreado {
    return {
      cuotaId,
      tipoItemId: tipoItem.id,
      concepto: `Cuota base ${socio.categoria}`,
      monto: socio.categoriaSocio?.montoCuota || 0,
      cantidad: 1,
      esAutomatico: true,
      esEditable: false,
      metadata: {
        categoriaId: socio.categoriaId,
        categoriaCodigo: socio.categoria
      }
    };
  }

  static crearItemActividad(cuotaId: number, participacion: any, tipoItem: TipoItemCuota): ItemCuotaCreado {
    // ...
  }

  static crearItemDescuento(cuotaId: number, descuento: DescuentoResuelto, tipoItem: TipoItemCuota): ItemCuotaCreado {
    // ...
  }
}
```

---

### 7.3 Builder Pattern - Construcción de Cuotas

**Problema actual:** Lógica compleja de construcción en `generarCuotasConItems()`

**Solución:**
```typescript
// src/builders/cuota.builder.ts
export class CuotaBuilder {
  private recibo?: Recibo;
  private cuota?: Cuota;
  private itemsBase: ItemCuota[] = [];
  private itemsActividades: ItemCuota[] = [];
  private itemsDescuentos: ItemCuota[] = [];

  async crearRecibo(socio: any, periodo: { mes: number; anio: number }): Promise<this> {
    this.recibo = await this.reciboRepository.create({...});
    return this;
  }

  async crearCuota(): Promise<this> {
    if (!this.recibo) throw new Error('Debe crear recibo primero');
    this.cuota = await this.cuotaRepository.create({...});
    return this;
  }

  async agregarItemBase(socio: any): Promise<this> {
    const item = await ItemCuotaFactory.crearItemBase(...);
    this.itemsBase.push(item);
    return this;
  }

  async agregarActividades(socio: any): Promise<this> {
    // ...
    return this;
  }

  async aplicarDescuentos(socio: any): Promise<this> {
    // ...
    return this;
  }

  async build(): Promise<CuotaCompleta> {
    await this.recalcularTotales();
    return {
      recibo: this.recibo,
      cuota: this.cuota,
      items: [...this.itemsBase, ...this.itemsActividades, ...this.itemsDescuentos]
    };
  }
}

// Uso:
const cuota = await new CuotaBuilder()
  .crearRecibo(socio, { mes, anio })
  .crearCuota()
  .agregarItemBase(socio)
  .agregarActividades(socio)
  .aplicarDescuentos(socio)
  .build();
```

---

## 8. MEJORAS DE ARQUITECTURA

### 8.1 Eliminar Método Legacy calcularDescuentos()

**Ubicación:** `cuota.service.ts:451-491`

**Problema:** Descuentos hardcodeados duplican funcionalidad del MotorReglasDescuentos

**Solución:** Eliminar método y usar exclusivamente MotorReglasDescuentos

---

### 8.2 Separar Lógica de Cálculo de Lógica de Persistencia

**Problema:** Services mezclan cálculo y persistencia

**Solución:** Extraer calculadores puros:
```typescript
// src/calculators/cuota.calculator.ts
export class CuotaCalculator {
  static calcularMontoBase(categoria: CategoriaSocio): number { ... }
  static calcularMontoActividades(participaciones: Participacion[]): number { ... }
  static calcularTotal(items: ItemCuota[]): number { ... }
}
```

---

## 9. PLAN DE IMPLEMENTACIÓN

### Fase 1: Helpers Comunes (30 min)
- [ ] Crear `src/utils/date.helper.ts`
- [ ] Crear `src/utils/categoria.helper.ts`
- [ ] Crear `src/utils/validation.helper.ts`
- [ ] Crear `src/utils/recibo.helper.ts`
- [ ] Crear `src/constants/cuota.constants.ts`
- [ ] Crear `src/constants/descuentos.constants.ts`

### Fase 2: Eliminar Código Duplicado (45 min)
- [ ] Refactorizar validaciones en cuota.service.ts
- [ ] Refactorizar cálculos duplicados (montos, ajustes, exenciones)
- [ ] Extraer métodos privados largos

### Fase 3: Aplicar Patrones (45 min)
- [ ] Implementar Strategy Pattern para ajustes
- [ ] Implementar Factory Pattern para items
- [ ] (Opcional) Implementar Builder Pattern para cuotas

### Fase 4: Testing y Validación (30 min)
- [ ] Ejecutar tests existentes
- [ ] Validar que no se rompió funcionalidad
- [ ] Revisar imports y dependencies

---

## 10. MÉTRICAS ESPERADAS

### Antes del Refactoring:
- **Líneas de código duplicadas:** ~300 líneas
- **Métodos >100 líneas:** 3 métodos
- **Magic numbers:** 10+ constantes hardcodeadas
- **Code smells:** ~25 (según documentación)
- **Duplicación:** ~12%

### Después del Refactoring:
- **Líneas de código duplicadas:** ~50 líneas (reducción 83%)
- **Métodos >100 líneas:** 1 método (reducción 67%)
- **Magic numbers:** 0 (todos en constantes)
- **Code smells:** <10 (reducción 60%)
- **Duplicación:** <5% (reducción 58%)

---

## 11. RIESGOS Y MITIGACIÓN

### Riesgo 1: Romper funcionalidad existente
**Mitigación:** Ejecutar suite completa de tests (202 tests) después de cada cambio

### Riesgo 2: Cambios en interfaces públicas
**Mitigación:** Mantener interfaces públicas, solo refactorizar lógica interna

### Riesgo 3: Performance degradation
**Mitigación:** Benchmarking antes/después de cambios críticos

---

## 12. NOTAS FINALES

- Priorizar mejoras con mayor impacto (helpers, código duplicado)
- Mantener backward compatibility
- Documentar cambios en CHANGELOG
- Actualizar tests si es necesario
- Considerar crear PR separado para cada fase

**Análisis completado por:** Claude Code (Sonnet 4.5)
**Próximo paso:** Implementar Fase 1 - Helpers Comunes
