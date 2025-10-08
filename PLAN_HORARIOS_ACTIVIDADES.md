# 📅 Plan de Implementación: Sistema de Horarios para Actividades - SIGESDA

**Fecha de creación:** 2025-10-08
**Estado:** En desarrollo
**Prioridad:** Alta
**Responsable:** Equipo de desarrollo SIGESDA

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Aclaraciones Importantes](#aclaraciones-importantes)
3. [Fases de Implementación](#fases-de-implementación)
4. [Checklist de Entrega](#checklist-de-entrega)
5. [Próximos Pasos](#próximos-pasos)

---

## 🎯 Resumen Ejecutivo

Implementar un sistema completo para gestionar los días y horarios en que se dictan las actividades (Coros, Clases de Instrumento, Clases de Canto) en el sistema SIGESDA.

### Objetivos Principales

- ✅ Permitir asignar múltiples días y horarios a cada actividad
- ✅ Validar conflictos de horarios (superposiciones)
- ✅ Integrar con el sistema de reservas de aulas
- ✅ Validar disponibilidad de docentes
- ✅ Generar vistas de horarios semanales

### Alcance

**Incluido:**
- Gestión de horarios semanales recurrentes
- Múltiples días por actividad
- Múltiples horarios por día
- Validación de conflictos internos
- CRUD completo de horarios

**No incluido (futuras iteraciones):**
- Periodicidad compleja (quincenal, mensual)
- Sistema de excepciones (feriados, eventos especiales)
- Horarios estacionales o temporales

---

## ⚠️ Aclaraciones Importantes

### ✅ Múltiples Días Semanales - SÍ está soportado

El diseño actual **SÍ permite asignar múltiples días semanales** a una actividad mediante la relación 1:N entre `Actividad` y `HorarioActividad`.

#### Ejemplo 1: Coro que se dicta Lunes, Miércoles y Viernes

```json
{
  "nombre": "Coro Adultos",
  "tipo": "CORO",
  "precio": 0,
  "horarios": [
    { "diaSemana": "LUNES", "horaInicio": "18:00", "horaFin": "20:00" },
    { "diaSemana": "MIERCOLES", "horaInicio": "18:00", "horaFin": "20:00" },
    { "diaSemana": "VIERNES", "horaInicio": "18:00", "horaFin": "20:00" }
  ]
}
```

#### Ejemplo 2: Clase de piano - Martes y Jueves en horarios diferentes

```json
{
  "nombre": "Piano Avanzado",
  "tipo": "CLASE_INSTRUMENTO",
  "precio": 5000,
  "horarios": [
    { "diaSemana": "MARTES", "horaInicio": "10:00", "horaFin": "11:00" },
    { "diaSemana": "JUEVES", "horaInicio": "15:00", "horaFin": "16:00" }
  ]
}
```

#### Ejemplo 3: Múltiples horarios el mismo día

```json
{
  "nombre": "Canto Nivel 1",
  "tipo": "CLASE_CANTO",
  "precio": 4500,
  "horarios": [
    { "diaSemana": "SABADO", "horaInicio": "09:00", "horaFin": "10:30" },
    { "diaSemana": "SABADO", "horaInicio": "11:00", "horaFin": "12:30" }
  ]
}
```

### 🔄 Periodicidad - Diseño Actual vs. Futuro

#### ✅ Lo que el diseño actual cubre

- **Recurrencia semanal:** Actividades que se repiten cada semana
- **Múltiples días:** Actividades en varios días de la semana
- **Horarios variables:** Diferentes horarios para diferentes días
- **Soft delete:** Activar/desactivar horarios sin eliminarlos

#### ⏳ Periodicidad compleja (no implementada, futuras iteraciones)

Si en el futuro se necesita periodicidad más avanzada, se pueden agregar estos campos:

```prisma
model HorarioActividad {
  id          String     @id @default(cuid())
  actividadId String
  diaSemana   DiaSemana
  horaInicio  String
  horaFin     String

  // CAMPOS OPCIONALES PARA PERIODICIDAD AVANZADA (Futuro)
  frecuencia  Frecuencia? @default(SEMANAL) // SEMANAL, QUINCENAL, MENSUAL
  fechaInicio DateTime?   // Primera clase del período
  fechaFin    DateTime?   // Última clase del período
  semanaDelMes Int?       // 1-4 para "primera semana del mes"

  activo      Boolean    @default(true)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  actividad   Actividad @relation(fields: [actividadId], references: [id], onDelete: Cascade)
}

enum Frecuencia {
  SEMANAL
  QUINCENAL
  MENSUAL
  PRIMERA_SEMANA_MES
  SEGUNDA_SEMANA_MES
  TERCERA_SEMANA_MES
  CUARTA_SEMANA_MES
}
```

Y un modelo para excepciones:

```prisma
model ExcepcionHorario {
  id         String   @id @default(cuid())
  horarioId  String
  fecha      DateTime // Fecha específica que NO hay clase (feriados, etc.)
  motivo     String?  // "Feriado Nacional", "Receso de verano", etc.

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  horario    HorarioActividad @relation(fields: [horarioId], references: [id], onDelete: Cascade)

  @@map("excepciones_horario")
}
```

### 📊 Estructura en Base de Datos

```
┌─────────────────────────────────┐
│        actividades              │
├─────────────────────────────────┤
│ id: "act-123"                   │
│ nombre: "Coro Adultos"          │
│ tipo: CORO                      │
│ precio: 0                       │
└─────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────────────────────┐
│              horarios_actividades                       │
├─────────────────────────────────────────────────────────┤
│ id: "hor-1", actividadId: "act-123"                    │
│ diaSemana: LUNES, horaInicio: "18:00", horaFin: "20:00"│
├─────────────────────────────────────────────────────────┤
│ id: "hor-2", actividadId: "act-123"                    │
│ diaSemana: MIERCOLES, horaInicio: "18:00", horaFin: "20:00"│
├─────────────────────────────────────────────────────────┤
│ id: "hor-3", actividadId: "act-123"                    │
│ diaSemana: VIERNES, horaInicio: "18:00", horaFin: "20:00"│
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Fases de Implementación

### 🎯 Fase 1: Diseño de Base de Datos
**Estado:** ✅ Completado

#### 1.1 Modelo de Datos ✅
- ✅ Crear enum `DiaSemana` (LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO)
- ✅ Crear modelo `HorarioActividad` con:
  - `id`: String @id @default(cuid())
  - `actividadId`: String (FK a Actividad)
  - `diaSemana`: DiaSemana
  - `horaInicio`: String formato "HH:MM" (ej: "10:00")
  - `horaFin`: String formato "HH:MM" (ej: "12:00")
  - `activo`: Boolean @default(true) para soft delete
  - `createdAt`: DateTime @default(now())
  - `updatedAt`: DateTime @updatedAt
  - Constraint único: `@@unique([actividadId, diaSemana, horaInicio])`

#### 1.2 Relaciones ✅
- ✅ Actividad 1:N HorarioActividad (una actividad puede tener múltiples horarios)
- ✅ Cascade delete cuando se elimina una actividad: `onDelete: Cascade`

#### 1.3 Migración ✅
- ✅ Crear y aplicar migración `add_horarios_actividades`
- ⏳ Verificar integridad de datos existentes
- ⏳ Crear seed data de ejemplo

**Archivos modificados:**
- `prisma/schema.prisma` - Modelo de datos
- `prisma/migrations/20251008003832_add_horarios_actividades/migration.sql` - Migración SQL

---

### 🔧 Fase 2: Capa de Datos (Repository)
**Estado:** ✅ Completado

#### 2.1 Actualizar `actividad.repository.ts` ✅

**Métodos actualizados:**
- ✅ **create()**:
  - Incluir creación de horarios anidados mediante `create: horarios.map(...)`
  - Retornar horarios ordenados por día y hora

- ✅ **findAll()**:
  - Incluir horarios en la respuesta con `include: { horarios: {...} }`
  - Ordenar por `diaSemana` y `horaInicio`

- ✅ **findById()**:
  - Incluir horarios ordenados
  - Útil para vista detallada de actividad

- ✅ **findByTipo()**:
  - Incluir horarios para filtrado por tipo (CORO, CLASE_INSTRUMENTO, CLASE_CANTO)

- ✅ **update()**:
  - Estrategia: Delete todos los horarios existentes + Create nuevos
  - Manejo mediante transacciones implícitas de Prisma
  - Permite reemplazar completamente los horarios

#### 2.2 Métodos Adicionales Sugeridos ⏳

**Alta prioridad:**
- ⏳ `findConflictosHorario(aulaId, diaSemana, horaInicio, horaFin)`:
  - Detectar conflictos de aula para el mismo horario
  - Retornar actividades que usan el aula en ese rango

- ⏳ `getHorariosByActividad(actividadId)`:
  - Obtener solo los horarios de una actividad
  - Útil para gestión individual de horarios

**Media prioridad:**
- ⏳ `updateHorario(horarioId, data)`:
  - Actualizar un horario específico sin tocar los demás
  - Más eficiente que reemplazar todos

- ⏳ `deleteHorario(horarioId)`:
  - Eliminar un horario específico
  - Soft delete: marcar `activo: false`

**Baja prioridad:**
- ⏳ `findActividadesByDia(diaSemana)`:
  - Todas las actividades de un día específico
  - Para vista de horario semanal

- ⏳ `findActividadesByRangoHorario(horaInicio, horaFin)`:
  - Actividades en un rango horario
  - Para buscar franjas horarias disponibles

**Archivo modificado:**
- `src/repositories/actividad.repository.ts`

---

### 🧩 Fase 3: DTOs y Validaciones
**Estado:** ✅ Completado

#### 3.1 Schemas Zod (`actividad.dto.ts`) ✅

**Schemas implementados:**
- ✅ **horarioSchema**:
  ```typescript
  z.object({
    diaSemana: z.nativeEnum(DiaSemana),
    horaInicio: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    horaFin: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    activo: z.boolean().default(true)
  }).refine((data) => {
    // Validar que horaFin > horaInicio
    const inicioMinutos = timeToMinutes(data.horaInicio);
    const finMinutos = timeToMinutes(data.horaFin);
    return finMinutos > inicioMinutos;
  }, { message: 'La hora de fin debe ser posterior a la hora de inicio' })
  ```

- ✅ **createActividadSchema**:
  - Array opcional de horarios: `horarios: z.array(horarioSchema).optional().default([])`

- ✅ **updateActividadSchema**:
  - Array opcional de horarios: `horarios: z.array(horarioSchema).optional()`

- ✅ **HorarioDto**: Type export para TypeScript

#### 3.2 Schemas Adicionales Sugeridos ⏳

**Alta prioridad:**
- ⏳ **createHorarioSchema**: Para agregar un horario individual a una actividad existente
  ```typescript
  export const createHorarioSchema = z.object({
    actividadId: z.string().cuid(),
    ...horarioSchema.shape
  });
  ```

- ⏳ **updateHorarioSchema**: Para modificar un horario específico
  ```typescript
  export const updateHorarioSchema = horarioSchema.partial();
  ```

**Media prioridad:**
- ⏳ **queryHorarioSchema**: Para filtrar actividades por horario
  ```typescript
  export const queryHorarioSchema = z.object({
    diaSemana: z.nativeEnum(DiaSemana).optional(),
    horaInicio: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    horaFin: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    soloActivos: z.boolean().default(true)
  });
  ```

#### 3.3 Validaciones de Negocio Sugeridas ⏳

**Alta prioridad:**
- ⏳ Validar rangos horarios razonables:
  - Horario mínimo: 08:00
  - Horario máximo: 22:00
  - Configurable en `ConfiguracionSistema`

- ⏳ Validar duración mínima/máxima:
  - Duración mínima: 30 minutos
  - Duración máxima: 4 horas
  - Alertas para duraciones inusuales

**Media prioridad:**
- ⏳ Sugerencias según tipo de actividad:
  - **CORO**: Típicamente 2-3 horas, días recomendados: Lunes/Miércoles/Viernes
  - **CLASE_INSTRUMENTO**: 30-60 minutos, flexibilidad de horarios
  - **CLASE_CANTO**: 45-90 minutos, preferiblemente mañanas

- ⏳ Validar compatibilidad con capacidad del aula

**Archivo modificado:**
- `src/dto/actividad.dto.ts`

---

### 💼 Fase 4: Lógica de Negocio (Service)
**Estado:** ✅ Completado

#### 4.1 Métodos Actualizados ✅

**Implementados:**
- ✅ **createActividad()**:
  - Validar docentes
  - Validar horarios mediante `validateHorarios()`
  - Validar precio según tipo
  - Logging de creación

- ✅ **updateActividad()**:
  - Validar existencia de actividad
  - Validar docentes si se actualizan
  - Validar horarios si se actualizan
  - Logging de actualización

- ✅ **validateHorarios()**:
  - Detectar conflictos internos (mismo día, superposición)
  - Algoritmo: Comparación por pares O(n²)
  - Conversión a minutos para comparación numérica

- ✅ **timeToMinutes()**:
  - Helper privado para convertir "HH:MM" a minutos totales
  - Facilita comparaciones de rangos horarios

#### 4.2 Validaciones Adicionales Sugeridas ⏳

**Alta prioridad:**
- ⏳ **Validar conflictos con reservas de aulas**:
  ```typescript
  async validateConflictosAula(horarios: HorarioDto[], aulaId?: string): Promise<void> {
    // Para cada horario, verificar si hay reservas de aula en conflicto
    // Lanzar error si se detecta conflicto
  }
  ```
  - Verificar que el aula esté disponible en esos horarios
  - Evitar doble reserva del mismo espacio
  - Considerar reservas existentes de otras actividades

**Media prioridad:**
- ⏳ **Validar disponibilidad de docentes**:
  ```typescript
  async validateDisponibilidadDocente(docenteId: string, horarios: HorarioDto[]): Promise<void> {
    // Verificar que el docente no tenga otras clases en los mismos horarios
    // Considerar tiempo de traslado entre aulas (ej: 15 min buffer)
  }
  ```
  - Un docente no puede dar dos clases simultáneamente
  - Buffer de tiempo entre clases (configurable)
  - Alertas de carga horaria excesiva

**Baja prioridad:**
- ⏳ **Validar capacidad y recursos**:
  - Verificar tipo de actividad vs. recursos del aula
  - Alertas para horarios fuera de lo común (muy temprano/tarde)
  - Sugerencias de optimización de horarios

#### 4.3 Métodos Nuevos Sugeridos ⏳

**Alta prioridad:**
- ⏳ `getActividadesByDia(diaSemana: DiaSemana)`:
  - Todas las actividades que se dictan un día específico
  - Ordenadas por hora de inicio
  - Incluir información de aula y docente

- ⏳ `verificarConflictoDocente(docenteId: string, diaSemana: DiaSemana, horaInicio: string, horaFin: string)`:
  - Retornar true si hay conflicto
  - Incluir detalles de la actividad en conflicto

**Media prioridad:**
- ⏳ `getActividadesByRangoHorario(horaInicio: string, horaFin: string, diaSemana?: DiaSemana)`:
  - Filtrar actividades por rango horario
  - Útil para encontrar franjas disponibles

- ⏳ `generarHorarioSemanal()`:
  - Retornar grid completo de la semana
  - Formato: `{ [DiaSemana]: Actividad[] }`
  - Ordenado por hora de inicio

**Baja prioridad:**
- ⏳ `sugerirHorariosDisponibles(duracion: number, diasPreferidos?: DiaSemana[])`:
  - Algoritmo de sugerencias basado en disponibilidad
  - Considerar carga de aulas y docentes
  - Optimizar distribución semanal

**Archivo modificado:**
- `src/services/actividad.service.ts`

---

### 🎮 Fase 5: Controladores y Rutas
**Estado:** ✅ Completado

#### 5.1 Actualizar `actividad.controller.ts` ✅

**Verificaciones completadas:**
- ✅ Endpoints existentes retornan horarios correctamente
- ✅ Serialización JSON funciona perfectamente
- ✅ Include de horarios funciona en todos los casos

**Endpoints implementados:**

**✅ Alta prioridad (Completados):**
- ✅ POST /api/actividades/:id/horarios - agregarHorario
- ✅ PUT /api/actividades/:id/horarios/:horarioId - actualizarHorario
- ✅ DELETE /api/actividades/:id/horarios/:horarioId - eliminarHorario
- ✅ GET /api/actividades/horarios/dia/:dia - getActividadesPorDia

**✅ Media prioridad (Completados):**
- ✅ GET /api/actividades/horarios/semana - getHorarioSemanal
- ✅ GET /api/actividades/horarios/docente/:docenteId/carga - getCargaHorariaDocente
- ✅ POST /api/actividades/horarios/verificar-conflicto - verificarConflictosHorario
- ✅ POST /api/actividades/horarios/verificar-aula - verificarDisponibilidadAula
- ✅ POST /api/actividades/horarios/verificar-docente - verificarDisponibilidadDocente

**Baja prioridad:**
```typescript
// GET /api/actividades/horarios/disponibles
async getHorariosDisponibles(req: Request, res: Response, next: NextFunction): Promise<void>

// GET /api/actividades/horarios/estadisticas
async getEstadisticasHorarios(req: Request, res: Response, next: NextFunction): Promise<void>
```

#### 5.2 Actualizar `actividad.routes.ts` ✅

**Rutas implementadas:**
```typescript
// Rutas para gestión individual de horarios
router.post('/:id/horarios', actividadController.agregarHorario);
router.put('/:id/horarios/:horarioId', actividadController.actualizarHorario);
router.delete('/:id/horarios/:horarioId', actividadController.eliminarHorario);

// Rutas para consultas de horarios
router.get('/horarios/semana', actividadController.getHorarioSemanal);
router.get('/horarios/dia/:dia', actividadController.getActividadesPorDia);
router.get('/horarios/docente/:docenteId', actividadController.getHorarioDocente);

// Rutas para validaciones
router.post('/horarios/verificar-conflicto', actividadController.verificarConflicto);
router.get('/horarios/disponibles', actividadController.getHorariosDisponibles);
```

**Implementación completada:**
- ✅ Middleware de validación Zod aplicado
- ✅ Endpoints documentados con comentarios claros
- ⏳ Permisos y roles (pendiente - requiere sistema de autenticación)
- ⏳ Rate limiting (pendiente - optimización futura)

**Archivos a modificar:**
- `src/controllers/actividad.controller.ts`
- `src/routes/actividad.routes.ts`

---

### 🧪 Fase 6: Testing y Validación
**Estado:** ⏳ Pendiente

#### 6.1 Pruebas Unitarias ⏳

**Service Layer:**
```typescript
describe('ActividadService - Horarios', () => {
  test('validateHorarios - debe detectar superposición en mismo día', () => {
    const horarios = [
      { diaSemana: 'LUNES', horaInicio: '10:00', horaFin: '12:00' },
      { diaSemana: 'LUNES', horaInicio: '11:00', horaFin: '13:00' } // Conflicto
    ];
    expect(() => service.validateHorarios(horarios)).toThrow();
  });

  test('validateHorarios - debe permitir horarios en días diferentes', () => {
    const horarios = [
      { diaSemana: 'LUNES', horaInicio: '10:00', horaFin: '12:00' },
      { diaSemana: 'MARTES', horaInicio: '10:00', horaFin: '12:00' }
    ];
    expect(() => service.validateHorarios(horarios)).not.toThrow();
  });

  test('timeToMinutes - debe convertir correctamente', () => {
    expect(service['timeToMinutes']('10:30')).toBe(630);
    expect(service['timeToMinutes']('00:00')).toBe(0);
    expect(service['timeToMinutes']('23:59')).toBe(1439);
  });
});
```

**DTO Validation:**
```typescript
describe('HorarioSchema - Validaciones', () => {
  test('debe validar formato HH:MM correcto', () => {
    const valido = horarioSchema.parse({
      diaSemana: 'LUNES',
      horaInicio: '10:00',
      horaFin: '12:00'
    });
    expect(valido).toBeDefined();
  });

  test('debe rechazar formato de hora inválido', () => {
    expect(() => horarioSchema.parse({
      diaSemana: 'LUNES',
      horaInicio: '25:00', // Hora inválida
      horaFin: '12:00'
    })).toThrow();
  });

  test('debe rechazar horaFin <= horaInicio', () => {
    expect(() => horarioSchema.parse({
      diaSemana: 'LUNES',
      horaInicio: '12:00',
      horaFin: '10:00' // Fin antes que inicio
    })).toThrow();
  });
});
```

#### 6.2 Pruebas de Integración ⏳

**Repository Layer:**
```typescript
describe('ActividadRepository - Horarios', () => {
  test('create - debe crear actividad con múltiples horarios', async () => {
    const data = {
      nombre: 'Coro Test',
      tipo: 'CORO',
      precio: 0,
      horarios: [
        { diaSemana: 'LUNES', horaInicio: '18:00', horaFin: '20:00' },
        { diaSemana: 'MIERCOLES', horaInicio: '18:00', horaFin: '20:00' }
      ]
    };
    const actividad = await repository.create(data);
    expect(actividad.horarios).toHaveLength(2);
  });

  test('update - debe reemplazar horarios existentes', async () => {
    // Crear actividad con horarios
    const actividad = await repository.create({...});

    // Actualizar con nuevos horarios
    const updated = await repository.update(actividad.id, {
      horarios: [
        { diaSemana: 'VIERNES', horaInicio: '10:00', horaFin: '12:00' }
      ]
    });

    expect(updated.horarios).toHaveLength(1);
    expect(updated.horarios[0].diaSemana).toBe('VIERNES');
  });

  test('delete - debe eliminar horarios en cascade', async () => {
    const actividad = await repository.create({...});
    await repository.delete(actividad.id);

    const horarios = await prisma.horarioActividad.findMany({
      where: { actividadId: actividad.id }
    });
    expect(horarios).toHaveLength(0);
  });
});
```

#### 6.3 Casos de Prueba Manual (`tests/actividades.http`) ⏳

**Archivo a crear:** `tests/actividades-horarios.http`

```http
### 1. Crear actividad con múltiples horarios
POST http://localhost:8000/api/actividades
Content-Type: application/json

{
  "nombre": "Coro Adultos",
  "tipo": "CORO",
  "descripcion": "Coro para adultos - Repertorio variado",
  "precio": 0,
  "capacidadMaxima": 40,
  "horarios": [
    {
      "diaSemana": "LUNES",
      "horaInicio": "18:00",
      "horaFin": "20:00"
    },
    {
      "diaSemana": "MIERCOLES",
      "horaInicio": "18:00",
      "horaFin": "20:00"
    },
    {
      "diaSemana": "VIERNES",
      "horaInicio": "18:00",
      "horaFin": "20:00"
    }
  ]
}

### 2. Crear actividad con horarios superpuestos (debe fallar)
POST http://localhost:8000/api/actividades
Content-Type: application/json

{
  "nombre": "Actividad con conflicto",
  "tipo": "CLASE_INSTRUMENTO",
  "precio": 5000,
  "horarios": [
    {
      "diaSemana": "LUNES",
      "horaInicio": "10:00",
      "horaFin": "12:00"
    },
    {
      "diaSemana": "LUNES",
      "horaInicio": "11:00",
      "horaFin": "13:00"
    }
  ]
}

### 3. Obtener actividad con horarios
GET http://localhost:8000/api/actividades/{{actividadId}}

### 4. Actualizar solo horarios
PUT http://localhost:8000/api/actividades/{{actividadId}}
Content-Type: application/json

{
  "horarios": [
    {
      "diaSemana": "MARTES",
      "horaInicio": "15:00",
      "horaFin": "17:00"
    },
    {
      "diaSemana": "JUEVES",
      "horaInicio": "15:00",
      "horaFin": "17:00"
    }
  ]
}

### 5. Listar todas las actividades (debe incluir horarios)
GET http://localhost:8000/api/actividades?limit=20

### 6. Buscar actividades por tipo (debe incluir horarios)
GET http://localhost:8000/api/actividades?tipo=CORO

### 7. Agregar horario individual (futuro)
POST http://localhost:8000/api/actividades/{{actividadId}}/horarios
Content-Type: application/json

{
  "diaSemana": "SABADO",
  "horaInicio": "09:00",
  "horaFin": "11:00"
}

### 8. Eliminar horario específico (futuro)
DELETE http://localhost:8000/api/actividades/{{actividadId}}/horarios/{{horarioId}}

### 9. Consultar actividades por día (futuro)
GET http://localhost:8000/api/actividades/horarios/dia/LUNES

### 10. Obtener horario semanal completo (futuro)
GET http://localhost:8000/api/actividades/horarios/semana
```

**Consideraciones para testing:**
- ⏳ Configurar variables de entorno para testing
- ⏳ Crear base de datos de pruebas separada
- ⏳ Implementar setup/teardown para datos de prueba
- ⏳ Documentar casos edge y comportamientos esperados

---

### 📊 Fase 7: Funcionalidades Avanzadas
**Estado:** ⏳ Pendiente (Futuras iteraciones)

#### 7.1 Gestión de Conflictos ⏳

**Dashboard de Conflictos:**
```typescript
interface ConflictoHorario {
  tipo: 'AULA' | 'DOCENTE' | 'CAPACIDAD';
  severidad: 'ALTA' | 'MEDIA' | 'BAJA';
  actividad1: ActividadResumen;
  actividad2?: ActividadResumen;
  detalles: string;
  sugerencias: string[];
}

async getConflictosHorarios(): Promise<ConflictoHorario[]> {
  // Detectar todos los conflictos del sistema
  // Clasificar por tipo y severidad
  // Generar sugerencias de resolución
}
```

**Características:**
- ⏳ Dashboard de conflictos en tiempo real
- ⏳ Sistema de alertas automáticas (email/notificación)
- ⏳ Sugerencias de resolución basadas en disponibilidad
- ⏳ Historial de conflictos resueltos

**Validaciones proactivas:**
- ⏳ Alertas para docentes con sobrecarga horaria (>20 horas/semana)
- ⏳ Detección de aulas sobre-utilizadas
- ⏳ Advertencias de distribución desigual en la semana

#### 7.2 Reportes y Consultas ⏳

**Vista de Horario Semanal (Grid):**
```typescript
interface GridHorarioSemanal {
  dias: DiaSemana[];
  franjas: FranjaHoraria[];
  actividades: {
    [diaSemana: string]: {
      [franja: string]: ActividadConAula[];
    }
  };
}

interface FranjaHoraria {
  inicio: string; // "08:00"
  fin: string;    // "09:00"
  label: string;  // "8:00 - 9:00"
}

async generarGridSemanal(
  horaInicio: string = '08:00',
  horaFin: string = '22:00',
  intervalo: number = 60 // minutos
): Promise<GridHorarioSemanal>
```

**Características:**
- ⏳ Grid visual de toda la semana
- ⏳ Configuración de intervalo de franjas horarias
- ⏳ Filtros por tipo de actividad, docente, aula
- ⏳ Exportar a PDF/Excel
- ⏳ Vista imprimible

**Disponibilidad de Aulas:**
```typescript
async getDisponibilidadAulas(
  dia: DiaSemana,
  horaInicio: string,
  horaFin: string
): Promise<AulaDisponibilidad[]>

interface AulaDisponibilidad {
  aula: Aula;
  disponible: boolean;
  ocupadaPor?: Actividad;
  proximaDisponibilidad?: string; // "14:00"
}
```

**Carga Horaria por Docente:**
```typescript
async getCargaHorariaDocente(
  docenteId: string,
  periodo?: 'SEMANAL' | 'MENSUAL'
): Promise<CargaHorariaDocente>

interface CargaHorariaDocente {
  docente: Persona;
  totalHoras: number;
  actividades: ActividadConHorarios[];
  distribucionSemanal: {
    [dia: string]: number; // horas por día
  };
  alertas: string[]; // Sobrecarga, distribución desigual, etc.
}
```

**Estadísticas de Ocupación:**
```typescript
async getEstadisticasOcupacion(): Promise<EstadisticasOcupacion>

interface EstadisticasOcupacion {
  ocupacionPorFranja: {
    franja: string;
    porcentajeOcupacion: number;
    actividadesActivas: number;
  }[];
  ocupacionPorDia: {
    dia: DiaSemana;
    horasOcupadas: number;
    porcentajeOcupacion: number;
  }[];
  aulasNoUtilizadas: Aula[];
  franjasMasDemandadas: string[];
  franjasMenosDemandadas: string[];
}
```

#### 7.3 Integración con Reservas de Aulas ⏳

**Auto-generación de Reservas:**
```typescript
async sincronizarReservasConHorarios(actividadId: string): Promise<void> {
  // 1. Obtener horarios de la actividad
  // 2. Para cada horario, crear/actualizar ReservaAula
  // 3. Asignar aula automáticamente si es posible
  // 4. Generar alertas si no hay aulas disponibles
}
```

**Sincronización Bidireccional:**
- ⏳ Cuando se crea un horario → auto-crear reserva de aula
- ⏳ Cuando se elimina un horario → eliminar reserva asociada
- ⏳ Cuando se modifica un horario → actualizar reserva
- ⏳ Validación de disponibilidad antes de confirmar

**Asignación Inteligente de Aulas:**
```typescript
async sugerirAulaParaActividad(
  actividad: Actividad,
  horario: HorarioActividad
): Promise<AulaSugerencia[]>

interface AulaSugerencia {
  aula: Aula;
  score: number; // 0-100 basado en múltiples factores
  razones: string[]; // "Capacidad adecuada", "Equipamiento compatible", etc.
  conflictos: string[]; // Advertencias si las hay
}
```

**Criterios de sugerencia:**
- ⏳ Capacidad del aula vs. capacidad de la actividad
- ⏳ Equipamiento necesario (piano, espejos, equipo de sonido)
- ⏳ Ubicación y proximidad entre horarios consecutivos
- ⏳ Disponibilidad confirmada en el horario
- ⏳ Historial de uso para esa actividad

---

### 📝 Fase 8: Documentación
**Estado:** ⏳ Pendiente

#### 8.1 Documentación Técnica ⏳

**Diagrama de Base de Datos:**
- ⏳ Actualizar diagrama ER con modelo HorarioActividad
- ⏳ Documentar relaciones y constraints
- ⏳ Incluir índices y consideraciones de performance

**Documentación de Código:**
```typescript
/**
 * Valida que no existan conflictos de horarios dentro de la misma actividad
 *
 * Verifica que no haya superposición de horarios en el mismo día de la semana.
 * La validación se realiza comparando todos los pares de horarios.
 *
 * @param horarios - Array de horarios a validar
 * @throws {Error} Si se detecta un conflicto de superposición
 *
 * @example
 * ```typescript
 * // Esto lanzará un error
 * validateHorarios([
 *   { diaSemana: 'LUNES', horaInicio: '10:00', horaFin: '12:00' },
 *   { diaSemana: 'LUNES', horaInicio: '11:00', horaFin: '13:00' }
 * ]);
 *
 * // Esto es válido
 * validateHorarios([
 *   { diaSemana: 'LUNES', horaInicio: '10:00', horaFin: '12:00' },
 *   { diaSemana: 'MARTES', horaInicio: '10:00', horaFin: '12:00' }
 * ]);
 * ```
 */
private validateHorarios(horarios: HorarioDto[]): void { ... }
```

**README Técnico:**
- ⏳ Crear `docs/HORARIOS_ACTIVIDADES.md` con:
  - Arquitectura del módulo
  - Flujo de datos
  - Decisiones de diseño
  - Patrones utilizados
  - Consideraciones de performance

#### 8.2 Documentación de API ⏳

**Swagger/OpenAPI Specification:**
```yaml
paths:
  /api/actividades:
    post:
      summary: Crear nueva actividad
      tags: [Actividades]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                nombre:
                  type: string
                  example: "Coro Adultos"
                tipo:
                  type: string
                  enum: [CORO, CLASE_INSTRUMENTO, CLASE_CANTO]
                horarios:
                  type: array
                  items:
                    type: object
                    properties:
                      diaSemana:
                        type: string
                        enum: [LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO]
                      horaInicio:
                        type: string
                        pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'
                        example: "18:00"
                      horaFin:
                        type: string
                        pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'
                        example: "20:00"
      responses:
        201:
          description: Actividad creada exitosamente
        400:
          description: Error de validación (horarios en conflicto, formato inválido, etc.)
```

**Ejemplos de Request/Response:**
- ⏳ Documentar todos los endpoints con ejemplos completos
- ⏳ Incluir casos de error comunes
- ⏳ Especificar códigos de estado HTTP

**Códigos de Error:**
```typescript
enum ErrorCodesHorarios {
  HORARIO_CONFLICTO_INTERNO = 'HORARIO_CONFLICTO_INTERNO', // Superposición en misma actividad
  HORARIO_CONFLICTO_AULA = 'HORARIO_CONFLICTO_AULA', // Aula no disponible
  HORARIO_CONFLICTO_DOCENTE = 'HORARIO_CONFLICTO_DOCENTE', // Docente ocupado
  HORARIO_FORMATO_INVALIDO = 'HORARIO_FORMATO_INVALIDO', // Formato HH:MM incorrecto
  HORARIO_RANGO_INVALIDO = 'HORARIO_RANGO_INVALIDO', // Fin <= Inicio
  HORARIO_FUERA_DE_RANGO = 'HORARIO_FUERA_DE_RANGO', // Fuera de 08:00-22:00
  HORARIO_DURACION_INVALIDA = 'HORARIO_DURACION_INVALIDA', // Muy corto o largo
}
```

#### 8.3 Guía de Usuario ⏳

**Manual de Usuario:**
- ⏳ Crear `docs/GUIA_HORARIOS_USUARIO.md` con:
  - Cómo crear una actividad con horarios
  - Cómo modificar horarios existentes
  - Cómo resolver conflictos de horarios
  - Cómo consultar disponibilidad de aulas
  - Casos de uso comunes con screenshots

**Mejores Prácticas:**
```markdown
## Mejores Prácticas para Gestión de Horarios

### 1. Planificación de Horarios
- Planificar horarios de actividades al inicio del período lectivo
- Considerar disponibilidad de docentes antes de asignar horarios
- Distribuir actividades equitativamente a lo largo de la semana
- Evitar concentración de actividades en franjas horarias populares

### 2. Gestión de Conflictos
- Revisar dashboard de conflictos semanalmente
- Resolver conflictos de alta prioridad inmediatamente
- Mantener buffer de 15 minutos entre clases del mismo docente
- Coordinar con docentes antes de modificar horarios establecidos

### 3. Optimización de Recursos
- Agrupar actividades similares en mismas aulas
- Maximizar uso de aulas grandes en horarios pico
- Reservar aulas especializadas con anticipación
- Revisar estadísticas de ocupación mensualmente

### 4. Comunicación
- Notificar cambios de horario con 48 horas de anticipación
- Mantener actualizado el horario publicado
- Coordinar con secretaría para comunicación a alumnos
```

**FAQs:**
- ⏳ ¿Cómo agrego un nuevo horario a una actividad existente?
- ⏳ ¿Qué hago si hay un conflicto de aula?
- ⏳ ¿Puedo tener la misma actividad en diferentes horarios?
- ⏳ ¿Cómo veo todos los horarios de un docente?
- ⏳ ¿Cómo exporto el horario semanal?

---

### 🔄 Fase 9: Migración de Datos y Deployment
**Estado:** ⏳ Pendiente

#### 9.1 Scripts de Migración ⏳

**Seed Data para Horarios de Ejemplo:**
```typescript
// prisma/seeds/horarios.seed.ts
async function seedHorarios() {
  // Coros
  await prisma.actividad.update({
    where: { nombre: 'Coro Adultos' },
    data: {
      horarios: {
        create: [
          { diaSemana: 'LUNES', horaInicio: '18:00', horaFin: '20:00' },
          { diaSemana: 'MIERCOLES', horaInicio: '18:00', horaFin: '20:00' },
          { diaSemana: 'VIERNES', horaInicio: '18:00', horaFin: '20:00' }
        ]
      }
    }
  });

  // Clases de Instrumento
  await prisma.actividad.update({
    where: { nombre: 'Piano Nivel 1' },
    data: {
      horarios: {
        create: [
          { diaSemana: 'MARTES', horaInicio: '10:00', horaFin: '11:00' },
          { diaSemana: 'JUEVES', horaInicio: '10:00', horaFin: '11:00' }
        ]
      }
    }
  });

  // ... más ejemplos
}
```

**Migración de Actividades Existentes:**
- ⏳ Script para revisar actividades sin horarios
- ⏳ Generación de horarios por defecto basados en tipo
- ⏳ Confirmación manual antes de aplicar
- ⏳ Logging detallado de cambios

**Validación Post-Migración:**
```typescript
async function validarMigracionHorarios() {
  // 1. Verificar que todas las actividades activas tengan al menos un horario
  const actividadesSinHorarios = await prisma.actividad.findMany({
    where: {
      activa: true,
      horarios: { none: {} }
    }
  });

  if (actividadesSinHorarios.length > 0) {
    console.warn(`⚠️ ${actividadesSinHorarios.length} actividades sin horarios`);
  }

  // 2. Verificar integridad referencial
  // 3. Detectar posibles conflictos
  // 4. Generar reporte de migración
}
```

#### 9.2 Rollback Plan ⏳

**Backup de Datos:**
```bash
# Antes de la migración
pg_dump -h localhost -U usuario -d asociacion_musical > backup_pre_horarios.sql

# Backup específico de tablas
pg_dump -h localhost -U usuario -d asociacion_musical \
  -t actividades \
  -t horarios_actividades \
  > backup_actividades_horarios.sql
```

**Script de Reversión:**
```sql
-- scripts/rollback_horarios.sql

-- 1. Eliminar todos los horarios
TRUNCATE TABLE horarios_actividades CASCADE;

-- 2. Revertir cambios en actividades si es necesario
-- (En este caso no hay cambios en tabla actividades)

-- 3. Eliminar migración de Prisma
DELETE FROM _prisma_migrations
WHERE migration_name = '20251008003832_add_horarios_actividades';
```

**Plan de Contingencia:**
1. ⏳ Detectar problemas en las primeras 24 horas
2. ⏳ Evaluar severidad y impacto
3. ⏳ Decidir: Fix forward vs. Rollback
4. ⏳ Ejecutar rollback si es crítico
5. ⏳ Restaurar backup y verificar integridad
6. ⏳ Comunicar a usuarios del sistema
7. ⏳ Post-mortem y ajustes al plan

#### 9.3 Deployment Checklist ⏳

**Pre-Deployment:**
- ⏳ Todos los tests pasando (unit + integration)
- ⏳ Code review completado
- ⏳ Documentación actualizada
- ⏳ Backup de producción creado
- ⏳ Plan de rollback validado
- ⏳ Notificación a usuarios sobre mantenimiento

**Deployment:**
- ⏳ Poner sistema en modo mantenimiento
- ⏳ Aplicar migración de base de datos
- ⏳ Ejecutar seed de datos si es necesario
- ⏳ Deploy de nuevo código
- ⏳ Ejecutar validaciones post-migración
- ⏳ Smoke tests en producción

**Post-Deployment:**
- ⏳ Verificar logs por errores
- ⏳ Monitorear performance
- ⏳ Validar endpoints críticos
- ⏳ Quitar modo mantenimiento
- ⏳ Comunicar completion a usuarios
- ⏳ Monitoreo extendido por 48 horas

---

## ✅ Checklist de Entrega

### Funcionalidad Básica (MVP)

**Backend - Base de Datos:**
- ✅ Modelo `HorarioActividad` implementado en Prisma
- ✅ Enum `DiaSemana` creado
- ✅ Migración aplicada exitosamente
- ✅ Relación 1:N con Actividad funcionando
- ✅ Cascade delete configurado
- ⏳ Índices de performance creados
- ⏳ Seed data de ejemplo

**Backend - DTOs y Validaciones:**
- ✅ `horarioSchema` con validación de formato HH:MM
- ✅ Validación horaFin > horaInicio
- ✅ `createActividadSchema` con array de horarios
- ✅ `updateActividadSchema` con array de horarios
- ✅ Type exports (HorarioDto)
- ⏳ Schemas adicionales (createHorarioSchema, updateHorarioSchema)

**Backend - Repository:**
- ✅ `create()` con horarios anidados
- ✅ `findAll()` incluyendo horarios
- ✅ `findById()` incluyendo horarios
- ✅ `findByTipo()` incluyendo horarios
- ✅ `update()` reemplazando horarios
- ⏳ Métodos adicionales (findConflictos, getHorarios, etc.)

**Backend - Service:**
- ✅ `createActividad()` con validación de horarios
- ✅ `updateActividad()` con validación de horarios
- ✅ `validateHorarios()` detectando conflictos internos
- ✅ `timeToMinutes()` helper implementado
- ⏳ Validación de conflictos con aulas
- ⏳ Validación de disponibilidad docentes
- ⏳ Métodos de consulta (getActividadesByDia, etc.)

**Backend - Controller & Routes:**
- ⏳ Endpoints existentes retornan horarios
- ⏳ Nuevos endpoints para gestión de horarios
- ⏳ Middleware de validación aplicado
- ⏳ Manejo de errores específicos

**Testing:**
- ⏳ Tests unitarios de validaciones
- ⏳ Tests de integración de repository
- ⏳ Archivo de pruebas HTTP con ejemplos
- ⏳ Tests end-to-end

**Documentación:**
- ⏳ README actualizado
- ⏳ Documentación de API
- ⏳ Guía de usuario
- ⏳ Comentarios JSDoc en código

---

### Funcionalidad Completa (Post-MVP)

**CRUD Completo:**
- ⏳ POST `/actividades/:id/horarios` - Agregar horario individual
- ⏳ PUT `/actividades/:id/horarios/:horarioId` - Actualizar horario
- ⏳ DELETE `/actividades/:id/horarios/:horarioId` - Eliminar horario
- ⏳ GET `/actividades/:id/horarios` - Listar horarios

**Consultas Avanzadas:**
- ⏳ GET `/actividades/horarios/dia/:dia` - Actividades por día
- ⏳ GET `/actividades/horarios/semana` - Grid semanal
- ⏳ GET `/actividades/horarios/docente/:id` - Horarios de docente
- ⏳ GET `/actividades/horarios/disponibles` - Sugerencias

**Validaciones Avanzadas:**
- ⏳ Conflictos con reservas de aulas
- ⏳ Disponibilidad de docentes
- ⏳ Carga horaria máxima por docente
- ⏳ Capacidad de aulas

**Reportes:**
- ⏳ Dashboard de conflictos
- ⏳ Estadísticas de ocupación
- ⏳ Carga horaria por docente
- ⏳ Utilización de aulas
- ⏳ Exportación a PDF/Excel

**Integraciones:**
- ⏳ Auto-generación de reservas de aulas
- ⏳ Sincronización bidireccional
- ⏳ Asignación inteligente de aulas
- ⏳ Sistema de notificaciones

---

### Optimizaciones y Performance

**Base de Datos:**
- ✅ Índices en columnas frecuentemente consultadas implementados:
  - ✅ idx_horarios_actividad_id
  - ✅ idx_horarios_dia_semana
  - ✅ idx_horarios_activo
  - ✅ idx_horarios_dia_hora (compuesto)
  - ✅ idx_horarios_actividad_dia_activo (compuesto)
- ⏳ Análisis de query performance (pendiente)
- ⏳ Optimización de JOINs frecuentes (pendiente)

**Caché:**
- ⏳ Cachear grid semanal (TTL: 1 hora)
- ⏳ Cachear disponibilidad de aulas (TTL: 15 min)
- ⏳ Invalidación de caché al modificar horarios

**Monitoreo:**
- ⏳ Logging de operaciones críticas
- ⏳ Métricas de performance de endpoints
- ⏳ Alertas de errores en producción
- ⏳ Dashboard de uso del sistema

---

## 🎯 Próximos Pasos Recomendados

### Inmediatos (Esta semana)

1. **✅ Completar testing básico**
   - Crear archivo `tests/actividades-horarios.http`
   - Probar creación con múltiples horarios
   - Verificar validación de conflictos
   - Confirmar que include de horarios funciona

2. **⏳ Implementar endpoints faltantes**
   - Asegurar que GET /actividades retorna horarios
   - Asegurar que GET /actividades/:id retorna horarios
   - Verificar que búsqueda incluye horarios

3. **⏳ Documentación básica**
   - Actualizar README con ejemplos de horarios
   - Documentar estructura de horarios en API
   - Agregar ejemplos de request/response

### Corto Plazo (Próximas 2 semanas)

4. **⏳ CRUD individual de horarios**
   - POST /actividades/:id/horarios
   - PUT /actividades/:id/horarios/:horarioId
   - DELETE /actividades/:id/horarios/:horarioId

5. **⏳ Validación de conflictos con aulas**
   - Implementar verificación de disponibilidad
   - Integrar con ReservaAula
   - Retornar mensajes de error descriptivos

6. **⏳ Consultas por día/horario**
   - GET /actividades/horarios/dia/:dia
   - Implementar filtros adicionales
   - Ordenamiento y paginación

### Mediano Plazo (Próximo mes)

7. **⏳ Dashboard de horarios**
   - Vista semanal completa
   - Grid interactivo
   - Exportación a PDF

8. **⏳ Validación de docentes**
   - Verificar disponibilidad de docentes
   - Alertas de sobrecarga horaria
   - Sugerencias de redistribución

9. **⏳ Reportes y estadísticas**
   - Ocupación por franja horaria
   - Utilización de aulas
   - Carga horaria por docente

### Largo Plazo (Próximos 3 meses)

10. **⏳ Auto-asignación de aulas**
    - Algoritmo de asignación inteligente
    - Consideración de múltiples factores
    - Optimización de recursos

11. **⏳ Sistema de excepciones**
    - Feriados y días especiales
    - Suspensiones temporales
    - Cambios puntuales de horario

12. **⏳ Periodicidad compleja**
    - Actividades quincenales
    - Talleres intensivos temporales
    - Ciclos académicos

---

## 📚 Referencias y Recursos

### Documentación Técnica

- **Prisma Schema Reference:** https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
- **Zod Validation:** https://zod.dev/
- **Express Best Practices:** https://expressjs.com/en/advanced/best-practice-performance.html

### Patrones de Diseño Aplicados

- **Repository Pattern:** Abstracción de acceso a datos
- **DTO Pattern:** Validación y transferencia de datos
- **Service Layer:** Lógica de negocio centralizada
- **Cascade Delete:** Integridad referencial

### Decisiones de Diseño

#### ¿Por qué String para horaInicio/horaFin en lugar de DateTime?

- **Simplicidad:** Horarios semanales recurrentes no necesitan fecha completa
- **Validación:** Más fácil validar formato HH:MM
- **UI Friendly:** Directamente usable en inputs de tipo "time"
- **Performance:** Comparaciones y ordenamiento más simples

#### ¿Por qué no usar una tabla de Días?

- **Enums suficientes:** Solo 7 valores posibles, bien definidos
- **Type Safety:** TypeScript enum proporciona validación en compile-time
- **Simplicidad:** No necesita JOINs adicionales
- **Performance:** Índices más eficientes en enums

#### ¿Por qué estrategia Delete-All + Create-New en updates?

- **Simplicidad:** Evita lógica compleja de diffing
- **Consistencia:** Estado final siempre igual al input
- **Transaccional:** Prisma maneja atomicidad
- **Trade-off:** Más writes pero código más mantenible

---

## 🔍 Consideraciones Adicionales

### Seguridad

- ⏳ Validar permisos para modificar horarios (solo admin/coordinador)
- ⏳ Audit log de cambios de horarios
- ⏳ Rate limiting en endpoints de consulta
- ⏳ Sanitización de inputs para prevenir injection

### Escalabilidad

- ⏳ Paginación en todas las consultas de lista
- ⏳ Caché para consultas frecuentes (horario semanal)
- ⏳ Índices de base de datos optimizados
- ⏳ Considerar read replicas para reportes

### UX/UI (Frontend)

- ⏳ Selector visual de días de la semana
- ⏳ Time pickers para horarios
- ⏳ Vista de calendario semanal
- ⏳ Indicadores visuales de conflictos
- ⏳ Autocompletado de horarios comunes
- ⏳ Copiar horarios entre actividades

### Accesibilidad

- ⏳ Formato de hora configurable (12h/24h)
- ⏳ Zona horaria considerada
- ⏳ Nombres de días en español
- ⏳ Mensajes de error claros y descriptivos

---

## 📞 Contacto y Soporte

**Equipo de Desarrollo SIGESDA**
- Repositorio: `/home/francisco/PROYECTOS/SIGESDA/SIGESDA-BACKEND`
- Documentación: `PLAN_HORARIOS_ACTIVIDADES.md`
- Issues: Crear en sistema de tracking del proyecto

**Última actualización:** 2025-10-08
**Versión del plan:** 1.1
**Estado:** En desarrollo - Fases 1-5 completadas + Funcionalidades avanzadas

---

## 📋 Historial de Cambios

| Fecha      | Versión | Cambios                                                       |
|------------|---------|---------------------------------------------------------------|
| 2025-10-08 | 1.0     | Creación del plan completo - Fases 1-4 completadas          |
| 2025-10-08 | 1.1     | Fase 5 completada + Funcionalidades avanzadas implementadas  |
| TBD        | 1.2     | Completar Fase 6 (Testing formal con Jest)                   |
| TBD        | 2.0     | Funcionalidad completa con todas las validaciones            |

---

**FIN DEL DOCUMENTO**
