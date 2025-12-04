# 🏫 GUÍA FRONTEND: Asignación de Aulas a Actividades

**Versión:** 1.0.0
**Fecha:** 2025-12-03
**Backend:** SIGESDA API v1
**Autor:** Equipo Backend - SIGESDA

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Endpoints API Disponibles](#endpoints-api-disponibles)
3. [Integración en Vista de Actividades](#integración-en-vista-de-actividades)
4. [Flujos de Usuario](#flujos-de-usuario)
5. [Componentes React Recomendados](#componentes-react-recomendados)
6. [TypeScript Interfaces](#typescript-interfaces)
7. [Validaciones del Backend](#validaciones-del-backend)
8. [Sistema de Detección de Conflictos](#sistema-de-detección-de-conflictos)
9. [Sistema de Sugerencias Inteligentes](#sistema-de-sugerencias-inteligentes)
10. [Mockups y Diseño UI](#mockups-y-diseño-ui)
11. [Manejo de Errores](#manejo-de-errores)
12. [Casos de Uso Completos](#casos-de-uso-completos)
13. [Testing Manual](#testing-manual)

---

## 1. Visión General

### 🎯 Objetivo

Integrar la funcionalidad de **asignación de aulas a actividades** en la vista de Actividades, siguiendo el **mismo patrón UI/UX** utilizado para:
- ✅ **Inscribir Participantes** a actividades
- ✅ **Asignar Docentes** a actividades

### 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────┐
│         Vista de Actividades (Detalle)          │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────┬──────────────┬──────────┬──────┐│
│  │INFORMACIÓN│PARTICIPANTES │ DOCENTES │AULAS ││
│  └───────────┴──────────────┴──────────┴──────┘│
│                                          ↑      │
│                                          │      │
│                                    NUEVA PESTAÑA│
└─────────────────────────────────────────────────┘
```

### ✨ Características Principales

1. **Asignación con Validación Automática**
   - Verificación de horarios disponibles
   - Validación de capacidad
   - Detección de conflictos con otras actividades

2. **Sistema de Sugerencias Inteligentes**
   - Recomendación de aulas disponibles
   - Score de idoneidad por aula
   - Filtrado por capacidad y tipo

3. **Gestión de Múltiples Aulas**
   - Una actividad puede tener varias aulas
   - Sistema de prioridades (1=principal, 2=alternativa)
   - Cambio de aula con re-validación

4. **Soft Delete**
   - Desasignación sin eliminar registro
   - Historial de asignaciones
   - Posibilidad de reactivar

---

## 2. Endpoints API Disponibles

### 📊 Resumen de Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| **POST** | `/api/actividades/:id/aulas/verificar-disponibilidad` | Verificar disponibilidad ANTES de asignar |
| **GET** | `/api/actividades/:id/aulas/sugerencias` | Obtener aulas sugeridas |
| **POST** | `/api/actividades/:id/aulas` | Asignar aula a actividad |
| **POST** | `/api/actividades/:id/aulas/multiple` | Asignar múltiples aulas |
| **GET** | `/api/actividades/:id/aulas` | Listar aulas de actividad |
| **PUT** | `/api/actividades/:id/aulas/:aulaId/cambiar` | Cambiar aula asignada |
| **GET** | `/api/actividades-aulas` | Listar todas las asignaciones |
| **GET** | `/api/actividades-aulas/:id` | Obtener asignación por ID |
| **PUT** | `/api/actividades-aulas/:id` | Actualizar asignación |
| **DELETE** | `/api/actividades-aulas/:id` | Eliminar permanentemente |
| **POST** | `/api/actividades-aulas/:id/desasignar` | Desasignar (soft delete) |
| **POST** | `/api/actividades-aulas/:id/reactivar` | Reactivar asignación |
| **GET** | `/api/aulas/:aulaId/ocupacion` | Ver resumen de ocupación |

---

### 📡 Endpoints Detallados

#### 2.1. Verificar Disponibilidad

**Endpoint:** `POST /api/actividades/:actividadId/aulas/verificar-disponibilidad`

**Cuándo usar:** ANTES de mostrar el formulario de asignación. Este endpoint valida si un aula está disponible para los horarios de la actividad.

**Request:**
```typescript
POST /api/actividades/5/aulas/verificar-disponibilidad
Content-Type: application/json

{
  "aulaId": 3,
  "excluirAsignacionId": 10  // Opcional: para re-validar al cambiar aula
}
```

**Response (Disponible):**
```json
{
  "success": true,
  "data": {
    "disponible": true,
    "conflictos": [],
    "capacidadSuficiente": true,
    "observaciones": "El aula está disponible para todos los horarios de la actividad"
  }
}
```

**Response (Con Conflictos):**
```json
{
  "success": true,
  "data": {
    "disponible": false,
    "conflictos": [
      {
        "tipo": "ACTIVIDAD",
        "actividadNombre": "Piano Avanzado",
        "diaSemana": "LUNES",
        "horaInicio": "18:00",
        "horaFin": "20:00",
        "mensaje": "Conflicto con actividad 'Piano Avanzado' el LUNES de 18:00 a 20:00"
      },
      {
        "tipo": "RESERVA",
        "motivo": "Ensayo de orquesta",
        "fecha": "2025-12-15",
        "horaInicio": "19:00",
        "horaFin": "21:00",
        "mensaje": "Reserva puntual: Ensayo de orquesta el 2025-12-15 de 19:00 a 21:00"
      }
    ],
    "capacidadSuficiente": false,
    "capacidadRequerida": 30,
    "capacidadAula": 25,
    "observaciones": "El aula tiene conflictos horarios y capacidad insuficiente"
  }
}
```

**UI Recomendada:**
```jsx
// Mostrar resultado con badges de color
<DisponibilidadResult>
  {disponible ? (
    <Badge variant="success">✅ Aula Disponible</Badge>
  ) : (
    <>
      <Badge variant="error">❌ Aula No Disponible</Badge>
      <ConflictosList conflictos={conflictos} />
    </>
  )}
</DisponibilidadResult>
```

---

#### 2.2. Obtener Sugerencias Inteligentes

**Endpoint:** `GET /api/actividades/:actividadId/aulas/sugerencias`

**Cuándo usar:** Para mostrar al usuario opciones de aulas que están disponibles y son apropiadas para la actividad.

**Request:**
```http
GET /api/actividades/5/aulas/sugerencias?capacidadMinima=20&tipoAulaId=2
```

**Query Parameters:**
- `capacidadMinima` (opcional): Filtrar aulas con capacidad mínima
- `tipoAulaId` (opcional): Filtrar por tipo de aula (ej: MUSICAL, TEORICA)

**Response:**
```json
{
  "success": true,
  "data": {
    "actividadId": 5,
    "actividadNombre": "Coro de Adultos",
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
      }
    ],
    "participantesActivos": 25,
    "sugerencias": [
      {
        "aula": {
          "id": 3,
          "nombre": "Sala Principal",
          "capacidad": 40,
          "ubicacion": "Planta Baja",
          "tipoAula": "MUSICAL"
        },
        "disponible": true,
        "conflictos": [],
        "score": 100,
        "razonamiento": "Capacidad ideal (40 > 25), sin conflictos horarios, tipo de aula apropiado"
      },
      {
        "aula": {
          "id": 7,
          "nombre": "Aula 201",
          "capacidad": 30,
          "ubicacion": "Primer Piso",
          "tipoAula": "MUSICAL"
        },
        "disponible": true,
        "conflictos": [],
        "score": 85,
        "razonamiento": "Capacidad adecuada (30 > 25), sin conflictos horarios"
      },
      {
        "aula": {
          "id": 5,
          "nombre": "Sala de Ensayo",
          "capacidad": 35,
          "ubicacion": "Planta Baja",
          "tipoAula": "MUSICAL"
        },
        "disponible": false,
        "conflictos": [
          {
            "tipo": "ACTIVIDAD",
            "actividadNombre": "Piano Grupal",
            "diaSemana": "LUNES",
            "horaInicio": "19:00",
            "horaFin": "20:30"
          }
        ],
        "score": 20,
        "razonamiento": "Conflicto horario parcial el LUNES de 19:00 a 20:30"
      }
    ]
  }
}
```

**UI Recomendada:**
```jsx
<SugerenciasPanel>
  <h3>Aulas Sugeridas para "{actividadNombre}"</h3>
  {sugerencias.map(sugerencia => (
    <AulaSugerenciaCard
      key={sugerencia.aula.id}
      aula={sugerencia.aula}
      disponible={sugerencia.disponible}
      score={sugerencia.score}
      conflictos={sugerencia.conflictos}
      razonamiento={sugerencia.razonamiento}
      onSeleccionar={() => asignarAula(sugerencia.aula.id)}
    />
  ))}
</SugerenciasPanel>
```

---

#### 2.3. Asignar Aula a Actividad

**Endpoint:** `POST /api/actividades/:actividadId/aulas`

**Cuándo usar:** Después de verificar disponibilidad y el usuario confirma la asignación.

**Request:**
```typescript
POST /api/actividades/5/aulas
Content-Type: application/json

{
  "aulaId": 3,
  "prioridad": 1,  // 1 = Principal, 2 = Alternativa, etc.
  "fechaAsignacion": "2025-01-15T00:00:00Z",  // Opcional, default: hoy
  "observaciones": "Aula principal para todas las clases regulares"
}
```

**Response (Éxito):**
```json
{
  "success": true,
  "message": "Aula asignada exitosamente",
  "data": {
    "id": 42,
    "actividadId": 5,
    "aulaId": 3,
    "fechaAsignacion": "2025-01-15T00:00:00Z",
    "fechaDesasignacion": null,
    "activa": true,
    "prioridad": 1,
    "observaciones": "Aula principal para todas las clases regulares",
    "actividades": {
      "id": 5,
      "nombre": "Coro de Adultos",
      "codigoActividad": "CORO-001"
    },
    "aulas": {
      "id": 3,
      "nombre": "Sala Principal",
      "capacidad": 40,
      "ubicacion": "Planta Baja"
    }
  }
}
```

**Response (Error - Sin Horarios):**
```json
{
  "success": false,
  "error": "La actividad no tiene horarios definidos. Debe agregar horarios antes de asignar un aula."
}
```

**Response (Error - Conflicto Horario):**
```json
{
  "success": false,
  "error": "El aula tiene conflictos horarios con otras actividades o reservas",
  "details": {
    "conflictos": [
      {
        "tipo": "ACTIVIDAD",
        "actividadNombre": "Piano Avanzado",
        "diaSemana": "LUNES",
        "horaInicio": "18:00",
        "horaFin": "20:00"
      }
    ]
  }
}
```

**Response (Error - Capacidad Insuficiente):**
```json
{
  "success": false,
  "error": "Capacidad del aula insuficiente. Participantes activos: 30, Capacidad del aula: 25"
}
```

**UI Recomendada:**
```jsx
const asignarAula = async (aulaId: number) => {
  try {
    setLoading(true);

    // 1. Primero verificar disponibilidad
    const verificacion = await verificarDisponibilidad(actividadId, aulaId);

    if (!verificacion.disponible) {
      showWarning('El aula tiene conflictos', verificacion.conflictos);
      return;
    }

    // 2. Si está disponible, asignar
    const response = await fetch(`/api/actividades/${actividadId}/aulas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aulaId,
        prioridad: 1,
        observaciones: observacionesInput
      })
    });

    const result = await response.json();

    if (result.success) {
      showToast('✅ Aula asignada exitosamente');
      refetchAulasAsignadas();
      closeModal();
    } else {
      showError(result.error);
    }
  } catch (error) {
    showError('Error al asignar aula');
  } finally {
    setLoading(false);
  }
};
```

---

#### 2.4. Asignar Múltiples Aulas

**Endpoint:** `POST /api/actividades/:actividadId/aulas/multiple`

**Cuándo usar:** Cuando una actividad requiere varias aulas (ej: principal + alternativas).

**Request:**
```typescript
POST /api/actividades/5/aulas/multiple
Content-Type: application/json

{
  "aulas": [
    {
      "aulaId": 3,
      "prioridad": 1,
      "observaciones": "Aula principal"
    },
    {
      "aulaId": 7,
      "prioridad": 2,
      "observaciones": "Aula alternativa para cuando hay muchos participantes"
    },
    {
      "aulaId": 10,
      "prioridad": 3,
      "observaciones": "Aula de respaldo"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "3 aulas asignadas exitosamente",
  "data": {
    "exitosas": [
      {
        "id": 42,
        "aulaId": 3,
        "prioridad": 1,
        "aulas": { "nombre": "Sala Principal" }
      },
      {
        "id": 43,
        "aulaId": 7,
        "prioridad": 2,
        "aulas": { "nombre": "Aula 201" }
      },
      {
        "id": 44,
        "aulaId": 10,
        "prioridad": 3,
        "aulas": { "nombre": "Aula 305" }
      }
    ],
    "fallidas": []
  }
}
```

---

#### 2.5. Listar Aulas de Actividad

**Endpoint:** `GET /api/actividades/:actividadId/aulas`

**Cuándo usar:** Para mostrar la lista de aulas actualmente asignadas a una actividad.

**Request:**
```http
GET /api/actividades/5/aulas?soloActivas=true
```

**Query Parameters:**
- `soloActivas` (opcional, default: `true`): Si es `false`, incluye aulas desasignadas

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "actividadId": 5,
      "aulaId": 3,
      "fechaAsignacion": "2025-01-15T00:00:00Z",
      "fechaDesasignacion": null,
      "activa": true,
      "prioridad": 1,
      "observaciones": "Aula principal",
      "aulas": {
        "id": 3,
        "nombre": "Sala Principal",
        "capacidad": 40,
        "ubicacion": "Planta Baja",
        "activa": true
      }
    },
    {
      "id": 43,
      "actividadId": 5,
      "aulaId": 7,
      "fechaAsignacion": "2025-01-15T00:00:00Z",
      "fechaDesasignacion": null,
      "activa": true,
      "prioridad": 2,
      "observaciones": "Aula alternativa",
      "aulas": {
        "id": 7,
        "nombre": "Aula 201",
        "capacidad": 30,
        "ubicacion": "Primer Piso",
        "activa": true
      }
    }
  ]
}
```

**UI Recomendada:**
```jsx
<AulasAsignadasList actividadId={5}>
  {aulas.map(asignacion => (
    <AulaCard
      key={asignacion.id}
      aula={asignacion.aulas}
      prioridad={asignacion.prioridad}
      observaciones={asignacion.observaciones}
      onCambiar={() => cambiarAula(asignacion)}
      onDesasignar={() => desasignarAula(asignacion.id)}
    />
  ))}
  <Button onClick={abrirModalAsignar}>+ Asignar Aula</Button>
</AulasAsignadasList>
```

---

#### 2.6. Cambiar Aula Asignada

**Endpoint:** `PUT /api/actividades/:actividadId/aulas/:aulaId/cambiar`

**Cuándo usar:** Cuando necesitas cambiar de aula pero mantener el historial de la asignación anterior.

**Request:**
```typescript
PUT /api/actividades/5/aulas/3/cambiar
Content-Type: application/json

{
  "nuevaAulaId": 7,
  "observaciones": "Cambio por mantenimiento del aula anterior"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Aula cambiada exitosamente",
  "data": {
    "asignacionAnterior": {
      "id": 42,
      "aulaId": 3,
      "activa": false,
      "fechaDesasignacion": "2025-12-03T14:30:00Z",
      "observaciones": "Cambio por mantenimiento del aula anterior"
    },
    "nuevaAsignacion": {
      "id": 45,
      "aulaId": 7,
      "activa": true,
      "prioridad": 1,
      "aulas": {
        "nombre": "Aula 201"
      }
    }
  }
}
```

**Nota Importante:** Este endpoint automáticamente:
1. Desasigna el aula anterior (soft delete)
2. Valida disponibilidad de la nueva aula
3. Crea la nueva asignación
4. Mantiene la misma prioridad

---

#### 2.7. Desasignar Aula (Soft Delete)

**Endpoint:** `POST /api/actividades-aulas/:id/desasignar`

**Cuándo usar:** Para desactivar una asignación sin eliminar el registro (mantiene historial).

**Request:**
```typescript
POST /api/actividades-aulas/42/desasignar
Content-Type: application/json

{
  "fechaDesasignacion": "2025-12-31T23:59:59Z",  // Opcional
  "observaciones": "Fin de ciclo lectivo"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Aula desasignada exitosamente",
  "data": {
    "id": 42,
    "activa": false,
    "fechaDesasignacion": "2025-12-31T23:59:59Z",
    "observaciones": "Fin de ciclo lectivo"
  }
}
```

---

#### 2.8. Reactivar Asignación

**Endpoint:** `POST /api/actividades-aulas/:id/reactivar`

**Cuándo usar:** Para reactivar una asignación previamente desactivada.

**Request:**
```http
POST /api/actividades-aulas/42/reactivar
```

**Response (Éxito):**
```json
{
  "success": true,
  "message": "Asignación reactivada exitosamente",
  "data": {
    "id": 42,
    "activa": true,
    "fechaDesasignacion": null
  }
}
```

**Response (Error - Conflictos):**
```json
{
  "success": false,
  "error": "No se puede reactivar: el aula ya no está disponible para los horarios de la actividad",
  "details": {
    "conflictos": [...]
  }
}
```

**Nota:** La reactivación ejecuta TODAS las validaciones nuevamente (disponibilidad, capacidad, etc.).

---

#### 2.9. Ver Ocupación de Aula

**Endpoint:** `GET /api/aulas/:aulaId/ocupacion`

**Cuándo usar:** Para mostrar un resumen de cuánto se usa un aula.

**Request:**
```http
GET /api/aulas/3/ocupacion
```

**Response:**
```json
{
  "success": true,
  "data": {
    "aula": {
      "id": 3,
      "nombre": "Sala Principal",
      "capacidad": 40
    },
    "ocupacion": {
      "actividadesActivas": 3,
      "reservasPuntuales": 5,
      "seccionesActivas": 2,
      "totalAsignaciones": 10
    }
  }
}
```

---

## 3. Integración en Vista de Actividades

### 🎨 Diseño de Pestañas

La vista de detalle de actividades debe tener una estructura de pestañas/tabs:

```jsx
<ActividadDetalle actividadId={5}>
  <Tabs defaultValue="informacion">
    <TabsList>
      <TabsTrigger value="informacion">📋 Información</TabsTrigger>
      <TabsTrigger value="participantes">👥 Participantes (25)</TabsTrigger>
      <TabsTrigger value="docentes">👨‍🏫 Docentes (2)</TabsTrigger>
      <TabsTrigger value="aulas">🏫 Aulas (1)</TabsTrigger>
    </TabsList>

    <TabsContent value="informacion">
      <ActividadInformacion />
    </TabsContent>

    <TabsContent value="participantes">
      <ParticipantesTab actividadId={5} />
    </TabsContent>

    <TabsContent value="docentes">
      <DocentesTab actividadId={5} />
    </TabsContent>

    <TabsContent value="aulas">
      <AulasTab actividadId={5} />  {/* NUEVO COMPONENTE */}
    </TabsContent>
  </Tabs>
</ActividadDetalle>
```

### 📊 Contador en Badge

Mostrar contador de aulas asignadas en el tab (igual que participantes/docentes):

```jsx
<TabsTrigger value="aulas">
  🏫 Aulas ({aulasAsignadas.length})
</TabsTrigger>
```

---

## 4. Flujos de Usuario

### 🔄 Flujo 1: Asignar Aula (Flujo Completo)

```
┌─────────────────────────────────────────────────┐
│ 1. Usuario hace clic en "Asignar Aula"         │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 2. Sistema verifica que actividad tenga        │
│    horarios definidos                           │
│    ├─ NO  → Mostrar error + enlace a horarios  │
│    └─ SÍ  → Continuar                          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 3. Mostrar modal con 2 opciones:               │
│    A) Seleccionar aula manualmente              │
│    B) Ver sugerencias inteligentes              │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   OPCIÓN A          OPCIÓN B
┌─────────┐      ┌──────────────┐
│Selector │      │GET sugerencias│
│de Aulas │      │+ scores       │
└────┬────┘      └───────┬───────┘
     │                   │
     └─────────┬─────────┘
               ▼
┌─────────────────────────────────────────────────┐
│ 4. Usuario selecciona aula                      │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 5. POST verificar-disponibilidad                │
│    ├─ Disponible → Mostrar ✅ + botón Asignar  │
│    └─ Conflicto  → Mostrar ⚠️ + detalles       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 6. Usuario confirma (completa prioridad/obs)    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 7. POST asignar aula                            │
│    ├─ Éxito → Cerrar modal + refetch + toast   │
│    └─ Error → Mostrar mensaje de error         │
└─────────────────────────────────────────────────┘
```

### 🔄 Flujo 2: Ver Sugerencias

```
┌─────────────────────────────────────────────────┐
│ 1. Usuario hace clic en "Ver Sugerencias"      │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 2. GET sugerencias (opcional: filtros)         │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 3. Mostrar lista ordenada por score            │
│    ┌──────────────────────────────────────┐    │
│    │ ✅ Sala Principal (Score: 100)        │    │
│    │    Capacidad: 40/25 ✓                 │    │
│    │    Sin conflictos                     │    │
│    │    [SELECCIONAR]                      │    │
│    ├──────────────────────────────────────┤    │
│    │ ✅ Aula 201 (Score: 85)               │    │
│    │    Capacidad: 30/25 ✓                 │    │
│    │    Sin conflictos                     │    │
│    │    [SELECCIONAR]                      │    │
│    ├──────────────────────────────────────┤    │
│    │ ⚠️  Sala Ensayo (Score: 20)           │    │
│    │    Capacidad: 35/25 ✓                 │    │
│    │    ⚠️ 1 conflicto parcial             │    │
│    │    [VER DETALLES]                     │    │
│    └──────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 🔄 Flujo 3: Cambiar Aula

```
┌─────────────────────────────────────────────────┐
│ 1. Usuario hace clic en "Cambiar Aula"         │
│    (desde lista de aulas asignadas)             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 2. Mostrar modal con:                           │
│    - Aula actual: "Sala Principal"              │
│    - Selector de nueva aula                     │
│    - Opción: Ver sugerencias                    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 3. Usuario selecciona nueva aula                │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 4. POST verificar-disponibilidad (nueva aula)   │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 5. Confirmar cambio con observación             │
│    "Motivo del cambio: _______________"         │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 6. PUT cambiar aula                             │
│    (desasigna anterior + asigna nueva)          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 7. Refetch lista + toast de confirmación       │
└─────────────────────────────────────────────────┘
```

---

## 5. Componentes React Recomendados

### 📦 Estructura de Componentes

```
components/
└── actividades/
    └── aulas/
        ├── AulasTab.tsx                    // Componente principal del tab
        ├── AulasAsignadasList.tsx          // Lista de aulas actuales
        ├── AulaCard.tsx                    // Card individual de aula
        ├── AsignarAulaModal.tsx            // Modal de asignación
        ├── SugerenciasPanel.tsx            // Panel de sugerencias
        ├── SugerenciaCard.tsx              // Card de cada sugerencia
        ├── VerificarDisponibilidadWidget.tsx  // Widget de verificación
        ├── ConflictosAlert.tsx             // Alert de conflictos
        ├── CambiarAulaModal.tsx            // Modal para cambiar aula
        └── PrioridadBadge.tsx              // Badge de prioridad
```

---

### 5.1. AulasTab (Componente Principal)

```tsx
// components/actividades/aulas/AulasTab.tsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AulasAsignadasList } from './AulasAsignadasList';
import { AsignarAulaModal } from './AsignarAulaModal';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AulasTabProps {
  actividadId: number;
  actividad: {
    nombre: string;
    tieneHorarios: boolean;
  };
}

export const AulasTab: React.FC<AulasTabProps> = ({ actividadId, actividad }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch aulas asignadas
  const { data: aulas, isLoading, error } = useQuery({
    queryKey: ['actividad-aulas', actividadId],
    queryFn: async () => {
      const res = await fetch(`/api/actividades/${actividadId}/aulas`);
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  });

  if (isLoading) return <div>Cargando aulas...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Aulas Asignadas</h2>
          <p className="text-gray-600">
            Gestiona las aulas donde se dicta "{actividad.nombre}"
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          disabled={!actividad.tieneHorarios}
        >
          + Asignar Aula
        </Button>
      </div>

      {/* Warning si no tiene horarios */}
      {!actividad.tieneHorarios && (
        <Alert variant="warning">
          <AlertDescription>
            ⚠️ Esta actividad no tiene horarios definidos.
            Primero debe agregar horarios antes de asignar aulas.
            <Button variant="link" onClick={() => navegarAHorarios()}>
              Ir a Horarios
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de aulas */}
      {aulas && aulas.length > 0 ? (
        <AulasAsignadasList
          aulas={aulas}
          actividadId={actividadId}
          onRefetch={() => queryClient.invalidateQueries(['actividad-aulas', actividadId])}
        />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No hay aulas asignadas a esta actividad
          </p>
          {actividad.tieneHorarios && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="mt-4"
            >
              Asignar Primera Aula
            </Button>
          )}
        </div>
      )}

      {/* Modal de asignación */}
      <AsignarAulaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        actividadId={actividadId}
        onAsignado={() => {
          queryClient.invalidateQueries(['actividad-aulas', actividadId]);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};
```

---

### 5.2. AsignarAulaModal

```tsx
// components/actividades/aulas/AsignarAulaModal.tsx

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SugerenciasPanel } from './SugerenciasPanel';
import { VerificarDisponibilidadWidget } from './VerificarDisponibilidadWidget';

interface AsignarAulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  actividadId: number;
  onAsignado: () => void;
}

export const AsignarAulaModal: React.FC<AsignarAulaModalProps> = ({
  isOpen,
  onClose,
  actividadId,
  onAsignado
}) => {
  const [selectedAulaId, setSelectedAulaId] = useState<number | null>(null);
  const [prioridad, setPrioridad] = useState(1);
  const [observaciones, setObservaciones] = useState('');
  const [modoSeleccion, setModoSeleccion] = useState<'manual' | 'sugerencias'>('sugerencias');

  // Fetch todas las aulas disponibles (para selección manual)
  const { data: todasAulas } = useQuery({
    queryKey: ['aulas-activas'],
    queryFn: async () => {
      const res = await fetch('/api/aulas?activa=true');
      const result = await res.json();
      return result.data || [];
    },
    enabled: isOpen && modoSeleccion === 'manual'
  });

  // Mutation para asignar
  const asignarMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/actividades/${actividadId}/aulas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aulaId: selectedAulaId,
          prioridad,
          observaciones
        })
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      onAsignado();
      resetForm();
    }
  });

  const resetForm = () => {
    setSelectedAulaId(null);
    setPrioridad(1);
    setObservaciones('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Asignar Aula a Actividad</DialogTitle>
        </DialogHeader>

        <Tabs value={modoSeleccion} onValueChange={(v) => setModoSeleccion(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sugerencias">💡 Ver Sugerencias</TabsTrigger>
            <TabsTrigger value="manual">🔍 Búsqueda Manual</TabsTrigger>
          </TabsList>

          {/* SUGERENCIAS INTELIGENTES */}
          <TabsContent value="sugerencias">
            <SugerenciasPanel
              actividadId={actividadId}
              onAulaSeleccionada={(aulaId) => setSelectedAulaId(aulaId)}
              selectedAulaId={selectedAulaId}
            />
          </TabsContent>

          {/* SELECCIÓN MANUAL */}
          <TabsContent value="manual">
            <div className="space-y-4">
              <Label>Seleccionar Aula</Label>
              <select
                className="w-full p-2 border rounded"
                value={selectedAulaId || ''}
                onChange={(e) => setSelectedAulaId(Number(e.target.value))}
              >
                <option value="">-- Seleccione un aula --</option>
                {todasAulas?.map((aula: any) => (
                  <option key={aula.id} value={aula.id}>
                    {aula.nombre} - Capacidad: {aula.capacidad} - {aula.ubicacion}
                  </option>
                ))}
              </select>
            </div>
          </TabsContent>
        </Tabs>

        {/* VERIFICACIÓN DE DISPONIBILIDAD */}
        {selectedAulaId && (
          <VerificarDisponibilidadWidget
            actividadId={actividadId}
            aulaId={selectedAulaId}
          />
        )}

        {/* FORMULARIO DE ASIGNACIÓN */}
        {selectedAulaId && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label>Prioridad</Label>
              <select
                className="w-full p-2 border rounded"
                value={prioridad}
                onChange={(e) => setPrioridad(Number(e.target.value))}
              >
                <option value={1}>1 - Principal</option>
                <option value={2}>2 - Alternativa</option>
                <option value={3}>3 - Respaldo</option>
              </select>
            </div>

            <div>
              <Label>Observaciones (opcional)</Label>
              <Input
                placeholder="Ej: Aula principal para todas las clases regulares"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={() => asignarMutation.mutate()}
                disabled={asignarMutation.isPending}
              >
                {asignarMutation.isPending ? 'Asignando...' : 'Asignar Aula'}
              </Button>
            </div>

            {asignarMutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {asignarMutation.error?.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
```

---

### 5.3. SugerenciasPanel

```tsx
// components/actividades/aulas/SugerenciasPanel.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { SugerenciaCard } from './SugerenciaCard';
import { Loader2 } from 'lucide-react';

interface SugerenciasPanelProps {
  actividadId: number;
  onAulaSeleccionada: (aulaId: number) => void;
  selectedAulaId: number | null;
}

export const SugerenciasPanel: React.FC<SugerenciasPanelProps> = ({
  actividadId,
  onAulaSeleccionada,
  selectedAulaId
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['sugerencias-aulas', actividadId],
    queryFn: async () => {
      const res = await fetch(`/api/actividades/${actividadId}/aulas/sugerencias`);
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" />
        <span className="ml-2">Analizando disponibilidad...</span>
      </div>
    );
  }

  const sugerencias = data?.sugerencias || [];

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900">
          💡 Aulas Sugeridas para "{data?.actividadNombre}"
        </h3>
        <p className="text-sm text-blue-700 mt-1">
          Ordenadas por disponibilidad, capacidad y compatibilidad
        </p>
      </div>

      {sugerencias.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded">
          <p className="text-gray-600">
            No hay aulas disponibles para los horarios de esta actividad
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sugerencias.map((sugerencia: any) => (
            <SugerenciaCard
              key={sugerencia.aula.id}
              sugerencia={sugerencia}
              isSelected={selectedAulaId === sugerencia.aula.id}
              onSelect={() => onAulaSeleccionada(sugerencia.aula.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

---

### 5.4. SugerenciaCard

```tsx
// components/actividades/aulas/SugerenciaCard.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, AlertTriangle, MapPin, Users } from 'lucide-react';

interface SugerenciaCardProps {
  sugerencia: {
    aula: {
      id: number;
      nombre: string;
      capacidad: number;
      ubicacion: string;
      tipoAula: string;
    };
    disponible: boolean;
    conflictos: any[];
    score: number;
    razonamiento: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

export const SugerenciaCard: React.FC<SugerenciaCardProps> = ({
  sugerencia,
  isSelected,
  onSelect
}) => {
  const { aula, disponible, conflictos, score, razonamiento } = sugerencia;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 50) return 'Aceptable';
    return 'Conflictos';
  };

  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 border-2 bg-blue-50'
          : 'hover:border-gray-400'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-lg">{aula.nombre}</h4>
              {disponible ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <Check size={14} /> Disponible
                </Badge>
              ) : (
                <Badge variant="warning" className="flex items-center gap-1">
                  <AlertTriangle size={14} /> Conflictos
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Users size={14} />
                Capacidad: {aula.capacidad}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {aula.ubicacion}
              </span>
              <Badge variant="outline">{aula.tipoAula}</Badge>
            </div>

            <p className="text-sm text-gray-700 mt-2">{razonamiento}</p>

            {conflictos.length > 0 && (
              <div className="mt-3 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-sm font-semibold text-yellow-900">
                  ⚠️ {conflictos.length} conflicto(s) horario(s):
                </p>
                <ul className="text-xs text-yellow-800 mt-1 space-y-1">
                  {conflictos.map((conflicto, idx) => (
                    <li key={idx}>
                      • {conflicto.mensaje}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Score Visual */}
          <div className="flex flex-col items-center ml-4">
            <div className={`w-16 h-16 rounded-full ${getScoreColor(score)} flex items-center justify-center text-white font-bold text-xl`}>
              {score}
            </div>
            <span className="text-xs text-gray-600 mt-1">{getScoreLabel(score)}</span>
          </div>
        </div>

        {isSelected && (
          <div className="mt-4 flex justify-end">
            <Badge variant="default" className="flex items-center gap-1">
              <Check size={14} /> Seleccionada
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

---

### 5.5. VerificarDisponibilidadWidget

```tsx
// components/actividades/aulas/VerificarDisponibilidadWidget.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface VerificarDisponibilidadWidgetProps {
  actividadId: number;
  aulaId: number;
}

export const VerificarDisponibilidadWidget: React.FC<VerificarDisponibilidadWidgetProps> = ({
  actividadId,
  aulaId
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['verificar-disponibilidad', actividadId, aulaId],
    queryFn: async () => {
      const res = await fetch(`/api/actividades/${actividadId}/aulas/verificar-disponibilidad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aulaId })
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  });

  if (isLoading) {
    return (
      <Alert>
        <Loader2 className="animate-spin" />
        <AlertDescription>Verificando disponibilidad...</AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  const { disponible, conflictos, capacidadSuficiente, observaciones } = data;

  if (disponible && capacidadSuficiente) {
    return (
      <Alert variant="success">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>✅ Aula Disponible</strong>
          <p className="text-sm mt-1">{observaciones}</p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <XCircle className="h-4 w-4" />
      <AlertDescription>
        <strong>❌ Aula No Disponible</strong>
        <p className="text-sm mt-1">{observaciones}</p>

        {!capacidadSuficiente && (
          <div className="mt-2 p-2 bg-red-100 rounded">
            <p className="text-sm font-semibold">Capacidad Insuficiente:</p>
            <p className="text-xs">
              Participantes activos: {data.capacidadRequerida} | Capacidad aula: {data.capacidadAula}
            </p>
          </div>
        )}

        {conflictos.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-sm font-semibold">Conflictos Horarios:</p>
            <ul className="text-xs space-y-1">
              {conflictos.map((conflicto: any, idx: number) => (
                <li key={idx} className="flex items-start gap-1">
                  <span>•</span>
                  <span>{conflicto.mensaje}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};
```

---

### 5.6. AulasAsignadasList

```tsx
// components/actividades/aulas/AulasAsignadasList.tsx

import React, { useState } from 'react';
import { AulaCard } from './AulaCard';
import { CambiarAulaModal } from './CambiarAulaModal';

interface AulasAsignadasListProps {
  aulas: any[];
  actividadId: number;
  onRefetch: () => void;
}

export const AulasAsignadasList: React.FC<AulasAsignadasListProps> = ({
  aulas,
  actividadId,
  onRefetch
}) => {
  const [cambiarAulaData, setCambiarAulaData] = useState<any>(null);

  // Ordenar por prioridad
  const aulasOrdenadas = [...aulas].sort((a, b) => (a.prioridad || 999) - (b.prioridad || 999));

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {aulasOrdenadas.map((asignacion) => (
          <AulaCard
            key={asignacion.id}
            asignacion={asignacion}
            onCambiar={() => setCambiarAulaData(asignacion)}
            onDesasignar={async (id) => {
              if (confirm('¿Desasignar esta aula?')) {
                await fetch(`/api/actividades-aulas/${id}/desasignar`, {
                  method: 'POST'
                });
                onRefetch();
              }
            }}
          />
        ))}
      </div>

      {cambiarAulaData && (
        <CambiarAulaModal
          isOpen={!!cambiarAulaData}
          onClose={() => setCambiarAulaData(null)}
          actividadId={actividadId}
          asignacionActual={cambiarAulaData}
          onCambiado={() => {
            onRefetch();
            setCambiarAulaData(null);
          }}
        />
      )}
    </>
  );
};
```

---

### 5.7. AulaCard

```tsx
// components/actividades/aulas/AulaCard.tsx

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Calendar, MessageSquare } from 'lucide-react';
import { PrioridadBadge } from './PrioridadBadge';

interface AulaCardProps {
  asignacion: {
    id: number;
    prioridad: number;
    fechaAsignacion: string;
    observaciones: string | null;
    aulas: {
      id: number;
      nombre: string;
      capacidad: number;
      ubicacion: string;
    };
  };
  onCambiar: () => void;
  onDesasignar: (id: number) => void;
}

export const AulaCard: React.FC<AulaCardProps> = ({
  asignacion,
  onCambiar,
  onDesasignar
}) => {
  const { aulas, prioridad, fechaAsignacion, observaciones } = asignacion;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg">{aulas.nombre}</h3>
          <PrioridadBadge prioridad={prioridad} />
        </div>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Users size={16} />
          <span>Capacidad: {aulas.capacidad} personas</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={16} />
          <span>{aulas.ubicacion}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={16} />
          <span>Desde: {new Date(fechaAsignacion).toLocaleDateString()}</span>
        </div>

        {observaciones && (
          <div className="flex items-start gap-2 text-gray-600 mt-3 p-2 bg-gray-50 rounded">
            <MessageSquare size={16} className="mt-0.5 flex-shrink-0" />
            <span className="text-xs">{observaciones}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCambiar} className="flex-1">
          Cambiar
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDesasignar(asignacion.id)}
          className="flex-1"
        >
          Desasignar
        </Button>
      </CardFooter>
    </Card>
  );
};
```

---

### 5.8. PrioridadBadge

```tsx
// components/actividades/aulas/PrioridadBadge.tsx

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PrioridadBadgeProps {
  prioridad: number;
}

export const PrioridadBadge: React.FC<PrioridadBadgeProps> = ({ prioridad }) => {
  const config = {
    1: { label: 'Principal', variant: 'default', color: 'bg-blue-500' },
    2: { label: 'Alternativa', variant: 'secondary', color: 'bg-gray-500' },
    3: { label: 'Respaldo', variant: 'outline', color: 'bg-gray-400' }
  };

  const { label, variant, color } = config[prioridad as 1 | 2 | 3] || config[3];

  return (
    <Badge variant={variant as any} className={color}>
      {label}
    </Badge>
  );
};
```

---

## 6. TypeScript Interfaces

```typescript
// types/actividad-aula.types.ts

export interface Aula {
  id: number;
  nombre: string;
  capacidad: number;
  ubicacion: string;
  tipoAulaId: number;
  activa: boolean;
}

export interface Actividad {
  id: number;
  nombre: string;
  codigoActividad: string;
  capacidadMaxima: number | null;
  activa: boolean;
  descripcion: string | null;
}

export interface ActividadAulaAsignacion {
  id: number;
  actividadId: number;
  aulaId: number;
  fechaAsignacion: string;
  fechaDesasignacion: string | null;
  activa: boolean;
  prioridad: number;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
  actividades?: Actividad;
  aulas?: Aula;
}

export interface ConflictoHorario {
  tipo: 'ACTIVIDAD' | 'RESERVA' | 'SECCION';
  mensaje: string;
  actividadNombre?: string;
  diaSemana?: string;
  horaInicio?: string;
  horaFin?: string;
  fecha?: string;
  motivo?: string;
}

export interface DisponibilidadResponse {
  disponible: boolean;
  conflictos: ConflictoHorario[];
  capacidadSuficiente: boolean;
  capacidadRequerida?: number;
  capacidadAula?: number;
  observaciones: string;
}

export interface AulaSugerencia {
  aula: Aula;
  disponible: boolean;
  conflictos: ConflictoHorario[];
  score: number;
  razonamiento: string;
}

export interface SugerenciasResponse {
  actividadId: number;
  actividadNombre: string;
  horarios: Array<{
    diaSemana: string;
    horaInicio: string;
    horaFin: string;
  }>;
  participantesActivos: number;
  sugerencias: AulaSugerencia[];
}

export interface AsignarAulaRequest {
  aulaId: number;
  prioridad?: number;
  fechaAsignacion?: string;
  observaciones?: string;
}

export interface CambiarAulaRequest {
  nuevaAulaId: number;
  observaciones?: string;
}

export interface OcupacionAulaResponse {
  aula: Aula;
  ocupacion: {
    actividadesActivas: number;
    reservasPuntuales: number;
    seccionesActivas: number;
    totalAsignaciones: number;
  };
}
```

---

## 7. Validaciones del Backend

### ✅ Validaciones Automáticas Ejecutadas

Cuando se asigna un aula, el backend ejecuta **6 validaciones críticas** automáticamente:

| # | Validación | Descripción | Error si Falla |
|---|------------|-------------|----------------|
| 1 | **Actividad Existe y Activa** | Verifica que la actividad exista en BD y `activa = true` | `"Actividad no encontrada o inactiva"` |
| 2 | **Horarios Definidos** | La actividad DEBE tener al menos 1 horario en `horarios_actividades` | `"La actividad no tiene horarios definidos"` |
| 3 | **Aula Existe y Activa** | Verifica que el aula exista y `activa = true` | `"Aula no encontrada o inactiva"` |
| 4 | **NO Duplicar Asignación** | No puede haber 2 asignaciones activas de la misma aula a la misma actividad | `"El aula ya está asignada a esta actividad"` |
| 5 | **Capacidad Suficiente** | `participantes_activos <= aula.capacidad` | `"Capacidad insuficiente (X participantes, capacidad Y)"` |
| 6 | **Sin Conflictos Horarios** | Verifica disponibilidad contra 3 tablas (ver sección 8) | `"El aula tiene conflictos horarios"` |

### 🔍 Cómo Mostrar las Validaciones en el Frontend

#### Validación 1 y 3: Existencia y Estado Activo
```jsx
// Estas validaciones son transparentes al usuario
// Si fallan, mostrar error genérico
<Alert variant="error">
  {error.message}
</Alert>
```

#### Validación 2: Horarios No Definidos
```jsx
// Mostrar warning PREVENTIVO antes de permitir asignación
{!actividad.tieneHorarios && (
  <Alert variant="warning">
    <AlertCircle />
    <AlertDescription>
      Esta actividad no tiene horarios definidos.
      <Button variant="link" onClick={() => navegarAHorarios()}>
        Agregar Horarios Primero
      </Button>
    </AlertDescription>
  </Alert>
)}

// Deshabilitar botón "Asignar Aula"
<Button disabled={!actividad.tieneHorarios}>
  Asignar Aula
</Button>
```

#### Validación 4: Duplicado
```jsx
// Filtrar aulas ya asignadas del selector
const aulasDisponiblesParaAsignar = todasAulas.filter(
  aula => !aulasAsignadas.some(asig => asig.aulaId === aula.id && asig.activa)
);
```

#### Validación 5: Capacidad Insuficiente
```jsx
<VerificarDisponibilidadWidget>
  {!capacidadSuficiente && (
    <Alert variant="warning">
      <AlertTriangle />
      <AlertDescription>
        ⚠️ Capacidad Insuficiente
        <div className="text-sm mt-1">
          Participantes activos: {participantesActivos}
          Capacidad del aula: {aula.capacidad}
        </div>
        <p className="text-xs mt-2">
          Puedes asignar de todas formas, pero se recomienda reducir participantes
          o elegir un aula más grande.
        </p>
      </AlertDescription>
    </Alert>
  )}
</VerificarDisponibilidadWidget>
```

#### Validación 6: Conflictos Horarios
```jsx
<ConflictosAlert conflictos={conflictos}>
  <h4>⚠️ Conflictos Horarios Detectados</h4>
  <ul>
    {conflictos.map((conflicto, idx) => (
      <li key={idx}>
        <Badge variant={conflicto.tipo === 'ACTIVIDAD' ? 'error' : 'warning'}>
          {conflicto.tipo}
        </Badge>
        <span>{conflicto.mensaje}</span>
      </li>
    ))}
  </ul>
</ConflictosAlert>
```

---

## 8. Sistema de Detección de Conflictos

### 🔍 Cómo Funciona la Detección

El backend verifica conflictos contra **3 tablas**:

1. **`actividades_aulas` + `horarios_actividades`**
   - Otras actividades que usan la misma aula
   - Compara días y horarios

2. **`reserva_aulas`**
   - Reservas puntuales (eventos, ensayos especiales)
   - Compara fechas y horarios

3. **`reservas_aulas_secciones`**
   - Reservas de secciones (grupos que usan el aula)
   - Compara días y horarios

### 🧮 Algoritmo de Solapamiento

```typescript
// Dos horarios se solapan si:
// (horaInicio1 < horaFin2) AND (horaFin1 > horaInicio2)

function hayConflicto(horario1, horario2) {
  // Convertir a minutos desde medianoche
  const inicio1 = convertirAMinutos(horario1.horaInicio);
  const fin1 = convertirAMinutos(horario1.horaFin);
  const inicio2 = convertirAMinutos(horario2.horaInicio);
  const fin2 = convertirAMinutos(horario2.horaFin);

  return (inicio1 < fin2) && (fin1 > inicio2);
}
```

### 📊 Tipos de Conflictos

```typescript
interface ConflictoDetallado {
  tipo: 'ACTIVIDAD' | 'RESERVA' | 'SECCION';
  mensaje: string;
  // Campos específicos según tipo
}

// Ejemplo: Conflicto con otra actividad
{
  tipo: 'ACTIVIDAD',
  actividadNombre: 'Piano Avanzado',
  diaSemana: 'LUNES',
  horaInicio: '18:00',
  horaFin: '20:00',
  mensaje: 'Conflicto con actividad "Piano Avanzado" el LUNES de 18:00 a 20:00'
}

// Ejemplo: Conflicto con reserva puntual
{
  tipo: 'RESERVA',
  motivo: 'Ensayo general de orquesta',
  fecha: '2025-12-15',
  horaInicio: '19:00',
  horaFin: '21:00',
  mensaje: 'Reserva puntual: Ensayo general de orquesta el 2025-12-15 de 19:00 a 21:00'
}

// Ejemplo: Conflicto con sección
{
  tipo: 'SECCION',
  seccionNombre: 'Sección Infantil',
  diaSemana: 'MIERCOLES',
  horaInicio: '17:00',
  horaFin: '19:00',
  mensaje: 'Conflicto con sección "Sección Infantil" el MIERCOLES de 17:00 a 19:00'
}
```

### 🎨 UI para Mostrar Conflictos

```jsx
<ConflictosTable conflictos={conflictos}>
  <thead>
    <tr>
      <th>Tipo</th>
      <th>Día/Fecha</th>
      <th>Horario</th>
      <th>Detalle</th>
    </tr>
  </thead>
  <tbody>
    {conflictos.map((conflicto, idx) => (
      <tr key={idx}>
        <td>
          <Badge variant={getConflictoBadgeVariant(conflicto.tipo)}>
            {conflicto.tipo}
          </Badge>
        </td>
        <td>
          {conflicto.fecha || conflicto.diaSemana}
        </td>
        <td>
          {conflicto.horaInicio} - {conflicto.horaFin}
        </td>
        <td>
          {conflicto.actividadNombre || conflicto.motivo || conflicto.seccionNombre}
        </td>
      </tr>
    ))}
  </tbody>
</ConflictosTable>
```

---

## 9. Sistema de Sugerencias Inteligentes

### 🧠 Algoritmo de Scoring

El backend calcula un **score de 0 a 100** para cada aula basándose en:

| Criterio | Puntos | Condición |
|----------|--------|-----------|
| **Sin conflictos horarios** | +50 | `conflictos.length === 0` |
| **Capacidad ideal** | +30 | `aula.capacidad >= participantes * 1.2` (20% margen) |
| **Capacidad adecuada** | +20 | `aula.capacidad >= participantes` |
| **Tipo de aula correcto** | +10 | `tipoAulaId` coincide con tipo requerido |
| **Equipamiento adecuado** | +10 | Tiene equipamiento necesario |
| **Penalización por conflictos** | -10 por cada conflicto | Máximo -50 |

### 📈 Interpretación de Scores

```tsx
const interpretarScore = (score: number): {
  label: string;
  color: string;
  recomendacion: string;
} => {
  if (score >= 90) return {
    label: 'Excelente',
    color: 'green',
    recomendacion: 'Aula ideal para esta actividad'
  };

  if (score >= 70) return {
    label: 'Muy buena',
    color: 'blue',
    recomendacion: 'Aula muy apropiada'
  };

  if (score >= 50) return {
    label: 'Aceptable',
    color: 'yellow',
    recomendacion: 'Aula con algunos inconvenientes menores'
  };

  if (score >= 30) return {
    label: 'Con conflictos',
    color: 'orange',
    recomendacion: 'Revisar conflictos antes de asignar'
  };

  return {
    label: 'No recomendada',
    color: 'red',
    recomendacion: 'Buscar otra opción'
  };
};
```

### 🎨 UI de Sugerencias con Score Visual

```jsx
<SugerenciaCard score={85}>
  {/* Círculo de score */}
  <div className="relative w-20 h-20">
    <svg className="transform -rotate-90 w-20 h-20">
      <circle
        cx="40"
        cy="40"
        r="36"
        stroke="currentColor"
        strokeWidth="4"
        fill="transparent"
        className="text-gray-200"
      />
      <circle
        cx="40"
        cy="40"
        r="36"
        stroke="currentColor"
        strokeWidth="4"
        fill="transparent"
        strokeDasharray={`${(score / 100) * 226} 226`}
        className="text-blue-500"
      />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
      {score}
    </div>
  </div>

  {/* Interpretación */}
  <Badge variant={scoreColor}>{scoreLabel}</Badge>
  <p className="text-sm text-gray-600">{recomendacion}</p>
</SugerenciaCard>
```

---

## 10. Mockups y Diseño UI

### 🎨 Mockup 1: Tab de Aulas (Vista Principal)

```
┌──────────────────────────────────────────────────────────────────┐
│ Actividad: Coro de Adultos                                      │
├──────────────────────────────────────────────────────────────────┤
│ [INFORMACIÓN] [PARTICIPANTES (25)] [DOCENTES (2)] [AULAS (1)]   │
└──────────────────────────────────────────────────────────────────┘
                                                       ↑ ACTIVO

┌──────────────────────────────────────────────────────────────────┐
│  Aulas Asignadas                              [+ Asignar Aula]  │
│  Gestiona las aulas donde se dicta "Coro de Adultos"           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┐  ┌────────────────────┐                │
│  │ Sala Principal     │  │ Aula 201           │                │
│  │ [Principal]        │  │ [Alternativa]      │                │
│  ├────────────────────┤  ├────────────────────┤                │
│  │ 👥 40 personas     │  │ 👥 30 personas     │                │
│  │ 📍 Planta Baja     │  │ 📍 Primer Piso     │                │
│  │ 📅 Desde 15/01/25  │  │ 📅 Desde 15/01/25  │                │
│  ├────────────────────┤  ├────────────────────┤                │
│  │ 💬 Aula principal  │  │ 💬 Para cuando hay │                │
│  │    para todas las  │  │    muchos          │                │
│  │    clases          │  │    participantes   │                │
│  ├────────────────────┤  ├────────────────────┤                │
│  │ [Cambiar]          │  │ [Cambiar]          │                │
│  │       [Desasignar] │  │       [Desasignar] │                │
│  └────────────────────┘  └────────────────────┘                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 🎨 Mockup 2: Modal de Asignar Aula (Sugerencias)

```
┌──────────────────────────────────────────────────────────────────┐
│ Asignar Aula a Actividad                                   [X]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [💡 Ver Sugerencias]  [🔍 Búsqueda Manual]                     │
│   ═════════════════                                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 💡 Aulas Sugeridas para "Coro de Adultos"                 │ │
│  │ Ordenadas por disponibilidad, capacidad y compatibilidad  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────┐  ┌──────┐      │
│  │ Sala Principal                ✅ Disponible│  │ 100  │      │
│  │ 👥 40 | 📍 Planta Baja | 🎵 MUSICAL       │  │ ───  │      │
│  │                                             │  │Excelente   │
│  │ Capacidad ideal (40 > 25), sin conflictos  │  └──────┘      │
│  │                                             │                │
│  │                            [○ Seleccionar] │                │
│  └────────────────────────────────────────────┘                │
│                                                                  │
│  ┌────────────────────────────────────────────┐  ┌──────┐      │
│  │ Aula 201                      ✅ Disponible│  │  85  │      │
│  │ 👥 30 | 📍 Primer Piso | 🎵 MUSICAL        │  │ ───  │      │
│  │                                             │  │Muy buena   │
│  │ Capacidad adecuada (30 > 25), sin          │  └──────┘      │
│  │ conflictos                                  │                │
│  │                            [● Seleccionada]│                │
│  └────────────────────────────────────────────┘                │
│                                                                  │
│  ┌────────────────────────────────────────────┐  ┌──────┐      │
│  │ Sala Ensayo              ⚠️ Conflictos     │  │  20  │      │
│  │ 👥 35 | 📍 Planta Baja | 🎵 MUSICAL        │  │ ───  │      │
│  │                                             │  │Conflictos  │
│  │ ⚠️ 1 conflicto horario parcial:            │  └──────┘      │
│  │   • Piano Grupal - LUNES 19:00-20:30       │                │
│  │                            [○ Seleccionar] │                │
│  └────────────────────────────────────────────┘                │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  ✅ Aula Disponible                                             │
│  El aula está disponible para todos los horarios de la actividad│
├──────────────────────────────────────────────────────────────────┤
│  Prioridad: [1 - Principal ▼]                                  │
│  Observaciones: [Aula principal para todas las clases regulares]│
│                                                                  │
│                                     [Cancelar]  [Asignar Aula]  │
└──────────────────────────────────────────────────────────────────┘
```

### 🎨 Mockup 3: Modal con Conflictos

```
┌──────────────────────────────────────────────────────────────────┐
│ Asignar Aula a Actividad                                   [X]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Aula Seleccionada: Sala de Ensayo                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ❌ Aula No Disponible                                       │ │
│  │                                                              │ │
│  │ El aula tiene conflictos horarios y capacidad insuficiente  │ │
│  │                                                              │ │
│  │ 📊 Capacidad Insuficiente:                                  │ │
│  │    Participantes activos: 30                                │ │
│  │    Capacidad del aula: 25                                   │ │
│  │                                                              │ │
│  │ ⚠️ Conflictos Horarios:                                     │ │
│  │                                                              │ │
│  │ ┌────────────────────────────────────────────────────────┐ │ │
│  │ │ [ACTIVIDAD] Piano Avanzado                             │ │ │
│  │ │ LUNES 18:00 - 20:00                                    │ │ │
│  │ └────────────────────────────────────────────────────────┘ │ │
│  │                                                              │ │
│  │ ┌────────────────────────────────────────────────────────┐ │ │
│  │ │ [RESERVA] Ensayo de orquesta                           │ │ │
│  │ │ 2025-12-15  19:00 - 21:00                              │ │ │
│  │ └────────────────────────────────────────────────────────┘ │ │
│  │                                                              │ │
│  │ 💡 Ver sugerencias de aulas disponibles                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│                                     [Cancelar]  [Ver Sugerencias]│
└──────────────────────────────────────────────────────────────────┘
```

---

## 11. Manejo de Errores

### 🚨 Tipos de Errores y Cómo Mostrarlos

| Código Error | Mensaje Backend | Cómo Mostrar en UI |
|--------------|----------------|---------------------|
| `400` | "La actividad no tiene horarios definidos" | Alert warning + botón "Agregar Horarios" |
| `400` | "El aula ya está asignada a esta actividad" | Alert error + botón "Ver Aulas Asignadas" |
| `400` | "Capacidad del aula insuficiente" | Alert warning con detalles de capacidad |
| `400` | "El aula tiene conflictos horarios" | Alert error + tabla de conflictos detallada |
| `404` | "Actividad no encontrada" | Alert error + botón "Volver a Actividades" |
| `404` | "Aula no encontrada" | Alert error + refrescar selector |
| `500` | Error interno del servidor | Toast error genérico |

### 📋 Componente de Manejo de Errores

```tsx
// components/shared/ErrorHandler.tsx

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorHandlerProps {
  error: {
    message: string;
    details?: any;
  };
  onRetry?: () => void;
  onNavigate?: () => void;
}

export const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  error,
  onRetry,
  onNavigate
}) => {
  // Detectar tipo de error por mensaje
  const errorType = detectarTipoError(error.message);

  switch (errorType) {
    case 'SIN_HORARIOS':
      return (
        <Alert variant="warning">
          <AlertDescription>
            ⚠️ Esta actividad no tiene horarios definidos.
            <Button variant="link" onClick={onNavigate}>
              Agregar Horarios Primero
            </Button>
          </AlertDescription>
        </Alert>
      );

    case 'CONFLICTOS_HORARIOS':
      return (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>❌ Conflictos Horarios Detectados</strong>
            <ConflictosTable conflictos={error.details?.conflictos} />
            <Button variant="outline" onClick={onRetry} className="mt-2">
              Ver Otras Aulas
            </Button>
          </AlertDescription>
        </Alert>
      );

    case 'CAPACIDAD_INSUFICIENTE':
      return (
        <Alert variant="warning">
          <AlertDescription>
            <strong>⚠️ Capacidad Insuficiente</strong>
            <p>Participantes: {error.details?.participantes}</p>
            <p>Capacidad aula: {error.details?.capacidad}</p>
            <Button variant="outline" onClick={onRetry} className="mt-2">
              Ver Aulas con Mayor Capacidad
            </Button>
          </AlertDescription>
        </Alert>
      );

    default:
      return (
        <Alert variant="destructive">
          <AlertDescription>
            ❌ {error.message}
            {onRetry && (
              <Button variant="outline" onClick={onRetry} className="mt-2">
                Reintentar
              </Button>
            )}
          </AlertDescription>
        </Alert>
      );
  }
};

function detectarTipoError(mensaje: string): string {
  if (mensaje.includes('horarios')) return 'SIN_HORARIOS';
  if (mensaje.includes('conflictos')) return 'CONFLICTOS_HORARIOS';
  if (mensaje.includes('capacidad')) return 'CAPACIDAD_INSUFICIENTE';
  return 'GENERICO';
}
```

---

## 12. Casos de Uso Completos

### 📘 Caso de Uso 1: Asignar Primera Aula a Actividad Nueva

**Escenario:** El usuario acaba de crear una actividad y quiere asignarle un aula.

**Pasos:**

1. Usuario navega a Actividades → Selecciona "Coro de Adultos" → Tab "AULAS"
2. Sistema muestra: "No hay aulas asignadas"
3. Sistema verifica si actividad tiene horarios:
   - ❌ **NO tiene horarios** → Mostrar warning + deshabilitar botón
   - ✅ **SÍ tiene horarios** → Habilitar botón "Asignar Aula"
4. Usuario hace clic en "Asignar Aula"
5. Sistema abre modal con 2 tabs: "Ver Sugerencias" | "Búsqueda Manual"
6. Usuario selecciona tab "Ver Sugerencias"
7. Sistema hace `GET /api/actividades/5/aulas/sugerencias`
8. Sistema muestra lista de aulas ordenadas por score
9. Usuario selecciona "Sala Principal" (score 100)
10. Sistema automáticamente hace `POST /api/actividades/5/aulas/verificar-disponibilidad`
11. Sistema muestra badge verde: "✅ Aula Disponible"
12. Usuario completa:
    - Prioridad: 1 - Principal
    - Observaciones: "Aula para todas las clases regulares"
13. Usuario hace clic en "Asignar Aula"
14. Sistema hace `POST /api/actividades/5/aulas`
15. Sistema cierra modal, refetch lista, muestra toast: "✅ Aula asignada exitosamente"
16. Usuario ve la nueva aula en la lista

**Código Frontend:**
```tsx
// El flujo completo está implementado en AulasTab + AsignarAulaModal
// Ver secciones 5.1 y 5.2
```

---

### 📘 Caso de Uso 2: Intentar Asignar Aula con Conflictos

**Escenario:** El usuario intenta asignar un aula que ya está ocupada en ese horario.

**Pasos:**

1. Usuario abre modal "Asignar Aula"
2. Usuario selecciona manualmente "Sala de Ensayo"
3. Sistema hace `POST /api/actividades/5/aulas/verificar-disponibilidad`
4. **Backend detecta conflicto** con "Piano Avanzado" el LUNES 18:00-20:00
5. Sistema muestra alert rojo:
   ```
   ❌ Aula No Disponible

   Conflictos Horarios:
   • ACTIVIDAD: Piano Avanzado - LUNES 18:00-20:00
   • RESERVA: Ensayo orquesta - 2025-12-15 19:00-21:00
   ```
6. Usuario tiene 2 opciones:
   - Cancelar y elegir otra aula
   - Ver sugerencias de aulas disponibles
7. Usuario hace clic en "Ver Sugerencias"
8. Sistema muestra aulas sin conflictos
9. Usuario selecciona "Sala Principal" (sin conflictos)
10. Proceso continúa normalmente

---

### 📘 Caso de Uso 3: Cambiar Aula por Mantenimiento

**Escenario:** El aula principal está en mantenimiento, necesitan cambiar a otra.

**Pasos:**

1. Usuario ve lista de aulas asignadas
2. Usuario hace clic en "Cambiar" en el card de "Sala Principal"
3. Sistema abre modal "Cambiar Aula"
   ```
   Aula Actual: Sala Principal
   Nueva Aula: [Seleccionar...]
              [Ver Sugerencias]
   ```
4. Usuario hace clic en "Ver Sugerencias"
5. Sistema muestra aulas disponibles (excluyendo la actual)
6. Usuario selecciona "Aula 201"
7. Sistema verifica disponibilidad de "Aula 201"
8. Sistema muestra: "✅ Disponible"
9. Usuario completa:
   - Observaciones: "Cambio por mantenimiento del aula anterior"
10. Usuario confirma cambio
11. Sistema hace `PUT /api/actividades/5/aulas/3/cambiar` con `nuevaAulaId: 7`
12. **Backend automáticamente:**
    - Desasigna "Sala Principal" (soft delete)
    - Asigna "Aula 201" con misma prioridad
13. Sistema refetch lista, muestra toast: "✅ Aula cambiada exitosamente"
14. Usuario ve:
    - "Sala Principal" ya no aparece (o aparece como inactiva si `soloActivas=false`)
    - "Aula 201" aparece como principal

---

### 📘 Caso de Uso 4: Asignar Múltiples Aulas (Principal + Alternativas)

**Escenario:** Una actividad muy grande necesita varias aulas.

**Pasos:**

1. Usuario asigna primera aula: "Sala Principal" con prioridad 1
2. Usuario hace clic nuevamente en "Asignar Aula"
3. Sistema muestra sugerencias (excluyendo "Sala Principal" ya asignada)
4. Usuario selecciona "Aula 201" con prioridad 2 (Alternativa)
5. Usuario asigna
6. Usuario repite para "Aula 305" con prioridad 3 (Respaldo)
7. Usuario ve lista ordenada por prioridad:
   ```
   1. Sala Principal [Principal]
   2. Aula 201 [Alternativa]
   3. Aula 305 [Respaldo]
   ```

**Alternativa - Asignación Masiva:**
```tsx
// Para casos avanzados, usar endpoint de asignación múltiple
const asignarVariasAulas = async () => {
  await fetch(`/api/actividades/5/aulas/multiple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      aulas: [
        { aulaId: 3, prioridad: 1, observaciones: 'Principal' },
        { aulaId: 7, prioridad: 2, observaciones: 'Alternativa' },
        { aulaId: 10, prioridad: 3, observaciones: 'Respaldo' }
      ]
    })
  });
};
```

---

### 📘 Caso de Uso 5: Ver Resumen de Ocupación de Aula

**Escenario:** Administrador quiere saber cuánto se usa un aula específica.

**Pasos:**

1. Usuario navega a Aulas → Selecciona "Sala Principal"
2. En la vista de detalle del aula, hay una sección "Ocupación"
3. Sistema hace `GET /api/aulas/3/ocupacion`
4. Sistema muestra:
   ```
   📊 Resumen de Ocupación - Sala Principal

   🎯 Actividades Activas: 3
   📅 Reservas Puntuales: 5
   👥 Secciones Activas: 2

   Total de Asignaciones: 10
   ```
5. Usuario puede hacer clic en cada número para ver detalle

---

## 13. Testing Manual

### 🧪 Script de Testing

Usar el archivo: `tests/test-actividades-aulas.http`

**Variables de entorno:**
```http
@baseUrl = http://localhost:3001/api
@actividadId = 1
@aulaId = 1
@aulaId2 = 2
```

### ✅ Checklist de Pruebas

#### Pruebas de Asignación

- [ ] **Test 1:** Verificar disponibilidad de aula disponible → Debe retornar `disponible: true`
- [ ] **Test 2:** Verificar disponibilidad de aula con conflictos → Debe retornar `disponible: false` + array de conflictos
- [ ] **Test 3:** Obtener sugerencias → Debe retornar lista ordenada por score
- [ ] **Test 4:** Asignar aula válida → Debe retornar status 200 + asignación creada
- [ ] **Test 5:** Intentar asignar sin horarios → Debe retornar error 400
- [ ] **Test 6:** Intentar asignar aula duplicada → Debe retornar error 400
- [ ] **Test 7:** Intentar asignar con capacidad insuficiente → Debe retornar error 400
- [ ] **Test 8:** Asignar múltiples aulas → Debe retornar array de exitosas/fallidas

#### Pruebas de Consulta

- [ ] **Test 9:** Listar aulas de actividad → Debe retornar array ordenado por prioridad
- [ ] **Test 10:** Listar aulas incluyendo inactivas → Debe retornar todas
- [ ] **Test 11:** Obtener asignación por ID → Debe retornar con relaciones completas
- [ ] **Test 12:** Ver ocupación de aula → Debe retornar contadores correctos

#### Pruebas de Modificación

- [ ] **Test 13:** Actualizar prioridad → Debe cambiar prioridad exitosamente
- [ ] **Test 14:** Cambiar aula → Debe desasignar anterior y asignar nueva
- [ ] **Test 15:** Cambiar a aula con conflictos → Debe retornar error

#### Pruebas de Eliminación

- [ ] **Test 16:** Desasignar aula (soft delete) → Debe setear `activa: false`
- [ ] **Test 17:** Reactivar asignación válida → Debe setear `activa: true`
- [ ] **Test 18:** Reactivar con conflictos nuevos → Debe retornar error
- [ ] **Test 19:** Eliminar permanentemente → Debe eliminar registro de BD

### 🎯 Casos Edge a Probar

- [ ] Actividad sin horarios → Debe bloquear asignación
- [ ] Aula inactiva → Debe rechazar asignación
- [ ] Conflicto parcial (solo 30 min solapamiento) → Debe detectarlo
- [ ] Asignar el último día antes de reserva puntual → Debe validar correctamente
- [ ] Cambiar prioridad de aula única → Debe permitirlo
- [ ] Desasignar todas las aulas → Debe permitirlo (actividad puede quedar sin aula temporalmente)

---

## 📞 Soporte y Contacto

### 📝 Recursos Adicionales

- **Documentación técnica backend:** `IMPLEMENTACION_ACTIVIDADES_AULAS.md`
- **Script de testing:** `tests/test-actividades-aulas.http`
- **Schema de BD:** `prisma/schema.prisma` → Modelo `actividades_aulas`

### 🐛 Reporte de Problemas

Si encuentras errores o comportamientos inesperados:

1. Verifica que el servidor backend esté corriendo (`npm run dev`)
2. Revisa la consola del navegador para errores JavaScript
3. Revisa los logs del servidor para errores de backend
4. Consulta la documentación de validaciones (sección 7)
5. Prueba el endpoint directamente con el archivo `.http`

### ✅ Checklist de Implementación Frontend

Antes de marcar como "completo", verificar:

- [ ] Tab "AULAS" agregado a vista de Actividades
- [ ] Botón "Asignar Aula" funcional
- [ ] Modal con sugerencias implementado
- [ ] Sistema de verificación de disponibilidad funcionando
- [ ] Alertas de conflictos mostradas correctamente
- [ ] Cambio de aula implementado
- [ ] Desasignación (soft delete) funcional
- [ ] Badges de prioridad visibles
- [ ] Manejo de errores completo
- [ ] Responsive design en mobile
- [ ] Testing en todos los navegadores principales

---

**Fin de la Guía Frontend - Asignación de Aulas a Actividades**

*Generado por el equipo Backend de SIGESDA*
*Fecha: 2025-12-03*
*Versión: 1.0.0*
