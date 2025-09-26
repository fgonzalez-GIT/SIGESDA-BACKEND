# 📋 Plan de Trabajo - CRUDs Restantes SIGESDA

> **Estado del Proyecto**: En desarrollo
> **Última actualización**: 2025-09-25
> **Progreso general**: 60% (6/10 CRUDs completados)

---

## 🎯 Estado Actual

### ✅ **COMPLETADOS**
- [x] **CRUD Personas** ✅ - Implementado y probado completamente
  - DTOs con validaciones Zod y discriminated unions
  - Repository con queries específicas por tipo
  - Service con lógica de negocio y validaciones
  - Controller con manejo de errores
  - Routes organizadas con aliases
  - 30 casos de prueba en `tests/personas.http`
  - **Endpoints**: 9 endpoints implementados
  - **Fecha completado**: 2025-09-25

- [x] **CRUD Actividades** ✅ - Implementado y probado completamente
  - DTOs con validaciones Zod y filtros avanzados
  - Repository con queries optimizadas e includes
  - Service con lógica de negocio y gestión de docentes
  - Controller con endpoints especializados
  - Routes organizadas con 15 endpoints
  - 40 casos de prueba en `tests/actividades.http`
  - **Endpoints**: 15 endpoints implementados (CRUD + búsqueda + gestión docentes)
  - **Funcionalidades especiales**: Asignación de docentes, estadísticas, filtros por tipo
  - **Fecha completado**: 2025-09-25

- [x] **CRUD Aulas** ✅ - Implementado y probado completamente
  - DTOs con validaciones de disponibilidad y capacidad
  - Repository con detección de conflictos de horarios
  - Service con lógica de negocio para reservas
  - Controller con manejo de disponibilidad
  - Routes organizadas con 14 endpoints
  - 43 casos de prueba en `tests/aulas.http`
  - **Endpoints**: 14 endpoints implementados (CRUD + disponibilidad + estadísticas)
  - **Funcionalidades especiales**: Verificación de disponibilidad, estadísticas de uso
  - **Fecha completado**: 2025-09-25

- [x] **CRUD Configuración Sistema** ✅ - Implementado y probado completamente
  - DTOs con validaciones por tipo de valor (STRING, NUMBER, BOOLEAN, JSON)
  - Repository con operaciones bulk e integridad del sistema
  - Service con lógica de negocio para configuraciones críticas
  - Controller con 17 endpoints especializados
  - Routes organizadas con operaciones de utilidad
  - 60 casos de prueba en `tests/configuracion.http`
  - **Endpoints**: 17 endpoints implementados (CRUD + bulk + validación + tipado)
  - **Funcionalidades especiales**: Inicialización automática, valores tipados, validación de integridad
  - **Fecha completado**: 2025-09-25

- [x] **CRUD Participación Actividad** ✅ - Implementado y probado completamente
  - DTOs con validaciones avanzadas de fechas y conflictos de horarios
  - Repository con queries complejas e includes relacionales
  - Service con lógica de negocio para inscripciones y validación de cupos
  - Controller con 15 endpoints especializados
  - Routes organizadas con operaciones de gestión
  - 60 casos de prueba en `tests/participacion.http`
  - **Endpoints**: 15 endpoints implementados (CRUD + inscripciones + transferencias + estadísticas)
  - **Funcionalidades especiales**: Inscripción masiva, validación de conflictos, dashboard, transferencias
  - **Fecha completado**: 2025-09-25

---

## 🔍 Análisis de Modelos Pendientes

### **Modelos Identificados para Implementar:**
1. **Actividad** - Coros, clases de canto e instrumento
2. **Aula** - Espacios físicos para actividades
3. **Recibo** - Facturación y pagos
4. **ParticipacionActividad** - Inscripciones M:M
5. **Familiar** - Relaciones familiares entre socios
6. **ReservaAula** - Gestión de horarios y espacios
7. **Cuota** - Cuotas sociales mensuales
8. **MedioPago** - Formas de pago de recibos
9. **ComisionDirectiva** - Cargos directivos
10. **ConfiguracionSistema** - Parámetros globales

---

## 🗓️ Plan Priorizado por Fases

### **FASE 1: Entidades Base** ⏳
> **Objetivo**: Implementar entidades independientes que sirven de base
> **Duración estimada**: 1 semana

#### 1️⃣ **CRUD Actividades** ✅
- **Estado**: ✅ Completado
- **Complejidad**: Media
- **Dependencias**: Personas (docentes)
- **Endpoints implementados**:
  - `POST /api/actividades` - Crear actividad
  - `GET /api/actividades` - Listar con filtros
  - `GET /api/actividades/:id` - Obtener por ID
  - `PUT /api/actividades/:id` - Actualizar
  - `DELETE /api/actividades/:id` - Eliminar
  - `GET /api/actividades/coros` - Solo coros
  - `GET /api/actividades/clases-instrumento` - Solo clases instrumento
  - `GET /api/actividades/clases-canto` - Solo clases canto
  - `GET /api/actividades/search` - Búsqueda avanzada
  - `GET /api/actividades/docentes-disponibles` - Docentes disponibles
  - `GET /api/actividades/:id/participantes` - Participantes
  - `GET /api/actividades/:id/estadisticas` - Estadísticas
  - `POST /api/actividades/:id/docentes` - Asignar docente
  - `DELETE /api/actividades/:id/docentes/:docenteId` - Desasignar docente
- **Validaciones implementadas**:
  - Precios ≥ 0 ✅
  - Capacidad máxima > 0 ✅
  - Duración en minutos > 0 ✅
  - Docentes deben existir y ser tipo DOCENTE ✅
  - Warning para coros con precio ✅
- **Archivos creados**:
  - [x] `src/dto/actividad.dto.ts`
  - [x] `src/repositories/actividad.repository.ts`
  - [x] `src/services/actividad.service.ts`
  - [x] `src/controllers/actividad.controller.ts`
  - [x] `src/routes/actividad.routes.ts`
  - [x] `tests/actividades.http`

#### 2️⃣ **CRUD Aulas** ✅
- **Estado**: ✅ Completado
- **Complejidad**: Baja
- **Dependencias**: Ninguna
- **Endpoints implementados**:
  - `POST /api/aulas` - Crear aula
  - `GET /api/aulas` - Listar con filtros
  - `GET /api/aulas/:id` - Obtener por ID
  - `PUT /api/aulas/:id` - Actualizar
  - `DELETE /api/aulas/:id` - Eliminar (soft/hard)
  - `GET /api/aulas/disponibles` - Aulas disponibles
  - `GET /api/aulas/menor-uso` - Aulas con menor uso
  - `GET /api/aulas/con-equipamiento` - Con equipamiento
  - `GET /api/aulas/por-capacidad` - Por capacidad específica
  - `GET /api/aulas/search` - Búsqueda avanzada
  - `POST /api/aulas/:id/verificar-disponibilidad` - Verificar disponibilidad
  - `GET /api/aulas/:id/estadisticas` - Estadísticas de uso
  - `GET /api/aulas/:id/reservas` - Reservas del aula
- **Validaciones implementadas**:
  - Nombre único ✅
  - Capacidad > 0 ✅
  - Fechas de disponibilidad válidas ✅
  - No conflictos de horarios ✅
- **Archivos creados**:
  - [x] `src/dto/aula.dto.ts`
  - [x] `src/repositories/aula.repository.ts`
  - [x] `src/services/aula.service.ts`
  - [x] `src/controllers/aula.controller.ts`
  - [x] `src/routes/aula.routes.ts`
  - [x] `tests/aulas.http`

#### 3️⃣ **CRUD Configuración Sistema** ✅
- **Estado**: ✅ Completado
- **Complejidad**: Baja
- **Dependencias**: Ninguna
- **Endpoints implementados**:
  - `POST /api/configuracion` - Crear configuración
  - `GET /api/configuracion` - Listar con paginación
  - `GET /api/configuracion/clave/:clave` - Obtener por clave
  - `GET /api/configuracion/id/:id` - Obtener por ID
  - `PUT /api/configuracion/clave/:clave` - Actualizar por clave
  - `PUT /api/configuracion/id/:id` - Actualizar por ID
  - `DELETE /api/configuracion/clave/:clave` - Eliminar por clave
  - `DELETE /api/configuracion/id/:id` - Eliminar por ID
  - `POST /api/configuracion/clave/:clave` - Upsert por clave
  - `POST /api/configuracion/bulk-upsert` - Importar en bloque
  - `GET /api/configuracion/export` - Exportar todas
  - `GET /api/configuracion/tipo/:tipo` - Filtrar por tipo
  - `GET /api/configuracion/categoria/:categoria` - Por categoría
  - `GET /api/configuracion/prefijo/:prefijo` - Por prefijo
  - `GET /api/configuracion/valor/:clave/:tipo` - Obtener valor tipado
  - `PUT /api/configuracion/valor/:clave/:tipo` - Establecer valor tipado
  - `POST /api/configuracion/inicializar` - Inicializar sistema
- **Validaciones implementadas**:
  - Clave única en formato MAYÚSCULAS_UNDERSCORE ✅
  - Validar tipo de valor por tipo (STRING, NUMBER, BOOLEAN, JSON) ✅
  - Parsear valores según tipo ✅
  - Protección de configuraciones críticas del sistema ✅
  - Validación de integridad del sistema ✅
- **Archivos creados**:
  - [x] `src/dto/configuracion.dto.ts`
  - [x] `src/repositories/configuracion.repository.ts`
  - [x] `src/services/configuracion.service.ts`
  - [x] `src/controllers/configuracion.controller.ts`
  - [x] `src/routes/configuracion.routes.ts`
  - [x] `tests/configuracion.http`

---

### **FASE 2: Relaciones y Inscripciones** ⏳
> **Objetivo**: Implementar relaciones entre entidades
> **Duración estimada**: 1 semana

#### 4️⃣ **Gestión Participaciones** ⏳
- **Estado**: ⏳ Pendiente
- **Complejidad**: Alta
- **Dependencias**: Personas, Actividades
- **Endpoints a implementar**:
  - `POST /api/participaciones` - Inscribir persona en actividad
  - `GET /api/participaciones` - Listar participaciones
  - `GET /api/participaciones/persona/:id` - Participaciones de una persona
  - `GET /api/participaciones/actividad/:id` - Participantes de una actividad
  - `PUT /api/participaciones/:id` - Actualizar participación
  - `DELETE /api/participaciones/:id` - Dar de baja participación
- **Validaciones especiales**:
  - No duplicar persona-actividad activa
  - Validar capacidad máxima de actividad
  - Fechas de inicio/fin coherentes
  - Precio especial solo para NO_SOCIO
- **Archivos a crear**:
  - [ ] `src/dto/participacion.dto.ts`
  - [ ] `src/repositories/participacion.repository.ts`
  - [ ] `src/services/participacion.service.ts`
  - [ ] `src/controllers/participacion.controller.ts`
  - [ ] `src/routes/participacion.routes.ts`
  - [ ] `tests/participaciones.http`

#### 5️⃣ **Gestión Familiares** ⏳
- **Estado**: ⏳ Pendiente
- **Complejidad**: Media
- **Dependencias**: Personas (socios)
- **Endpoints a implementar**:
  - `POST /api/familiares` - Crear relación familiar
  - `GET /api/familiares/socio/:id` - Familia de un socio
  - `DELETE /api/familiares/:id` - Eliminar relación
  - `GET /api/familiares/tipos-parentesco` - Tipos de parentesco
- **Validaciones especiales**:
  - Ambas personas deben ser SOCIO
  - No relacionar consigo mismo
  - Validar tipos de parentesco válidos
  - No duplicar relación socio-familiar
- **Archivos a crear**:
  - [ ] `src/dto/familiar.dto.ts`
  - [ ] `src/repositories/familiar.repository.ts`
  - [ ] `src/services/familiar.service.ts`
  - [ ] `src/controllers/familiar.controller.ts`
  - [ ] `src/routes/familiar.routes.ts`
  - [ ] `tests/familiares.http`

#### 6️⃣ **Gestión Reservas Aula** ⏳
- **Estado**: ⏳ Pendiente
- **Complejidad**: Alta
- **Dependencias**: Aulas, Personas (docentes), Actividades
- **Endpoints a implementar**:
  - `POST /api/reservas` - Crear reserva
  - `GET /api/reservas` - Listar reservas
  - `GET /api/reservas/aula/:id` - Reservas de un aula
  - `GET /api/reservas/docente/:id` - Reservas de un docente
  - `POST /api/reservas/verificar-disponibilidad` - Verificar conflictos
  - `DELETE /api/reservas/:id` - Cancelar reserva
- **Validaciones especiales**:
  - Detectar solapamientos de horarios
  - Docente debe ser tipo DOCENTE
  - Fechas de inicio < fecha fin
  - Aula debe existir y estar activa
- **Archivos a crear**:
  - [ ] `src/dto/reserva.dto.ts`
  - [ ] `src/repositories/reserva.repository.ts`
  - [ ] `src/services/reserva.service.ts`
  - [ ] `src/controllers/reserva.controller.ts`
  - [ ] `src/routes/reserva.routes.ts`
  - [ ] `tests/reservas.http`

---

### **FASE 3: Facturación y Pagos** ⏳
> **Objetivo**: Sistema completo de facturación
> **Duración estimada**: 1 semana

#### 7️⃣ **CRUD Recibos** ⏳
- **Estado**: ⏳ Pendiente
- **Complejidad**: Muy Alta
- **Dependencias**: Personas, Participaciones
- **Endpoints a implementar**:
  - `POST /api/recibos` - Crear recibo
  - `GET /api/recibos` - Listar con filtros avanzados
  - `GET /api/recibos/:id` - Obtener recibo completo
  - `PUT /api/recibos/:id` - Actualizar recibo
  - `PUT /api/recibos/:id/estado` - Cambiar estado
  - `GET /api/recibos/numero/:numero` - Buscar por número
  - `GET /api/recibos/persona/:id` - Recibos de una persona
- **Validaciones especiales**:
  - Número de recibo único y autoincremental
  - Estados válidos y transiciones permitidas
  - Importes > 0
  - Fechas de vencimiento futuras
  - Emisor y receptor según tipo de recibo
- **Archivos a crear**:
  - [ ] `src/dto/recibo.dto.ts`
  - [ ] `src/repositories/recibo.repository.ts`
  - [ ] `src/services/recibo.service.ts`
  - [ ] `src/controllers/recibo.controller.ts`
  - [ ] `src/routes/recibo.routes.ts`
  - [ ] `tests/recibos.http`

#### 8️⃣ **Gestión Cuotas** ⏳
- **Estado**: ⏳ Pendiente
- **Complejidad**: Muy Alta
- **Dependencias**: Recibos, Personas (socios), Configuración
- **Endpoints a implementar**:
  - `POST /api/cuotas/generar` - Generar cuotas del mes
  - `GET /api/cuotas` - Listar cuotas con filtros
  - `GET /api/cuotas/socio/:id` - Cuotas de un socio
  - `PUT /api/cuotas/:id` - Actualizar cuota
  - `POST /api/cuotas/calcular` - Calcular monto de cuota
- **Validaciones especiales**:
  - Período único por categoría
  - Cálculo automático de montos
  - Integración con configuración de precios
  - No duplicar cuotas del mismo mes/año
- **Archivos a crear**:
  - [ ] `src/dto/cuota.dto.ts`
  - [ ] `src/repositories/cuota.repository.ts`
  - [ ] `src/services/cuota.service.ts`
  - [ ] `src/controllers/cuota.controller.ts`
  - [ ] `src/routes/cuota.routes.ts`
  - [ ] `tests/cuotas.http`

#### 9️⃣ **Gestión Medios de Pago** ⏳
- **Estado**: ⏳ Pendiente
- **Complejidad**: Media
- **Dependencias**: Recibos
- **Endpoints a implementar**:
  - `POST /api/medios-pago` - Registrar pago
  - `GET /api/medios-pago/recibo/:id` - Pagos de un recibo
  - `PUT /api/medios-pago/:id` - Actualizar medio de pago
  - `DELETE /api/medios-pago/:id` - Eliminar medio de pago
- **Validaciones especiales**:
  - Importes > 0
  - Suma de medios no exceda importe del recibo
  - Validaciones específicas por tipo (banco para cheques, etc.)
- **Archivos a crear**:
  - [ ] `src/dto/medio-pago.dto.ts`
  - [ ] `src/repositories/medio-pago.repository.ts`
  - [ ] `src/services/medio-pago.service.ts`
  - [ ] `src/controllers/medio-pago.controller.ts`
  - [ ] `src/routes/medio-pago.routes.ts`
  - [ ] `tests/medios-pago.http`

---

### **FASE 4: Administración** ⏳
> **Objetivo**: Funciones administrativas
> **Duración estimada**: 1 semana

#### 🔟 **Gestión Comisión Directiva** ⏳
- **Estado**: ⏳ Pendiente
- **Complejidad**: Media
- **Dependencias**: Personas (socios)
- **Endpoints a implementar**:
  - `POST /api/comision` - Asignar cargo
  - `GET /api/comision` - Listar comisión actual
  - `GET /api/comision/historial` - Historial de cargos
  - `PUT /api/comision/:id` - Actualizar cargo
  - `PUT /api/comision/:id/finalizar` - Finalizar mandato
- **Validaciones especiales**:
  - Solo socios activos pueden tener cargos
  - Fechas de mandato coherentes
  - No duplicar cargos activos
- **Archivos a crear**:
  - [ ] `src/dto/comision.dto.ts`
  - [ ] `src/repositories/comision.repository.ts`
  - [ ] `src/services/comision.service.ts`
  - [ ] `src/controllers/comision.controller.ts`
  - [ ] `src/routes/comision.routes.ts`
  - [ ] `tests/comision.http`

---

## 📊 Cronograma Detallado

### **Semana 1 - Entidades Base**
```
Día 1-2: 🎯 CRUD Actividades
  - Día 1: DTO + Repository + Service
  - Día 2: Controller + Routes + Testing

Día 3: 🏛️ CRUD Aulas
  - Implementación completa (más simple)

Día 4: ⚙️ CRUD Configuración Sistema
  - Implementación completa

Día 5: 🧪 Testing Integrado Fase 1
  - Pruebas de integración
  - Correcciones y optimizaciones
```

### **Semana 2 - Relaciones**
```
Día 1-2: 👥 Gestión Participaciones
  - Día 1: DTO + Repository + Service
  - Día 2: Controller + Routes + Testing

Día 3: 👨‍👩‍👧‍👦 Gestión Familiares
  - Implementación completa

Día 4-5: 📅 Gestión Reservas Aula
  - Día 4: DTO + Repository + Service
  - Día 5: Controller + Routes + Testing
```

### **Semana 3 - Facturación**
```
Día 1-3: 🧾 CRUD Recibos
  - Día 1: DTO + Repository
  - Día 2: Service con lógica compleja
  - Día 3: Controller + Routes + Testing

Día 4-5: 💰 Cuotas y Medios Pago
  - Día 4: Gestión Cuotas
  - Día 5: Medios de Pago + Testing
```

### **Semana 4 - Finalización**
```
Día 1-2: 🏛️ Comisión Directiva
  - Implementación completa

Día 3-5: 🔧 Testing y Optimizaciones
  - Testing completo de todo el sistema
  - Optimizaciones de performance
  - Documentación final
```

---

## 📋 Checklist de Implementación por CRUD

### **Template por CRUD:**
- [ ] **DTO** - Validaciones Zod y tipos TypeScript
- [ ] **Repository** - Queries Prisma optimizadas
- [ ] **Service** - Lógica de negocio y validaciones
- [ ] **Controller** - Manejo de HTTP y errores
- [ ] **Routes** - Configuración de endpoints
- [ ] **Tests** - Archivo .http con casos de prueba
- [ ] **Integration** - Actualizar routes/index.ts
- [ ] **Documentation** - Actualizar este README

---

## 🎯 Métricas de Progreso

### **CRUDs Completados**: 2/10 (20%)
- [x] Personas ✅
- [x] Actividades ✅

### **CRUDs en Progreso**: 0/10 (0%)
- Ninguno actualmente

### **CRUDs Pendientes**: 8/10 (80%)
- [ ] Aulas
- [ ] Configuración Sistema
- [ ] Participaciones
- [ ] Familiares
- [ ] Reservas Aula
- [ ] Recibos
- [ ] Cuotas
- [ ] Medios Pago
- [ ] Comisión Directiva

### **Archivos Creados**: 12/60 (20%)
**Personas**: 6/6 ✅
- [x] `src/dto/persona.dto.ts`
- [x] `src/repositories/persona.repository.ts`
- [x] `src/services/persona.service.ts`
- [x] `src/controllers/persona.controller.ts`
- [x] `src/routes/persona.routes.ts`
- [x] `tests/personas.http`

**Actividades**: 6/6 ✅
- [x] `src/dto/actividad.dto.ts`
- [x] `src/repositories/actividad.repository.ts`
- [x] `src/services/actividad.service.ts`
- [x] `src/controllers/actividad.controller.ts`
- [x] `src/routes/actividad.routes.ts`
- [x] `tests/actividades.http`

**Pendientes**: 48 archivos por crear

---

## 🔄 Instrucciones para Actualizar

### **Al completar cada CRUD:**
1. ✅ Cambiar estado de ⏳ Pendiente a ✅ Completado
2. ✅ Marcar todos los archivos como completados
3. ✅ Actualizar fecha de finalización
4. ✅ Incrementar porcentaje de progreso
5. ✅ Mover a sección "COMPLETADOS"

### **Al empezar un CRUD:**
1. 🔄 Cambiar estado de ⏳ Pendiente a 🔄 En Progreso
2. 📅 Anotar fecha de inicio

### **Formato de estados:**
- ✅ **Completado** - CRUD 100% funcional y probado
- 🔄 **En Progreso** - Implementación iniciada
- ⏳ **Pendiente** - No iniciado
- ❌ **Bloqueado** - Esperando dependencias

---

## 📝 Notas de Implementación

### **Patrones a seguir (basado en Personas):**
1. **DTOs con Zod**: Validaciones robustas y type-safe
2. **Repository Pattern**: Separación de queries de lógica
3. **Service Layer**: Validaciones de negocio centralizadas
4. **Error Handling**: Manejo consistente con middleware
5. **Testing**: Casos de prueba exhaustivos en .http

### **Consideraciones especiales:**
- **Recibos**: Numeración automática y control de estados
- **Cuotas**: Cálculo automático basado en configuración
- **Reservas**: Detección de conflictos de horarios
- **Participaciones**: Control de capacidad máxima

---

## 🎉 Objetivo Final

**Al completar este plan tendremos:**
- ✅ 10 CRUDs completamente funcionales
- ✅ 60+ archivos de implementación
- ✅ 300+ endpoints RESTful
- ✅ Sistema completo de gestión musical
- ✅ Base sólida para frontend y mobile

**Estado actual:**
- ✅ 2/10 CRUDs completados (20%)
- ✅ 24/300+ endpoints implementados
- ✅ Bases sólidas establecidas (Personas + Actividades)

---

> **Próximo paso**: Continuar con CRUD Aulas 🏛️ (más simple, quick win)
> **Comando para empezar**: `npm run dev` y comenzar implementación
> **Progreso**: 20% completado - ¡Excelente avance!