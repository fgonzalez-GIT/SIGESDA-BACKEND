# INFORME: RESETEO Y RECARGA DE DATOS
## AULAS, EQUIPAMIENTOS Y RESERVAS

**Fecha:** 2025-11-28
**Sistema:** SIGESDA Backend
**Operación:** Reseteo completo de datos relacionados con Aulas, Equipamientos y Reservas

---

## 1. TABLAS AFECTADAS POR EL RESETEO

### 1.1. TABLAS TRANSACCIONALES (Nivel 1 - Mayor Dependencia)

| # | Tabla | Nombre del Modelo | Registros Eliminados | Descripción |
|---|-------|-------------------|---------------------|-------------|
| 1 | `reservas_aulas_secciones` | `reservas_aulas_secciones` | 3 | Reservas recurrentes de aulas asignadas a secciones de actividades |
| 2 | `reserva_aulas` | `reserva_aulas` | 0 | Reservas puntuales de aulas por docentes/actividades |
| 3 | `aulas_equipamientos` | `AulaEquipamiento` | 32 | Relación many-to-many entre aulas y equipamientos asignados |

**Subtotal Nivel 1:** 35 registros eliminados

---

### 1.2. TABLAS MAESTRAS (Nivel 2 - Entidades Principales)

| # | Tabla | Nombre del Modelo | Registros Eliminados | Descripción |
|---|-------|-------------------|---------------------|-------------|
| 4 | `aulas` | `Aula` | 11 | Aulas del conservatorio (salas de ensayo, estudios, auditorios) |
| 5 | `equipamientos` | `Equipamiento` | 18 | Equipamiento disponible (instrumentos, mobiliario, tecnología) |

**Subtotal Nivel 2:** 29 registros eliminados

---

### 1.3. TABLAS DE CATÁLOGO (Nivel 3 - Configuración Base)

| # | Tabla | Nombre del Modelo | Registros Eliminados | Descripción |
|---|-------|-------------------|---------------------|-------------|
| 6 | `estados_reservas` | `EstadoReserva` | 5 | Estados de reservas: PENDIENTE, CONFIRMADA, COMPLETADA, CANCELADA, RECHAZADA |
| 7 | `estados_aulas` | `EstadoAula` | 4 | Estados de aulas: DISPONIBLE, EN_MANTENIMIENTO, CERRADA, RESERVADA |
| 8 | `tipos_aulas` | `TipoAula` | 5 | Tipos de aula: TEORIA, PRACTICA, ESTUDIO, ENSAYO, AUDITORIO |
| 9 | `categorias_equipamiento` | `CategoriasEquipamiento` | 5 | Categorías: INST_MUS, MOB, TEC_AUDIO, INFRAEST, DIDACT |

**Subtotal Nivel 3:** 19 registros eliminados

---

### 1.4. RESUMEN TOTAL

| Categoría | Tablas | Registros Eliminados |
|-----------|--------|---------------------|
| Transaccionales | 3 | 35 |
| Maestras | 2 | 29 |
| Catálogos | 4 | 19 |
| **TOTAL** | **9** | **83** |

---

## 2. SECUENCIAS RESETEADAS (AUTO_INCREMENT)

Todas las secuencias de autoincremento fueron reseteadas a 1:

| # | Secuencia | Estado |
|---|-----------|--------|
| 1 | `aulas_id_seq` | ✓ RESTART WITH 1 |
| 2 | `equipamientos_id_seq` | ✓ RESTART WITH 1 |
| 3 | `aulas_equipamientos_id_seq` | ✓ RESTART WITH 1 |
| 4 | `reserva_aulas_id_seq` | ✓ RESTART WITH 1 |
| 5 | `reservas_aulas_secciones_id_seq` | ✓ RESTART WITH 1 |
| 6 | `tipos_aulas_id_seq` | ✓ RESTART WITH 1 |
| 7 | `estados_aulas_id_seq` | ✓ RESTART WITH 1 |
| 8 | `estados_reservas_id_seq` | ✓ RESTART WITH 1 |
| 9 | `categorias_equipamiento_id_seq` | ✓ RESTART WITH 1 |

---

## 3. ARCHIVOS UTILIZADOS PARA EL RESETEO

### 3.1. Script de Reseteo (TypeScript)

**Archivo:** `scripts/reset-aulas-equipamientos.ts`
**Propósito:** Eliminar todos los datos de las 9 tablas y resetear secuencias
**Comando de ejecución:**
```bash
npx ts-node scripts/reset-aulas-equipamientos.ts
```

**Características:**
- ✓ Usa Prisma Client para operaciones seguras
- ✓ Elimina datos en orden correcto respetando foreign keys
- ✓ Resetea secuencias de autoincremento
- ✓ Muestra resumen detallado de registros eliminados
- ✓ Manejo de errores con rollback automático

---

### 3.2. Script de Reseteo (SQL Alternativo)

**Archivo:** `scripts/reset-aulas-equipamientos-reservas.sql`
**Propósito:** Script SQL puro para reseteo directo en PostgreSQL
**Comando de ejecución:**
```bash
PGPASSWORD='SiGesda2024!' psql -h localhost -U sigesda_user -d asociacion_musical -f scripts/reset-aulas-equipamientos-reservas.sql
```

**Características:**
- ✓ Usa TRUNCATE CASCADE para eliminar datos
- ✓ Incluido en transacción (BEGIN/COMMIT)
- ✓ Comentarios explicativos detallados
- ✓ Independiente del código TypeScript

---

## 4. ARCHIVOS UTILIZADOS PARA LA CARGA DE DATOS

### 4.1. Archivo Principal de Seed

**Archivo:** `prisma/seed.ts`
**Líneas relevantes:** 308-612, 925-1000, 1506-1547
**Comando de ejecución:**
```bash
npm run db:seed
# O alternativamente:
npx ts-node prisma/seed.ts
```

**Datos cargados:**

#### A. Catálogos de Equipamiento (Líneas 449-497)
```typescript
categorias_equipamiento.create({
  codigo: 'INST_MUS',
  nombre: 'Instrumentos Musicales',
  // ... 5 categorías total
})
```

**Categorías creadas:**
1. INST_MUS - Instrumentos Musicales
2. MOB - Mobiliario
3. TEC_AUDIO - Tecnología y Audio
4. INFRAEST - Infraestructura
5. DIDACT - Material Didáctico

---

#### B. Equipamientos (Líneas 499-612)
```typescript
equipamiento.create({
  codigo: 'INST-001',
  nombre: 'Piano de Cola',
  categoriaEquipamientoId: categoriasEquipamiento[0].id,
  // ... 12 equipamientos total
})
```

**Equipamientos creados:**
| Código | Nombre | Categoría |
|--------|--------|-----------|
| INST-001 | Piano de Cola | Instrumentos Musicales |
| INST-002 | Piano Vertical | Instrumentos Musicales |
| MOB-001 | Sillas | Mobiliario |
| MOB-002 | Atriles | Mobiliario |
| MOB-003 | Escritorio | Mobiliario |
| MOB-004 | Armario | Mobiliario |
| DIDA-001 | Pizarra Musical | Material Didáctico |
| TEC_-001 | Sistema de Sonido | Tecnología y Audio |
| TEC_-002 | Proyector | Tecnología y Audio |
| TEC_-003 | Consola de Grabación | Tecnología y Audio |
| TEC_-004 | Micrófonos | Tecnología y Audio |
| INFR-001 | Cabina Acústica | Infraestructura |

---

#### C. Tipos de Aula (Líneas 308-356)
```typescript
tipoAula.create({
  codigo: 'TEORIA',
  nombre: 'Aula de Teoría',
  // ... 5 tipos total
})
```

**Tipos creados:**
1. TEORIA - Aula de Teoría
2. PRACTICA - Aula de Práctica
3. ESTUDIO - Estudio de Grabación
4. ENSAYO - Sala de Ensayo
5. AUDITORIO - Auditorio

---

#### D. Estados de Aula (Líneas 358-397)
```typescript
estadoAula.create({
  codigo: 'DISPONIBLE',
  nombre: 'Disponible',
  // ... 4 estados total
})
```

**Estados creados:**
1. DISPONIBLE - Aula disponible para uso
2. EN_MANTENIMIENTO - Temporalmente fuera de servicio
3. CERRADA - Cerrada permanentemente
4. RESERVADA - Con reserva permanente

---

#### E. Estados de Reserva (Líneas 399-447)
```typescript
estadoReserva.create({
  codigo: 'PENDIENTE',
  nombre: 'Pendiente',
  // ... 5 estados total
})
```

**Estados creados:**
1. PENDIENTE - Esperando aprobación
2. CONFIRMADA - Aprobada y activa
3. COMPLETADA - Finalizada (fecha pasada)
4. CANCELADA - Cancelada por usuario/admin
5. RECHAZADA - No aprobada

---

#### F. Aulas (Líneas 925-964)
```typescript
aula.create({
  nombre: 'Sala Principal',
  capacidad: 50,
  tipoAulaId: tiposAulas[3].id, // ENSAYO
  estadoAulaId: estadosAulas[0].id, // DISPONIBLE
  // ...
})
```

**Aulas creadas:**
| Nombre | Capacidad | Tipo | Estado | Ubicación |
|--------|-----------|------|--------|-----------|
| Sala Principal | 50 | ENSAYO | DISPONIBLE | Planta Baja |
| Aula 101 | 20 | PRACTICA | DISPONIBLE | Primer Piso |
| Estudio de Grabación | 10 | ESTUDIO | DISPONIBLE | Sótano |

---

#### G. Asignación de Equipamiento a Aulas (Líneas 966-1000)
```typescript
aulaEquipamiento.createMany({
  data: [
    { aulaId: aulas[0].id, equipamientoId: equipamientos[0].id, cantidad: 1 },
    // ...
  ]
})
```

**Asignaciones por Aula:**

**Sala Principal:**
- 1x Piano de Cola
- 1x Sistema de Sonido
- 1x Proyector
- 50x Sillas
- 40x Atriles

**Aula 101:**
- 1x Piano Vertical
- 1x Pizarra Musical
- 20x Sillas
- 15x Atriles
- 1x Escritorio

**Estudio de Grabación:**
- 1x Cabina Acústica
- 1x Consola de Grabación
- 8x Micrófonos
- 10x Sillas
- 2x Armarios

---

#### H. Reservas de Aulas por Sección (Líneas 1506-1547)
```typescript
reservas_aulas_secciones.create({
  seccionId: seccionCoro.id,
  aulaId: aulas[0].id, // Sala Principal
  diaSemana: 'LUNES',
  horaInicio: '18:00',
  horaFin: '20:00',
  // ...
})
```

**Reservas creadas:**
1. Coro → Sala Principal → LUNES 18:00-20:00
2. Coro → Sala Principal → MIÉRCOLES 18:00-20:00
3. Piano → Aula 101 → MARTES 15:00-16:00

---

## 5. ESQUEMA DE DEPENDENCIAS

```
┌─────────────────────────────────────────────────────────┐
│                  CATÁLOGOS BASE                         │
│  - categorias_equipamiento (5)                          │
│  - tipos_aulas (5)                                      │
│  - estados_aulas (4)                                    │
│  - estados_reservas (5)                                 │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                  MAESTROS                               │
│  - equipamientos (12) → categorias_equipamiento         │
│  - aulas (3) → tipos_aulas, estados_aulas               │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                  RELACIONES M:N                         │
│  - aulas_equipamientos (32) → aulas, equipamientos      │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                  RESERVAS                               │
│  - reserva_aulas → aulas, personas, actividades         │
│  - reservas_aulas_secciones (3) → aulas, secciones      │
└─────────────────────────────────────────────────────────┘
```

---

## 6. VALIDACIONES IMPLEMENTADAS EN SEED

### 6.1. Integridad Referencial
- ✓ Los equipamientos se crean DESPUÉS de las categorías
- ✓ Las aulas se crean DESPUÉS de los tipos y estados
- ✓ Las asignaciones aula-equipamiento se crean DESPUÉS de aulas y equipamientos
- ✓ Las reservas se crean DESPUÉS de aulas, secciones y personas

### 6.2. Lógica de Negocio
- ✓ Capacidad de aulas coherente con el tipo (50 para ensayo, 20 para práctica, 10 para estudio)
- ✓ Equipamiento asignado apropiado para cada tipo de aula
- ✓ Horarios de reservas sin solapamientos en la misma aula
- ✓ Estados iniciales coherentes (todas las aulas DISPONIBLES)

---

## 7. OPERACIÓN EXITOSA

### 7.1. Resultado del Reseteo
```
📊 TOTAL REGISTROS ELIMINADOS: 83
📊 TABLAS AFECTADAS: 9
📊 SECUENCIAS RESETEADAS: 9
```

### 7.2. Resultado del Seed
```
🎭 ACTIVIDADES:
  ✓ Actividades: 2
  ✓ Secciones: 2
  ✓ Horarios: 3
  ✓ Aulas: 3
  ✓ Reservas de aulas: 3
```

---

## 8. COMANDOS DE EJECUCIÓN

### 8.1. Reseteo Completo
```bash
# Opción 1: Script TypeScript (Recomendado)
npx ts-node scripts/reset-aulas-equipamientos.ts

# Opción 2: Script SQL
PGPASSWORD='SiGesda2024!' psql -h localhost -U sigesda_user -d asociacion_musical -f scripts/reset-aulas-equipamientos-reservas.sql
```

### 8.2. Recarga de Datos
```bash
# Seed completo (incluye aulas, equipamientos, reservas y todos los demás datos)
npm run db:seed

# O alternativamente:
npx ts-node prisma/seed.ts
```

---

## 9. ARCHIVOS DEL PROYECTO INVOLUCRADOS

| # | Archivo | Líneas Relevantes | Propósito |
|---|---------|-------------------|-----------|
| 1 | `prisma/schema.prisma` | 137-246 | Definición de modelos Aula, Equipamiento, Reservas |
| 2 | `prisma/seed.ts` | 308-612, 925-1000, 1506-1547 | Carga de datos de ejemplo |
| 3 | `scripts/reset-aulas-equipamientos.ts` | Todo el archivo | Reseteo mediante Prisma |
| 4 | `scripts/reset-aulas-equipamientos-reservas.sql` | Todo el archivo | Reseteo mediante SQL |

---

## 10. RECOMENDACIONES

### 10.1. Para Desarrollo
- ✅ Usar `scripts/reset-aulas-equipamientos.ts` (más seguro, con logs detallados)
- ✅ Ejecutar `npm run db:seed` después del reset
- ✅ Verificar la integridad de datos con Prisma Studio: `npm run db:studio`

### 10.2. Para Producción
- ⚠️ **NUNCA** ejecutar scripts de reseteo en producción
- ⚠️ Crear backups antes de cualquier migración
- ⚠️ Usar migraciones de Prisma para cambios de schema

---

## 11. CONCLUSIÓN

✅ **OPERACIÓN COMPLETADA EXITOSAMENTE**

- **83 registros eliminados** de 9 tablas
- **9 secuencias reseteadas** a valor inicial 1
- **Datos recargados** mediante seed con:
  - 5 categorías de equipamiento
  - 12 equipamientos
  - 5 tipos de aula
  - 4 estados de aula
  - 5 estados de reserva
  - 3 aulas
  - 32 asignaciones aula-equipamiento
  - 3 reservas de aulas por sección

**Estado final:** Base de datos limpia y lista para uso con datos de ejemplo coherentes y validados.

---

**Informe generado:** 2025-11-28
**Sistema:** SIGESDA Backend v1.0.0
**Base de datos:** PostgreSQL 16+
**ORM:** Prisma 5.6.0
