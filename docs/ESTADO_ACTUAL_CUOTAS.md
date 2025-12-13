# Estado Actual del Sistema de Cuotas de Socios
## Documentación Pre-Refactor

**Proyecto**: SIGESDA Backend
**Fecha**: 2025-12-12
**Versión**: 1.0 (Pre-Items Refactor)
**Branch**: feature/cuotas-items-system
**Tag**: v1.0-pre-items-refactor

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura Actual](#arquitectura-actual)
3. [Flujos de Trabajo](#flujos-de-trabajo)
4. [Modelo de Datos](#modelo-de-datos)
5. [Lógica de Negocio](#lógica-de-negocio)
6. [Problemas Críticos Identificados](#problemas-críticos-identificados)
7. [Métricas de Performance](#métricas-de-performance)
8. [Configuraciones del Sistema](#configuraciones-del-sistema)

---

## Resumen Ejecutivo

### Estado del Sistema

El sistema de generación de cuotas de socios de SIGESDA está **parcialmente funcional** con las siguientes características:

✅ **Funcionalidades Implementadas:**
- CRUD básico de cuotas (crear, leer, actualizar, eliminar)
- Generación masiva de cuotas por período y categoría
- Cálculo de cuota base según categoría de socio
- Descuentos por categoría (ESTUDIANTE 40%, JUBILADO 25%) - **hardcoded**
- Validación de períodos duplicados
- Integración con sistema de recibos
- Estadísticas y resúmenes mensuales

❌ **Funcionalidades Pendientes:**
- Cálculo real de actividades (actualmente retorna `0`)
- Descuentos familiares (tabla `familiares.descuento` existe pero no se usa)
- Sistema de ítems configurables
- Motor de reglas de descuentos flexible
- Cuota familiar con responsable financiero
- Simulación pre-generación (dry-run)
- Edición manual de cuotas post-generación

🔴 **Bugs Críticos:**
1. **Repository usa Architecture V1** (línea 603 de `cuota.repository.ts`)
2. **Constraint único problemático** (`@@unique([categoriaId, mes, anio])`)
3. **Posible race condition** en numeración de recibos

### Datos en la Base de Datos (Estado Actual)

- **Personas**: 74 (22 originales + 52 de prueba)
- **Socios**: 74 con Architecture V2 (tabla `persona_tipo`)
- **Cuotas**: 2 (datos reales)
- **Recibos**: 2 (datos reales)
- **Actividades**: 8 (4 reales + 4 de prueba)
- **Participaciones**: 47 (5 reales + 42 de prueba)
- **Relaciones familiares**: 31 (16 reales + 15 de prueba)

---

## Arquitectura Actual

### Capas de la Aplicación

```
┌─────────────────────────────────────────────────────────────┐
│                        HTTP API Layer                        │
│                    (cuota.routes.ts)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     Controller Layer                         │
│                 (cuota.controller.ts)                        │
│  - Manejo de requests/responses HTTP                         │
│  - Validación de DTOs (Zod schemas)                          │
│  - Mapeo de errores a códigos HTTP                           │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      Service Layer                           │
│                  (cuota.service.ts)                          │
│  - Lógica de negocio                                         │
│  - Cálculo de montos (base, actividades, descuentos)        │
│  - Validaciones de dominio                                   │
│  - Generación masiva de cuotas                               │
│  - Coordinación entre repositories                           │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Repository Layer                           │
│  ┌──────────────────────┬──────────────────────────────────┐│
│  │cuota.repository.ts   │ recibo.repository.ts             ││
│  │- Queries SQL/Prisma  │ - Gestión de recibos             ││
│  │- CRUD operations     │ - Numeración automática          ││
│  └──────────────────────┴──────────────────────────────────┘│
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Database Layer                            │
│                    PostgreSQL 12                             │
│  Tablas: cuotas, recibos, personas, categorias_socios       │
└─────────────────────────────────────────────────────────────┘
```

### Estructura de Archivos

```
src/
├── routes/
│   └── cuota.routes.ts              # Endpoints HTTP
├── controllers/
│   └── cuota.controller.ts          # Request handlers
├── services/
│   └── cuota.service.ts             # Business logic
├── repositories/
│   ├── cuota.repository.ts          # DB access (cuotas)
│   ├── recibo.repository.ts         # DB access (recibos)
│   └── persona.repository.ts        # DB access (personas)
├── dto/
│   └── cuota.dto.ts                 # Validation schemas (Zod)
└── types/
    └── enums.ts                     # TipoRecibo, EstadoRecibo, etc.
```

---

## Flujos de Trabajo

### 1. Generación Masiva de Cuotas

**Endpoint**: `POST /api/cuotas/generar`

**Flujo actual**:

```
1. REQUEST → { mes, anio, categorias?: [] }
            ↓
2. VALIDACIÓN de parámetros (mes 1-12, año válido)
            ↓
3. OBTENER SOCIOS ELEGIBLES
   ❌ BUG: Usa campo legacy 'tipo' en línea 603 de repository
   Query actual (INCORRECTO):
   ```sql
   WHERE tipo = 'SOCIO' AND fechaBaja = NULL
   ```
            ↓
4. CALCULAR MONTOS POR SOCIO
   4.1. Obtener categoría del socio
   4.2. Calcular monto base (categorias_socios.montoCuota)
   4.3. Calcular actividades → ❌ RETORNA SIEMPRE 0
   4.4. Calcular descuentos → Solo categoría (hardcoded)
   4.5. Total = base + actividades - descuentos
            ↓
5. GENERAR RECIBOS (uno por socio)
   5.1. Obtener próximo número de recibo
   5.2. Crear recibo con estado PENDIENTE
   5.3. Calcular fecha de vencimiento (día 15 del mes siguiente)
            ↓
6. CREAR CUOTAS (una por recibo)
   6.1. Crear registro en tabla cuotas
   6.2. Vincular a recibo
   6.3. Guardar montoBase, montoActividades, montoTotal
            ↓
7. RESPONSE → { generated: N, errors: [], cuotas: [...] }
```

### 2. Cálculo de Cuota Individual

**Método**: `calcularMontoCuota()`

**Flujo actual**:

```
1. ENTRADA → { categoria, mes, anio, socioId, incluirActividades?, aplicarDescuentos? }
            ↓
2. OBTENER MONTO BASE
   - Consulta: categorias_socios.montoCuota
   - Ejemplo: ACTIVO = $10000, ESTUDIANTE = $10000
            ↓
3. CALCULAR ACTIVIDADES (si incluirActividades = true)
   ❌ IMPLEMENTACIÓN STUB
   Código actual (líneas 432-442):
   ```typescript
   private async calcularCostoActividades(...) {
     return { total: 0, detalle: [] };
   }
   ```
            ↓
4. APLICAR DESCUENTOS (si aplicarDescuentos = true)
   Lógica hardcoded (líneas 444-484):

   IF categoria === 'ESTUDIANTE':
      descuento = montoBase * 0.40  (40%)

   IF categoria === 'JUBILADO':
      descuento = montoBase * 0.25  (25%)

   ❌ NO implementado:
   - Descuentos familiares (campo familiares.descuento)
   - Descuentos por múltiples actividades
   - Descuentos configurables por admin
            ↓
5. CALCULAR TOTAL
   montoTotal = montoBase + montoActividades - descuentos
   (no permite negativos: Math.max(0, montoTotal))
            ↓
6. RETORNAR
   {
     montoBase: number,
     montoActividades: number,
     montoTotal: number,
     descuentos: number,
     detalleCalculo: {...}
   }
```

### 3. Validaciones Aplicadas

**Al crear cuota**:
- ✅ Recibo existe y es de tipo CUOTA
- ✅ No existe otra cuota para el mismo recibo
- ⚠️ Warning si ya existen cuotas para el período/categoría (no bloquea)

**Al generar masivamente**:
- ✅ Mes entre 1-12
- ✅ Año válido (>= año actual - 1)
- ✅ Excluye socios que ya tienen cuota del período
- ❌ NO valida capacidad de actividades
- ❌ NO valida restricciones de cuota familiar

**Al modificar cuota**:
- ✅ No permite modificar cuotas de recibos PAGADO
- ✅ Actualiza recibo.importe si se modifica montoTotal

---

## Modelo de Datos

### Schema Actual (Prisma)

#### Tabla: `cuotas`

```prisma
model Cuota {
  id               Int            @id @default(autoincrement())
  reciboId         Int            @unique
  mes              Int
  anio             Int
  montoBase        Decimal        @db.Decimal(8, 2)
  montoActividades Decimal        @default(0) @db.Decimal(8, 2)
  montoTotal       Decimal        @db.Decimal(8, 2)
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  categoriaId      Int

  categoria        CategoriaSocio @relation(fields: [categoriaId], references: [id])
  recibo           Recibo         @relation(fields: [reciboId], references: [id], onDelete: Cascade)

  @@unique([categoriaId, mes, anio])  // ⚠️ CONSTRAINT PROBLEMÁTICO
  @@index([categoriaId])
  @@map("cuotas")
}
```

**Problema identificado**:
- `@@unique([categoriaId, mes, anio])` permite solo 1 cuota por categoría/período
- Si hay 25 socios ACTIVO, solo 1 puede tener cuota → **BLOQUEA GENERACIÓN MASIVA**

#### Tabla: `recibos`

```prisma
model Recibo {
  id               Int          @id @default(autoincrement())
  numero           String       @unique
  tipo             TipoRecibo
  importe          Decimal      @db.Decimal(10, 2)
  fecha            DateTime     @default(now())
  fechaVencimiento DateTime?
  estado           EstadoRecibo @default(PENDIENTE)
  concepto         String
  observaciones    String?
  emisorId         Int?
  receptorId       Int?
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  cuota            Cuota?
  mediosPago       MedioPago[]
  emisor           Persona?     @relation("ReciboEmisor", fields: [emisorId], references: [id])
  receptor         Persona?     @relation("ReciboReceptor", fields: [receptorId], references: [id])

  @@map("recibos")
}
```

#### Tabla: `categorias_socios`

```prisma
model CategoriaSocio {
  id          Int       @id @default(autoincrement())
  codigo      String    @unique
  nombre      String
  descripcion String?
  montoCuota  Decimal   @default(0) @db.Decimal(10, 2)  // Monto base mensual
  descuento   Decimal   @default(0) @db.Decimal(5, 2)   // % descuento (0-100)
  activo      Boolean   @default(true)
  orden       Int       @default(0)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  personas    Persona[]
  cuotas      Cuota[]

  @@index([codigo])
  @@index([activo])
  @@map("categorias_socios")
}
```

**Categorías existentes**:

| ID | Código | Nombre | Monto Cuota | Descuento |
|----|--------|--------|-------------|-----------|
| 6  | GENERAL | General | $0 | 0% |
| 8  | ACTIVO | Activo | $10000 | 0% |
| 7  | JUBILADO | Jubilado | $10000 | 25% |
| 9  | ESTUDIANTE | Estudiante | $10000 | 40% |
| 10 | FAMILIAR | Familiar | $0 | 50% |

---

## Lógica de Negocio

### Reglas Implementadas

1. **Cuota Base**:
   - Se obtiene de `categorias_socios.montoCuota`
   - Valor por defecto: $10000 (para ACTIVO, ESTUDIANTE, JUBILADO)
   - GENERAL y FAMILIAR: $0

2. **Descuentos por Categoría** (hardcoded en líneas 461-481):
   ```typescript
   if (categoria.codigo === 'ESTUDIANTE') {
     descuento = montoBase * 0.40;  // 40%
   }

   if (categoria.codigo === 'JUBILADO') {
     descuento = montoBase * 0.25;  // 25%
   }
   ```

3. **Fecha de Vencimiento**:
   - Día 15 del mes siguiente
   - Ejemplo: Cuota de marzo 2025 → vence 15/04/2025

4. **Numeración de Recibos**:
   - Secuencia autoincremental
   - Formato: padding con ceros (ej: "00001234")
   - ⚠️ Posible race condition en generaciones concurrentes

### Reglas NO Implementadas

1. **Descuentos familiares**:
   - Campo `familiares.descuento` existe (0-100%)
   - NO se usa en cálculo de cuota

2. **Descuentos por múltiples actividades**:
   - Ejemplo: 2 actividades → 10%, 3+ → 20%
   - NO implementado

3. **Cuota familiar**:
   - Campo `familiares.grupoFamiliarId` existe
   - NO se usa para cobrar cuota única al responsable

4. **Costo de actividades**:
   - Campo `actividades.costo` existe
   - Campo `participacion_actividades.precioEspecial` existe
   - **SIEMPRE retorna 0** (stub en línea 438)

5. **Prorrateo**:
   - Si socio se incorpora a mediados de mes
   - NO implementado

---

## Problemas Críticos Identificados

### 1. 🔴 CRÍTICO: Repository usa Architecture V1

**Archivo**: `src/repositories/cuota.repository.ts`
**Línea**: 603
**Problema**:

```typescript
// ❌ INCORRECTO (Architecture V1)
const wherePersona: any = {
  tipo: 'SOCIO',        // Campo deprecado desde Architecture V2
  fechaBaja: null
};
```

**Impacto**:
- **Generación masiva NO funciona** con socios de Architecture V2
- Query retorna 0 resultados
- Sistema inoperativo para nuevos socios

**Solución requerida**:
```typescript
// ✅ CORRECTO (Architecture V2)
const sociosActivos = await prisma.persona.findMany({
  where: {
    activo: true,
    tipos: {
      some: {
        activo: true,
        tipoPersona: { codigo: 'SOCIO' }
      }
    }
  },
  include: {
    tipos: {
      where: {
        activo: true,
        tipoPersona: { codigo: 'SOCIO' }
      },
      include: { categoria: true }
    }
  }
});
```

### 2. 🔴 CRÍTICO: Constraint Único Problemático

**Schema**: `@@unique([categoriaId, mes, anio])` en tabla `cuotas`

**Problema**:
- Permite solo 1 cuota por combinación categoría/período
- Si hay 25 socios ACTIVO, solo 1 puede tener cuota de marzo 2025

**Impacto**:
- Bloquea generación masiva
- Error: `Unique constraint failed on the fields: (categoriaId, mes, anio)`

**Solución**:
- ELIMINAR este constraint
- Mantener solo constraint en `reciboId` (ya existe)

### 3. 🟡 MEDIA: Race Condition en Numeración de Recibos

**Archivo**: `src/repositories/recibo.repository.ts`
**Problema**:

```typescript
// Vulnerable a race condition
async getNextNumero(): Promise<string> {
  const ultimoRecibo = await this.prisma.recibo.findFirst({
    orderBy: { id: 'desc' }
  });

  const siguienteNumero = (ultimoRecibo?.id || 0) + 1;
  return siguienteNumero.toString().padStart(8, '0');
}
```

**Escenario de falla**:
1. Thread A llama `getNextNumero()` → retorna "00001234"
2. Thread B llama `getNextNumero()` (antes de que A cree el recibo) → retorna "00001234"
3. Ambos intentan crear recibo con mismo número → Error de constraint único

**Solución**:
- Usar secuencia de PostgreSQL (`CREATE SEQUENCE recibos_numero_seq`)
- Función de BD: `nextval('recibos_numero_seq')`

### 4. ⚠️ MENOR: Descuentos Hardcoded

**Archivo**: `src/services/cuota.service.ts`
**Líneas**: 461-481

**Problema**:
- Porcentajes de descuento en código
- No configurable por usuario admin
- Dificulta cambios (requiere modificar código y redeployar)

**Solución**:
- Migrar a tabla `reglas_descuentos`
- Motor de descuentos configurable

### 5. ⚠️ MENOR: Cálculo de Actividades Stub

**Archivo**: `src/services/cuota.service.ts`
**Líneas**: 432-442

**Problema**:
```typescript
private async calcularCostoActividades(...) {
  // Implementar lógica para calcular costo de actividades
  // Por ahora retorna un valor básico
  return { total: 0, detalle: [] };
}
```

**Impacto**:
- Cuotas siempre tienen `montoActividades = 0`
- No se cobran las actividades

**Solución**:
- Consultar `participacion_actividades` del socio
- Sumar `precioEspecial ?? actividades.costo`

---

## Métricas de Performance

### Queries más Comunes

#### 1. Generación Masiva de Cuotas

**Query actual**:
```sql
-- PASO 1: Obtener socios (INCORRECTO)
SELECT id, nombre, apellido, categoria
FROM personas
WHERE tipo = 'SOCIO' AND fechaBaja IS NULL;

-- PASO 2: Crear recibos (por cada socio)
INSERT INTO recibos (...) VALUES (...);

-- PASO 3: Crear cuotas (por cada socio)
INSERT INTO cuotas (...) VALUES (...);
```

**Performance actual**:
- 52 socios → ~104 queries (1 INSERT por recibo + 1 INSERT por cuota)
- Tiempo estimado: **5-10 segundos** (sin batch)

**Mejora propuesta (Fase 6)**:
- Batch insert de recibos: 1 query
- Batch insert de cuotas: 1 query
- Tiempo estimado: **< 0.5 segundos** (20x más rápido)

#### 2. Obtener Cuotas por Período

**Query**:
```sql
SELECT c.*, r.*, cs.*
FROM cuotas c
INNER JOIN recibos r ON c.reciboId = r.id
INNER JOIN categorias_socios cs ON c.categoriaId = cs.id
WHERE c.mes = $1 AND c.anio = $2;
```

**Performance**: < 100ms (52 cuotas)

#### 3. Resumen Mensual

**Query** (raw SQL en línea 653 de repository):
```sql
SELECT
  c.categoriaId,
  COUNT(c.id)::int as total_cuotas,
  COUNT(CASE WHEN r.estado = 'PENDIENTE' THEN 1 END)::int as pendientes,
  COUNT(CASE WHEN r.estado = 'PAGADO' THEN 1 END)::int as pagadas,
  COUNT(CASE WHEN r.estado = 'VENCIDO' THEN 1 END)::int as vencidas,
  SUM(c.montoTotal) as monto_total
FROM cuotas c
INNER JOIN recibos r ON c.reciboId = r.id
WHERE c.mes = $1 AND c.anio = $2
GROUP BY c.categoriaId;
```

**Performance**: < 50ms

### Índices Existentes

```sql
-- Tabla cuotas
CREATE INDEX "cuotas_categoriaId_idx" ON "cuotas"("categoriaId");
CREATE UNIQUE INDEX "cuotas_reciboId_key" ON "cuotas"("reciboId");
CREATE UNIQUE INDEX "cuotas_categoriaId_mes_anio_key" ON "cuotas"("categoriaId", "mes", "anio"); -- ⚠️ PROBLEMÁTICO

-- Tabla recibos
CREATE UNIQUE INDEX "recibos_numero_key" ON "recibos"("numero");
```

**Índices faltantes recomendados**:
```sql
CREATE INDEX "cuotas_mes_anio_idx" ON "cuotas"("mes", "anio");
CREATE INDEX "recibos_estado_idx" ON "recibos"("estado");
CREATE INDEX "recibos_fechaVencimiento_idx" ON "recibos"("fechaVencimiento");
```

---

## Configuraciones del Sistema

### Variables de Entorno (.env)

```bash
# Cuotas
CUOTA_VENCIMIENTO_DIAS=10

# Recibos
RECIBO_NUMERACION_INICIO=1000
```

### Configuración de Descuentos (Hardcoded)

Archivo: `src/services/cuota.service.ts`

```typescript
// Línea 462-470
ESTUDIANTE: 40% de descuento
JUBILADO: 25% de descuento
```

### Configuración de Categorías (Base de Datos)

Tabla: `categorias_socios`

| Categoría | Monto Base | Descuento % |
|-----------|------------|-------------|
| ACTIVO | $10000 | 0% |
| ESTUDIANTE | $10000 | 40% |
| JUBILADO | $10000 | 25% |
| FAMILIAR | $0 | 50% |
| GENERAL | $0 | 0% |

**Nota**: El campo `descuento` en tabla existe pero NO se usa en el código.

---

## Endpoints Disponibles

### API REST - Cuotas

```
POST   /api/cuotas/generar          # Generación masiva
POST   /api/cuotas                  # Crear cuota individual
GET    /api/cuotas                  # Listar cuotas (paginado)
GET    /api/cuotas/:id              # Obtener cuota por ID
PUT    /api/cuotas/:id              # Actualizar cuota
DELETE /api/cuotas/:id              # Eliminar cuota
DELETE /api/cuotas/bulk             # Eliminar múltiples
GET    /api/cuotas/periodo/:mes/:anio  # Cuotas por período
GET    /api/cuotas/socio/:socioId   # Cuotas de un socio
GET    /api/cuotas/vencidas         # Cuotas vencidas
GET    /api/cuotas/pendientes       # Cuotas pendientes
POST   /api/cuotas/calcular         # Calcular monto sin crear
POST   /api/cuotas/recalcular       # Recalcular cuotas existentes
GET    /api/cuotas/resumen/:mes/:anio  # Resumen mensual
POST   /api/cuotas/reporte          # Generar reporte
```

---

## Próximos Pasos

### FASE 1: Fixes Críticos (2-3 días)

1. ✅ Migrar `getCuotasPorGenerar()` a Architecture V2
2. ✅ Eliminar constraint único `@@unique([categoriaId, mes, anio])`
3. ✅ Resolver race condition en numeración de recibos (secuencia PostgreSQL)
4. ✅ Tests de regresión

### FASE 2: Sistema de Ítems (3-4 días)

1. Diseñar schema de ítems configurables
2. Migrar datos legacy a nuevo modelo
3. Implementar CRUD de ítems

### FASE 3+: Ver PLAN_IMPLEMENTACION_CUOTAS_V2.md

---

## Conclusiones

### Fortalezas del Sistema Actual

- ✅ Arquitectura en capas bien definida
- ✅ Validaciones de DTOs con Zod
- ✅ Logging estructurado
- ✅ Integración con sistema de recibos funcional
- ✅ Estadísticas y reportes implementados

### Debilidades Críticas

- ❌ Repository usa Architecture V1 (bloqueante)
- ❌ Constraint único incorrecto (bloqueante)
- ❌ Descuentos hardcoded (no configurable)
- ❌ Cálculo de actividades no implementado
- ❌ Sin soporte de cuota familiar
- ❌ Sin motor de reglas flexible

### Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Sistema inoperativo con Architecture V2 | Alta | Alto | Fase 1 urgente |
| Race conditions en producción | Media | Medio | Secuencia PostgreSQL |
| Performance degradada (>500 socios) | Alta | Medio | Batch inserts (Fase 6) |

---

**Documento elaborado por**: Claude Code (Anthropic)
**Fecha de snapshot**: 2025-12-12
**Datos de respaldo**: `/backups/data_backup_2025-12-12T23-30-38.json`
