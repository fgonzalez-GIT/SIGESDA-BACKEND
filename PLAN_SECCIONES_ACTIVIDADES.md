# 📚 Plan de Implementación: Sistema de Secciones/Grupos para Actividades

**Fecha de creación:** 2025-10-08
**Estado:** En planificación
**Prioridad:** Alta
**Versión:** 1.0
**Responsable:** Equipo de desarrollo SIGESDA

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Análisis del Problema](#análisis-del-problema)
3. [Diseño de la Solución](#diseño-de-la-solución)
4. [Plan de Migración](#plan-de-migración)
5. [Fases de Implementación](#fases-de-implementación)
6. [Plan de Pruebas](#plan-de-pruebas)
7. [Rollback Strategy](#rollback-strategy)

---

## 🎯 Resumen Ejecutivo

### Problema Identificado

El diseño actual de horarios **NO permite** que una misma actividad se dicte en el mismo día y horario con diferentes docentes y aulas (grupos paralelos).

**Ejemplo bloqueado actualmente:**
- Piano Nivel 1 - Lunes 18:00-19:00
  - ❌ Grupo A: Docente María + Aula 1
  - ❌ Grupo B: Docente Juan + Aula 2

### Solución Propuesta

Implementar un sistema de **Secciones/Grupos** que permita:
- ✅ Múltiples grupos de la misma actividad
- ✅ Cada grupo con sus propios horarios, docentes y aulas
- ✅ Gestión independiente de participantes por sección
- ✅ Capacidad máxima por sección
- ✅ Reportes y estadísticas por sección

### Beneficios

1. **Escalabilidad**: Soporta actividades con múltiples grupos paralelos
2. **Flexibilidad**: Diferentes docentes/aulas por grupo
3. **Claridad**: Separación explícita de grupos en la base de datos
4. **Reportes**: Estadísticas detalladas por sección
5. **Participantes**: Inscripción específica a una sección

---

## 🔍 Análisis del Problema

### Limitaciones del Diseño Actual

#### 1. Constraint en HorarioActividad
```prisma
@@unique([actividadId, diaSemana, horaInicio])
```
**Impacto**: Impide horarios duplicados para la misma actividad.

#### 2. Relación Actividad-Docente
```prisma
docentes Persona[] @relation("DocenteActividad")
```
**Impacto**: Docentes asociados a toda la actividad, no a horarios específicos.

#### 3. ReservaAula sin vínculo a Horarios
```prisma
model ReservaAula {
  actividadId String?
  // NO tiene horarioId
}
```
**Impacto**: No se puede asignar un aula específica a un horario recurrente.

### Casos de Uso Bloqueados

1. ❌ Grupos paralelos con mismo horario
2. ❌ Docente específico por grupo
3. ❌ Aula específica por grupo
4. ❌ Capacidad diferenciada por grupo
5. ❌ Inscripción de alumno a grupo específico

---

## 🏗️ Diseño de la Solución

### Nuevo Modelo de Datos

```prisma
// Actividad (se mantiene como "plantilla" o "tipo de actividad")
model Actividad {
  id          String   @id @default(cuid())
  nombre      String   // "Piano Nivel 1"
  tipo        TipoActividad
  descripcion String?
  precio      Decimal  @default(0) @db.Decimal(8, 2)
  activa      Boolean  @default(true)

  // Relaciones
  secciones   SeccionActividad[]

  @@map("actividades")
}

// Nueva entidad: SeccionActividad (Grupo)
model SeccionActividad {
  id              String   @id @default(cuid())
  actividadId     String
  nombre          String   // "Grupo A", "Sección Mañana", "Nivel Inicial"
  codigo          String?  // Código único: "PIANO-L1-A"
  capacidadMaxima Int?
  activa          Boolean  @default(true)
  observaciones   String?

  // Campos de auditoría
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones
  actividad       Actividad @relation(fields: [actividadId], references: [id], onDelete: Cascade)
  horarios        HorarioSeccion[]
  docentes        Persona[] @relation("DocenteSeccion")
  participaciones ParticipacionSeccion[]
  reservasAula    ReservaAulaSeccion[]

  @@unique([actividadId, nombre])
  @@map("secciones_actividades")
}

// Nueva entidad: HorarioSeccion (reemplaza HorarioActividad)
model HorarioSeccion {
  id        String    @id @default(cuid())
  seccionId String
  diaSemana DiaSemana
  horaInicio String   // "10:00"
  horaFin    String   // "12:00"
  activo     Boolean  @default(true)

  // Campos de auditoría
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones
  seccion   SeccionActividad @relation(fields: [seccionId], references: [id], onDelete: Cascade)

  // Ahora SÍ permite múltiples horarios iguales (diferentes secciones)
  @@index([seccionId, diaSemana, horaInicio])
  @@map("horarios_secciones")
}

// Nueva entidad: ParticipacionSeccion (reemplaza ParticipacionActividad)
model ParticipacionSeccion {
  id          String   @id @default(cuid())
  personaId   String
  seccionId   String
  fechaInicio DateTime
  fechaFin    DateTime?
  precioEspecial Decimal? @db.Decimal(8, 2)
  activa      Boolean  @default(true)
  observaciones String?

  // Campos de auditoría
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones
  persona Persona @relation(fields: [personaId], references: [id], onDelete: Cascade)
  seccion SeccionActividad @relation(fields: [seccionId], references: [id], onDelete: Cascade)

  @@unique([personaId, seccionId])
  @@map("participaciones_secciones")
}

// Nueva entidad: ReservaAulaSeccion
model ReservaAulaSeccion {
  id            String   @id @default(cuid())
  seccionId     String
  aulaId        String
  diaSemana     DiaSemana
  horaInicio    String
  horaFin       String
  fechaVigencia DateTime  // Desde cuándo aplica
  fechaFin      DateTime? // Hasta cuándo (null = indefinido)
  observaciones String?

  // Campos de auditoría
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones
  seccion SeccionActividad @relation(fields: [seccionId], references: [id], onDelete: Cascade)
  aula    Aula @relation(fields: [aulaId], references: [id], onDelete: Cascade)

  @@unique([seccionId, aulaId, diaSemana, horaInicio])
  @@map("reservas_aulas_secciones")
}
```

### Diagrama de Relaciones

```
Actividad (1) ──────────> (N) SeccionActividad (Grupo)
                                    │
                                    ├──> (N) HorarioSeccion
                                    ├──> (N) Persona (Docentes)
                                    ├──> (N) ParticipacionSeccion
                                    └──> (N) ReservaAulaSeccion
```

### Ejemplo de Datos

```json
{
  "actividad": {
    "id": "act001",
    "nombre": "Piano Nivel 1",
    "tipo": "CLASE_INSTRUMENTO",
    "secciones": [
      {
        "id": "sec001",
        "nombre": "Grupo A",
        "codigo": "PIANO-L1-A",
        "capacidadMaxima": 4,
        "docentes": [{ "id": "doc001", "nombre": "María García" }],
        "horarios": [
          { "diaSemana": "LUNES", "horaInicio": "18:00", "horaFin": "19:00" }
        ],
        "reservasAula": [
          { "aula": "Aula 1", "diaSemana": "LUNES", "horaInicio": "18:00" }
        ]
      },
      {
        "id": "sec002",
        "nombre": "Grupo B",
        "codigo": "PIANO-L1-B",
        "capacidadMaxima": 4,
        "docentes": [{ "id": "doc002", "nombre": "Juan Pérez" }],
        "horarios": [
          { "diaSemana": "LUNES", "horaInicio": "18:00", "horaFin": "19:00" }
        ],
        "reservasAula": [
          { "aula": "Aula 2", "diaSemana": "LUNES", "horaInicio": "18:00" }
        ]
      }
    ]
  }
}
```

---

## 🔄 Plan de Migración

### Estrategia de Migración de Datos

#### Fase 1: Análisis de Datos Existentes
```sql
-- Contar actividades con horarios
SELECT COUNT(*) FROM actividades WHERE id IN (
  SELECT DISTINCT actividadId FROM horarios_actividades
);

-- Contar participaciones activas
SELECT COUNT(*) FROM participacion_actividades WHERE activa = true;

-- Contar reservas de aulas
SELECT COUNT(*) FROM reserva_aulas WHERE actividadId IS NOT NULL;
```

#### Fase 2: Creación de Tablas Nuevas
1. Crear `secciones_actividades`
2. Crear `horarios_secciones`
3. Crear `participaciones_secciones`
4. Crear `reservas_aulas_secciones`

#### Fase 3: Migración de Datos

**Script de migración automática:**

```sql
-- 1. Crear una sección por defecto para cada actividad existente
INSERT INTO secciones_actividades (id, actividadId, nombre, codigo, capacidadMaxima, activa, createdAt, updatedAt)
SELECT
  CONCAT('sec_', id) as id,
  id as actividadId,
  'Sección Principal' as nombre,
  CONCAT(UPPER(LEFT(nombre, 3)), '-DEFAULT') as codigo,
  capacidadMaxima,
  activa,
  createdAt,
  updatedAt
FROM actividades;

-- 2. Migrar horarios a la sección por defecto
INSERT INTO horarios_secciones (id, seccionId, diaSemana, horaInicio, horaFin, activo, createdAt, updatedAt)
SELECT
  h.id,
  CONCAT('sec_', h.actividadId) as seccionId,
  h.diaSemana,
  h.horaInicio,
  h.horaFin,
  h.activo,
  h.createdAt,
  h.updatedAt
FROM horarios_actividades h;

-- 3. Migrar relación docentes -> sección
INSERT INTO _DocenteSeccion (A, B)
SELECT
  A as personaId,
  CONCAT('sec_', B) as seccionId
FROM _DocenteActividad;

-- 4. Migrar participaciones
INSERT INTO participaciones_secciones (
  id, personaId, seccionId, fechaInicio, fechaFin,
  precioEspecial, activa, observaciones, createdAt, updatedAt
)
SELECT
  p.id,
  p.personaId,
  CONCAT('sec_', p.actividadId) as seccionId,
  p.fechaInicio,
  p.fechaFin,
  p.precioEspecial,
  p.activa,
  p.observaciones,
  p.createdAt,
  p.updatedAt
FROM participacion_actividades p;

-- 5. Migrar reservas de aulas (esto es más complejo)
-- Crear reservas recurrentes basadas en horarios de la sección
INSERT INTO reservas_aulas_secciones (
  id, seccionId, aulaId, diaSemana, horaInicio, horaFin,
  fechaVigencia, observaciones, createdAt, updatedAt
)
SELECT
  CONCAT('res_', r.id, '_', h.id) as id,
  CONCAT('sec_', r.actividadId) as seccionId,
  r.aulaId,
  h.diaSemana,
  h.horaInicio,
  h.horaFin,
  r.fechaInicio as fechaVigencia,
  r.observaciones,
  r.createdAt,
  NOW() as updatedAt
FROM reserva_aulas r
JOIN horarios_actividades h ON h.actividadId = r.actividadId
WHERE r.actividadId IS NOT NULL;
```

#### Fase 4: Validación Post-Migración
```sql
-- Verificar que todas las actividades tienen al menos una sección
SELECT a.id, a.nombre, COUNT(s.id) as secciones
FROM actividades a
LEFT JOIN secciones_actividades s ON s.actividadId = a.id
GROUP BY a.id, a.nombre
HAVING COUNT(s.id) = 0;

-- Verificar que no se perdieron horarios
SELECT
  (SELECT COUNT(*) FROM horarios_actividades) as horarios_old,
  (SELECT COUNT(*) FROM horarios_secciones) as horarios_new;

-- Verificar que no se perdieron participaciones
SELECT
  (SELECT COUNT(*) FROM participacion_actividades) as participaciones_old,
  (SELECT COUNT(*) FROM participaciones_secciones) as participaciones_new;
```

#### Fase 5: Backup y Limpieza
```sql
-- Renombrar tablas antiguas (no eliminar aún)
ALTER TABLE horarios_actividades RENAME TO horarios_actividades_backup;
ALTER TABLE participacion_actividades RENAME TO participacion_actividades_backup;
ALTER TABLE _DocenteActividad RENAME TO _DocenteActividad_backup;

-- Mantener por 30 días para rollback si es necesario
```

---

## 📅 Fases de Implementación

### 🎯 Fase 1: Diseño y Planificación (1-2 días)
**Estado:** ⏳ En progreso

#### Tareas:
- [x] Análisis del problema actual
- [ ] Diseño del nuevo modelo de datos
- [ ] Documentación de casos de uso
- [ ] Plan de migración detallado
- [ ] Identificación de breaking changes
- [ ] Plan de comunicación al equipo

**Entregables:**
- Documento de diseño completo
- Diagrama ER actualizado
- Plan de migración SQL
- Documento de breaking changes

---

### 🎯 Fase 2: Schema y Migración (2-3 días)
**Estado:** ⏳ Pendiente

#### Tareas:
1. **Actualizar schema.prisma**
   - Crear model SeccionActividad
   - Crear model HorarioSeccion
   - Crear model ParticipacionSeccion
   - Crear model ReservaAulaSeccion
   - Actualizar relaciones
   - Generar migración Prisma

2. **Scripts de migración de datos**
   - Script de migración automática
   - Script de validación
   - Script de rollback

3. **Pruebas de migración**
   - Probar en base de datos de desarrollo
   - Validar integridad de datos
   - Medir tiempo de ejecución
   - Verificar índices

**Entregables:**
- Schema Prisma actualizado
- Migración SQL generada
- Scripts de validación
- Reporte de pruebas de migración

**Archivos afectados:**
- `prisma/schema.prisma`
- `prisma/migrations/YYYYMMDD_add_secciones_actividades/migration.sql`
- `scripts/migrate-to-secciones.sql`
- `scripts/validate-migration.sql`
- `scripts/rollback-secciones.sql`

---

### 🎯 Fase 3: DTOs y Validaciones (1-2 días)
**Estado:** ⏳ Pendiente

#### Tareas:
1. **Crear nuevos DTOs**
   ```typescript
   // seccion.dto.ts
   export const createSeccionSchema = z.object({
     actividadId: z.string().cuid(),
     nombre: z.string().min(1).max(100),
     codigo: z.string().optional(),
     capacidadMaxima: z.number().int().positive().optional(),
     docenteIds: z.array(z.string().cuid()).default([]),
     horarios: z.array(horarioSchema).default([]),
     aulas: z.array(asignacionAulaSchema).optional()
   });

   export const updateSeccionSchema = createSeccionSchema.partial();

   export const asignarDocenteSeccionSchema = z.object({
     seccionId: z.string().cuid(),
     docenteId: z.string().cuid()
   });

   export const inscribirParticipanteSchema = z.object({
     personaId: z.string().cuid(),
     seccionId: z.string().cuid(),
     fechaInicio: z.string().datetime(),
     fechaFin: z.string().datetime().optional(),
     precioEspecial: z.number().optional()
   });
   ```

2. **Actualizar DTOs existentes**
   - Deprecar createActividadSchema con horarios
   - Mantener compatibilidad temporal

**Entregables:**
- `src/dto/seccion.dto.ts` (nuevo)
- DTOs actualizados con validaciones
- Tests unitarios de validación

---

### 🎯 Fase 4: Repository Layer (2-3 días)
**Estado:** ⏳ Pendiente

#### Tareas:
1. **Crear SeccionRepository**
   ```typescript
   export class SeccionRepository {
     async create(data: CreateSeccionDto): Promise<SeccionActividad>
     async findAll(query: SeccionQueryDto): Promise<{ data: SeccionActividad[]; total: number }>
     async findById(id: string): Promise<SeccionActividad | null>
     async findByActividad(actividadId: string): Promise<SeccionActividad[]>
     async update(id: string, data: UpdateSeccionDto): Promise<SeccionActividad>
     async delete(id: string): Promise<SeccionActividad>

     // Horarios
     async createHorario(seccionId: string, horario: HorarioDto): Promise<HorarioSeccion>
     async updateHorario(horarioId: string, data: Partial<HorarioDto>): Promise<HorarioSeccion>
     async deleteHorario(horarioId: string): Promise<void>

     // Docentes
     async asignarDocente(seccionId: string, docenteId: string): Promise<SeccionActividad>
     async desasignarDocente(seccionId: string, docenteId: string): Promise<SeccionActividad>

     // Aulas
     async asignarAula(data: AsignarAulaDto): Promise<ReservaAulaSeccion>
     async desasignarAula(reservaId: string): Promise<void>

     // Participantes
     async inscribirParticipante(data: InscribirParticipanteDto): Promise<ParticipacionSeccion>
     async desinscribirParticipante(participacionId: string): Promise<void>
     async getParticipantes(seccionId: string): Promise<ParticipacionSeccion[]>

     // Validaciones
     async verificarCapacidad(seccionId: string): Promise<boolean>
     async verificarConflictosHorario(seccionId: string, horario: HorarioDto): Promise<any[]>
     async verificarDisponibilidadDocente(docenteId: string, horario: HorarioDto): Promise<boolean>
     async verificarDisponibilidadAula(aulaId: string, horario: HorarioDto): Promise<boolean>
   }
   ```

2. **Actualizar ActividadRepository**
   - Agregar métodos para trabajar con secciones
   - Mantener compatibilidad hacia atrás

**Entregables:**
- `src/repositories/seccion.repository.ts` (nuevo)
- `src/repositories/actividad.repository.ts` (actualizado)
- Tests unitarios de repository

---

### 🎯 Fase 5: Service Layer (2-3 días)
**Estado:** ⏳ Pendiente

#### Tareas:
1. **Crear SeccionService**
   ```typescript
   export class SeccionService {
     // CRUD
     async createSeccion(data: CreateSeccionDto): Promise<SeccionActividad>
     async getSecciones(query: SeccionQueryDto): Promise<PaginatedResponse<SeccionActividad>>
     async getSeccionById(id: string): Promise<SeccionActividad>
     async updateSeccion(id: string, data: UpdateSeccionDto): Promise<SeccionActividad>
     async deleteSeccion(id: string): Promise<void>

     // Lógica de negocio
     async duplicarSeccion(seccionId: string, nuevoNombre: string): Promise<SeccionActividad>
     async fusionarSecciones(seccionIds: string[]): Promise<SeccionActividad>
     async transferirParticipantes(origenId: string, destinoId: string): Promise<void>

     // Horarios
     async agregarHorario(seccionId: string, horario: HorarioDto): Promise<HorarioSeccion>
     async actualizarHorario(horarioId: string, data: Partial<HorarioDto>): Promise<HorarioSeccion>
     async eliminarHorario(horarioId: string): Promise<void>

     // Docentes
     async asignarDocente(seccionId: string, docenteId: string): Promise<void>
     async desasignarDocente(seccionId: string, docenteId: string): Promise<void>

     // Participantes
     async inscribirParticipante(data: InscribirParticipanteDto): Promise<ParticipacionSeccion>
     async cambiarSeccion(participanteId: string, nuevaSeccionId: string): Promise<void>

     // Reportes
     async getEstadisticas(seccionId: string): Promise<EstadisticasSeccion>
     async getHorarioSemanalPorSeccion(): Promise<any>
     async getOcupacionSecciones(): Promise<any>
   }
   ```

2. **Validaciones de negocio**
   - Capacidad máxima por sección
   - Conflictos de horarios entre secciones
   - Disponibilidad de docentes
   - Disponibilidad de aulas

**Entregables:**
- `src/services/seccion.service.ts` (nuevo)
- Lógica de negocio completa
- Tests unitarios de service

---

### 🎯 Fase 6: Controllers y Routes (1-2 días)
**Estado:** ⏳ Pendiente

#### Tareas:
1. **Crear SeccionController**
   ```typescript
   export class SeccionController {
     // CRUD
     async createSeccion(req, res, next): Promise<void>
     async getSecciones(req, res, next): Promise<void>
     async getSeccionById(req, res, next): Promise<void>
     async updateSeccion(req, res, next): Promise<void>
     async deleteSeccion(req, res, next): Promise<void>

     // Horarios
     async agregarHorario(req, res, next): Promise<void>
     async actualizarHorario(req, res, next): Promise<void>
     async eliminarHorario(req, res, next): Promise<void>

     // Docentes
     async asignarDocente(req, res, next): Promise<void>
     async desasignarDocente(req, res, next): Promise<void>

     // Participantes
     async inscribirParticipante(req, res, next): Promise<void>
     async getParticipantes(req, res, next): Promise<void>

     // Reportes
     async getEstadisticas(req, res, next): Promise<void>
   }
   ```

2. **Rutas**
   ```typescript
   // Rutas de secciones
   router.post('/actividades/:id/secciones', seccionController.createSeccion);
   router.get('/actividades/:id/secciones', seccionController.getSecciones);
   router.get('/secciones/:id', seccionController.getSeccionById);
   router.put('/secciones/:id', seccionController.updateSeccion);
   router.delete('/secciones/:id', seccionController.deleteSeccion);

   // Horarios de sección
   router.post('/secciones/:id/horarios', seccionController.agregarHorario);
   router.put('/secciones/:id/horarios/:horarioId', seccionController.actualizarHorario);
   router.delete('/secciones/:id/horarios/:horarioId', seccionController.eliminarHorario);

   // Docentes de sección
   router.post('/secciones/:id/docentes', seccionController.asignarDocente);
   router.delete('/secciones/:id/docentes/:docenteId', seccionController.desasignarDocente);

   // Participantes de sección
   router.post('/secciones/:id/participantes', seccionController.inscribirParticipante);
   router.get('/secciones/:id/participantes', seccionController.getParticipantes);
   ```

**Entregables:**
- `src/controllers/seccion.controller.ts` (nuevo)
- `src/routes/seccion.routes.ts` (nuevo)
- Endpoints documentados

---

### 🎯 Fase 7: Testing (3-4 días)
**Estado:** ⏳ Pendiente

Ver sección [Plan de Pruebas](#plan-de-pruebas) más abajo.

---

### 🎯 Fase 8: Migración y Deploy (1-2 días)
**Estado:** ⏳ Pendiente

#### Tareas:
1. **Preparación**
   - Backup completo de base de datos
   - Prueba de migración en staging
   - Validación de datos migrados

2. **Ejecución**
   - Ejecutar migración en producción
   - Validar datos
   - Monitorear logs

3. **Verificación**
   - Smoke tests
   - Verificación manual
   - Monitoreo de errores

**Entregables:**
- Base de datos migrada
- Logs de migración
- Reporte de validación

---

## 🧪 Plan de Pruebas

### 1. Tests Unitarios

#### Repository Tests
```typescript
describe('SeccionRepository', () => {
  describe('create', () => {
    it('debe crear una sección con horarios');
    it('debe crear una sección con docentes');
    it('debe validar capacidadMaxima positiva');
    it('debe generar código automático si no se provee');
  });

  describe('verificarConflictosHorario', () => {
    it('debe detectar conflicto con otra sección');
    it('debe permitir mismo horario para secciones diferentes');
    it('debe validar conflicto de docente');
    it('debe validar conflicto de aula');
  });

  describe('inscribirParticipante', () => {
    it('debe inscribir participante si hay capacidad');
    it('debe rechazar si sección está llena');
    it('debe prevenir inscripción duplicada');
  });
});
```

#### Service Tests
```typescript
describe('SeccionService', () => {
  describe('createSeccion', () => {
    it('debe crear sección con validaciones completas');
    it('debe validar que la actividad existe');
    it('debe validar que los docentes existen');
    it('debe crear horarios asociados');
  });

  describe('duplicarSeccion', () => {
    it('debe duplicar sección con todos sus datos');
    it('debe generar nuevo nombre único');
    it('debe copiar horarios');
    it('NO debe copiar participantes');
  });
});
```

### 2. Tests de Integración

```typescript
describe('Secciones API Integration', () => {
  beforeEach(async () => {
    // Setup: crear actividad base
  });

  it('debe crear dos secciones con mismo horario', async () => {
    const response1 = await request(app)
      .post('/api/actividades/act001/secciones')
      .send({
        nombre: 'Grupo A',
        capacidadMaxima: 4,
        docenteIds: ['doc001'],
        horarios: [{ diaSemana: 'LUNES', horaInicio: '18:00', horaFin: '19:00' }]
      });

    expect(response1.status).toBe(201);

    const response2 = await request(app)
      .post('/api/actividades/act001/secciones')
      .send({
        nombre: 'Grupo B',
        capacidadMaxima: 4,
        docenteIds: ['doc002'],
        horarios: [{ diaSemana: 'LUNES', horaInicio: '18:00', horaFin: '19:00' }]
      });

    expect(response2.status).toBe(201);
  });

  it('debe rechazar docente en dos secciones al mismo tiempo', async () => {
    // Crear sección 1 con doc001 a las 18:00
    // Intentar crear sección 2 con doc001 a las 18:00
    // Debe fallar
  });

  it('debe rechazar aula en dos secciones al mismo tiempo', async () => {
    // Similar al anterior pero con aulas
  });
});
```

### 3. Tests de Migración

```typescript
describe('Data Migration', () => {
  it('debe migrar todas las actividades a secciones', async () => {
    // Ejecutar migración
    // Verificar que cada actividad tiene al menos una sección
  });

  it('debe preservar todos los horarios', async () => {
    const horariosAntes = await countHorariosActividades();
    // Ejecutar migración
    const horariosDespues = await countHorariosSecciones();
    expect(horariosDespues).toBe(horariosAntes);
  });

  it('debe preservar todas las participaciones', async () => {
    // Similar al anterior
  });

  it('debe preservar relaciones docente-actividad', async () => {
    // Verificar que docentes siguen asociados
  });
});
```

### 4. Tests E2E (Escenarios Completos)

```typescript
describe('Secciones E2E', () => {
  it('Escenario: Crear actividad Piano con 2 grupos paralelos', async () => {
    // 1. Crear actividad "Piano Nivel 1"
    const actividad = await crearActividad({ nombre: 'Piano Nivel 1' });

    // 2. Crear Grupo A con docente María
    const grupoA = await crearSeccion({
      actividadId: actividad.id,
      nombre: 'Grupo A',
      docenteIds: ['maria'],
      horarios: [{ dia: 'LUNES', inicio: '18:00', fin: '19:00' }]
    });

    // 3. Crear Grupo B con docente Juan (mismo horario)
    const grupoB = await crearSeccion({
      actividadId: actividad.id,
      nombre: 'Grupo B',
      docenteIds: ['juan'],
      horarios: [{ dia: 'LUNES', inicio: '18:00', fin: '19:00' }]
    });

    // 4. Inscribir alumnos en cada grupo
    await inscribirParticipante({ seccionId: grupoA.id, personaId: 'alumno1' });
    await inscribirParticipante({ seccionId: grupoB.id, personaId: 'alumno2' });

    // 5. Verificar que cada grupo funciona independiente
    const participantesA = await getParticipantes(grupoA.id);
    const participantesB = await getParticipantes(grupoB.id);

    expect(participantesA).toHaveLength(1);
    expect(participantesB).toHaveLength(1);

    // 6. Verificar horario semanal muestra ambos grupos
    const horarioSemanal = await getHorarioSemanal();
    const lunesActividades = horarioSemanal.LUNES;

    expect(lunesActividades).toHaveLength(2);
    expect(lunesActividades[0].seccion).toBe('Grupo A');
    expect(lunesActividades[1].seccion).toBe('Grupo B');
  });
});
```

### 5. Tests de Performance

```typescript
describe('Performance Tests', () => {
  it('debe listar 100 secciones en menos de 500ms', async () => {
    // Crear 100 secciones
    const inicio = Date.now();
    await getSecciones({ limit: 100 });
    const duracion = Date.now() - inicio;
    expect(duracion).toBeLessThan(500);
  });

  it('debe verificar conflictos en base con 1000 horarios en menos de 1s', async () => {
    // Crear 1000 horarios distribuidos
    const inicio = Date.now();
    await verificarConflictosHorario(seccionId, horario);
    const duracion = Date.now() - inicio;
    expect(duracion).toBeLessThan(1000);
  });
});
```

---

## 🔙 Rollback Strategy

### Escenarios de Rollback

#### Escenario 1: Problemas durante migración
```sql
-- Restaurar desde backup
DROP TABLE IF EXISTS secciones_actividades CASCADE;
DROP TABLE IF EXISTS horarios_secciones CASCADE;
DROP TABLE IF EXISTS participaciones_secciones CASCADE;
DROP TABLE IF EXISTS reservas_aulas_secciones CASCADE;

-- Renombrar tablas backup
ALTER TABLE horarios_actividades_backup RENAME TO horarios_actividades;
ALTER TABLE participacion_actividades_backup RENAME TO participacion_actividades;
ALTER TABLE _DocenteActividad_backup RENAME TO _DocenteActividad;
```

#### Escenario 2: Problemas en producción post-deploy
1. Revertir deploy del código
2. Ejecutar rollback de base de datos
3. Validar que sistema anterior funciona
4. Analizar logs de error

### Checklist de Rollback
- [ ] Backup verificado y disponible
- [ ] Script de rollback probado en staging
- [ ] Equipo notificado
- [ ] Tiempo estimado de downtime comunicado
- [ ] Plan de re-migración definido

---

## 📊 Métricas de Éxito

### Técnicas
- ✅ 0 pérdida de datos en migración
- ✅ 100% de tests passing
- ✅ Cobertura de código > 80%
- ✅ Tiempo de respuesta API < 200ms (p95)
- ✅ 0 errores en logs primeras 24h

### Funcionales
- ✅ Posibilidad de crear grupos paralelos
- ✅ Asignación de docentes por sección
- ✅ Asignación de aulas por sección
- ✅ Inscripción de alumnos por sección
- ✅ Reportes por sección funcionales

---

## 📝 Breaking Changes

### API Changes

#### Deprecados (mantener por 3 meses)
```typescript
// DEPRECADO
POST /api/actividades
{
  "nombre": "Piano",
  "horarios": [...]  // ⚠️ Usar /secciones en su lugar
}

// NUEVO
POST /api/actividades/:id/secciones
{
  "nombre": "Grupo A",
  "horarios": [...]
}
```

#### Eliminados
- `POST /api/actividades/:id/horarios` → Usar `/secciones/:id/horarios`
- `PUT /api/actividades/:id/horarios/:horarioId` → Usar `/secciones/:id/horarios/:horarioId`

### Database Changes
- Tabla `horarios_actividades` → `horarios_secciones`
- Tabla `participacion_actividades` → `participaciones_secciones`

---

## 📚 Documentación Adicional

### Para Desarrolladores
- [ ] Guía de migración de código existente
- [ ] Ejemplos de uso de nuevas APIs
- [ ] Diferencias entre Actividad y Sección

### Para Usuarios
- [ ] Cambios en la UI (futuro)
- [ ] Nuevas funcionalidades disponibles
- [ ] FAQ sobre secciones/grupos

---

## 📅 Timeline Estimado

| Fase | Duración | Inicio | Fin |
|------|----------|--------|-----|
| 1. Diseño | 2 días | Día 1 | Día 2 |
| 2. Schema/Migración | 3 días | Día 3 | Día 5 |
| 3. DTOs | 2 días | Día 6 | Día 7 |
| 4. Repository | 3 días | Día 8 | Día 10 |
| 5. Service | 3 días | Día 11 | Día 13 |
| 6. Controller/Routes | 2 días | Día 14 | Día 15 |
| 7. Testing | 4 días | Día 16 | Día 19 |
| 8. Deploy | 1 día | Día 20 | Día 20 |

**Total estimado: 20 días laborables (4 semanas)**

---

## ✅ Checklist General

### Pre-implementación
- [x] Análisis del problema documentado
- [ ] Diseño aprobado por equipo técnico
- [ ] Plan de migración revisado
- [ ] Backup strategy definida
- [ ] Rollback plan probado

### Implementación
- [ ] Todas las fases completadas
- [ ] Tests pasando (>80% coverage)
- [ ] Documentación actualizada
- [ ] Code review completado
- [ ] Performance tests OK

### Post-implementación
- [ ] Migración ejecutada exitosamente
- [ ] Validación de datos OK
- [ ] Monitoring activo
- [ ] Equipo capacitado
- [ ] Documentación de usuario actualizada

---

**FIN DEL PLAN**

**Próximo paso:** Revisión y aprobación del equipo técnico para proceder con Fase 2.
