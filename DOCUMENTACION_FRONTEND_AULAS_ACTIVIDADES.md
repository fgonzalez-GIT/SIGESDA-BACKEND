# 📘 Documentación Frontend: Sistema de Asignación de Aulas a Actividades

**Versión:** 1.0
**Fecha:** 2025-12-03
**Backend API Base URL:** `http://localhost:3001/api`

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Endpoints Disponibles](#endpoints-disponibles)
3. [Validaciones Automáticas](#validaciones-automáticas)
4. [Flujos de Uso Recomendados](#flujos-de-uso-recomendados)
5. [Ejemplos de Request/Response](#ejemplos-de-requestresponse)
6. [Manejo de Errores](#manejo-de-errores)
7. [Componentes UI Recomendados](#componentes-ui-recomendados)
8. [Estados y Casos Especiales](#estados-y-casos-especiales)

---

## 📌 RESUMEN EJECUTIVO

### ¿Qué es?
Sistema que permite asignar una o más aulas a actividades, validando automáticamente:
- Disponibilidad horaria (sin conflictos con otras actividades/reservas)
- Capacidad suficiente del aula
- Estados activos de actividad y aula

### ¿Para qué sirve?
- Asignar aulas permanentes a actividades (ej: "Coro de Adultos" → "Aula Principal")
- Gestionar múltiples aulas por actividad (con prioridades)
- Verificar disponibilidad antes de asignar
- Obtener sugerencias de aulas disponibles
- Cambiar aulas de actividades
- Consultar ocupación de aulas

---

## 🔌 ENDPOINTS DISPONIBLES

### 1️⃣ VERIFICAR DISPONIBILIDAD (USAR PRIMERO)

```http
POST /api/actividades/:actividadId/aulas/verificar-disponibilidad
```

**Purpose:** Validar si un aula está disponible ANTES de intentar asignarla

**Request Body:**
```json
{
  "aulaId": 5,
  "excluirAsignacionId": 10  // Opcional: para editar asignación existente
}
```

**Response (Disponible):**
```json
{
  "success": true,
  "data": {
    "disponible": true,
    "capacidadSuficiente": true,
    "participantesActuales": 15,
    "capacidadAula": 25
  }
}
```

**Response (NO Disponible - Conflicto Horario):**
```json
{
  "success": true,
  "data": {
    "disponible": false,
    "capacidadSuficiente": true,
    "participantesActuales": 15,
    "capacidadAula": 25,
    "conflictos": [
      {
        "tipo": "ACTIVIDAD",
        "id": 8,
        "nombre": "Orquesta Juvenil",
        "diaSemana": "LUNES",
        "diaSemanaId": 2,
        "horaInicio": "18:00",
        "horaFin": "20:00",
        "aulaId": 5,
        "aulaNombre": "Aula Principal"
      }
    ],
    "observaciones": []
  }
}
```

**Response (NO Disponible - Capacidad Insuficiente):**
```json
{
  "success": true,
  "data": {
    "disponible": false,
    "capacidadSuficiente": false,
    "participantesActuales": 30,
    "capacidadAula": 20,
    "conflictos": [],
    "observaciones": [
      "⚠️  Capacidad insuficiente: 30 participantes > 20 capacidad"
    ]
  }
}
```

**🎯 Cuándo usar:**
- SIEMPRE antes de mostrar el formulario de asignación
- Al cambiar el aula seleccionada en el dropdown
- Para mostrar mensajes de advertencia en tiempo real

---

### 2️⃣ OBTENER SUGERENCIAS DE AULAS

```http
GET /api/actividades/:actividadId/aulas/sugerencias
```

**Query Params (Opcionales):**
- `capacidadMinima` - Filtrar por capacidad mínima
- `tipoAulaId` - Filtrar por tipo de aula

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "aula": {
        "id": 5,
        "nombre": "Aula Principal",
        "capacidad": 30,
        "ubicacion": "Planta Baja",
        "tipoAula": {
          "id": 1,
          "nombre": "Aula Musical",
          "codigo": "MUSICAL"
        }
      },
      "disponible": true,
      "capacidadSuficiente": true,
      "tieneEquipamientoRequerido": true,
      "score": 100,
      "conflictos": []
    },
    {
      "aula": {
        "id": 7,
        "nombre": "Aula Secundaria",
        "capacidad": 25,
        "ubicacion": "Primer Piso",
        "tipoAula": { "id": 1, "nombre": "Aula Musical" }
      },
      "disponible": false,
      "capacidadSuficiente": true,
      "tieneEquipamientoRequerido": true,
      "score": 50,
      "conflictos": [
        {
          "tipo": "ACTIVIDAD",
          "nombre": "Piano Adultos",
          "diaSemana": "MARTES",
          "horaInicio": "19:00",
          "horaFin": "20:30"
        }
      ]
    }
  ],
  "total": 2
}
```

**🎯 Cuándo usar:**
- Para mostrar un listado de aulas recomendadas ordenadas por idoneidad
- Mostrar badge "Recomendada" en la de mayor score
- Mostrar icono ⚠️ en aulas con conflictos
- Deshabilitar aulas no disponibles

**🎨 UI Recomendada:**
```
┌─────────────────────────────────────────┐
│ Aulas Sugeridas para "Coro de Adultos" │
├─────────────────────────────────────────┤
│ ✅ Aula Principal           [✨ RECOMENDADA]
│    Capacidad: 30 | Disponible           │
│    Ubicación: Planta Baja               │
│    [SELECCIONAR]                        │
├─────────────────────────────────────────┤
│ ⚠️ Aula Secundaria                      │
│    Capacidad: 25 | Con conflictos       │
│    ⚠️ Martes 19:00-20:30 (Piano Adultos)│
│    [VER DETALLES]                       │
└─────────────────────────────────────────┘
```

---

### 3️⃣ ASIGNAR AULA A ACTIVIDAD

```http
POST /api/actividades/:actividadId/aulas
```

**Request Body:**
```json
{
  "aulaId": 5,
  "prioridad": 1,  // Opcional: default 1 (1 = mayor prioridad)
  "observaciones": "Aula principal del coro"  // Opcional
}
```

**Response (Éxito):**
```json
{
  "success": true,
  "message": "Aula \"Aula Principal\" asignada exitosamente a actividad \"Coro de Adultos\"",
  "data": {
    "id": 15,
    "actividadId": 3,
    "aulaId": 5,
    "fechaAsignacion": "2025-12-03T10:30:00Z",
    "fechaDesasignacion": null,
    "activa": true,
    "prioridad": 1,
    "observaciones": "Aula principal del coro",
    "actividades": {
      "id": 3,
      "nombre": "Coro de Adultos",
      "codigoActividad": "CORO-001",
      "capacidadMaxima": 25,
      "activa": true
    },
    "aulas": {
      "id": 5,
      "nombre": "Aula Principal",
      "capacidad": 30,
      "ubicacion": "Planta Baja",
      "activa": true
    }
  }
}
```

**Response (Error - Conflicto Horario):**
```json
{
  "success": false,
  "error": "No se puede asignar el aula \"Aula Principal\" a la actividad \"Coro de Adultos\" debido a conflictos horarios:\n- ACTIVIDAD: \"Orquesta Juvenil\" (LUNES 18:00-20:00)\n- SECCION: \"Piano Avanzado\" (MIERCOLES 19:00-21:00)\n\nSugerencia: Use el endpoint /verificar-disponibilidad para obtener aulas alternativas."
}
```

**🎯 Cuándo usar:**
- SOLO después de verificar disponibilidad
- Al confirmar la selección de aula
- Al hacer clic en "Asignar Aula" o "Guardar"

---

### 4️⃣ LISTAR AULAS DE UNA ACTIVIDAD

```http
GET /api/actividades/:actividadId/aulas?soloActivas=true
```

**Query Params:**
- `soloActivas` - Boolean (default: `true`). Si es `false`, incluye desasignadas.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "actividadId": 3,
      "aulaId": 5,
      "fechaAsignacion": "2025-12-03T10:30:00Z",
      "fechaDesasignacion": null,
      "activa": true,
      "prioridad": 1,
      "observaciones": "Aula principal",
      "aulas": {
        "id": 5,
        "nombre": "Aula Principal",
        "capacidad": 30,
        "ubicacion": "Planta Baja"
      }
    },
    {
      "id": 16,
      "actividadId": 3,
      "aulaId": 7,
      "activa": true,
      "prioridad": 2,
      "aulas": {
        "id": 7,
        "nombre": "Aula Alternativa",
        "capacidad": 20,
        "ubicacion": "Primer Piso"
      }
    }
  ],
  "total": 2
}
```

**🎯 Cuándo usar:**
- Vista detalle de actividad (pestaña "Aulas")
- Dashboard de actividad
- Al editar actividad

**🎨 UI Recomendada:**
```
┌─────────────────────────────────────┐
│ Aulas Asignadas                     │
├─────────────────────────────────────┤
│ 🏆 Aula Principal (Prioridad 1)     │
│    Capacidad: 30 | Planta Baja      │
│    Asignada: 03/12/2025             │
│    [CAMBIAR] [DESASIGNAR]           │
├─────────────────────────────────────┤
│ 📍 Aula Alternativa (Prioridad 2)   │
│    Capacidad: 20 | Primer Piso      │
│    [CAMBIAR] [DESASIGNAR]           │
└─────────────────────────────────────┘
```

---

### 5️⃣ CAMBIAR AULA DE ACTIVIDAD

```http
PUT /api/actividades/:actividadId/aulas/:aulaIdActual/cambiar
```

**Request Body:**
```json
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
    "asignacionAnterior": { /* ... datos del aula anterior ... */ },
    "nuevaAsignacion": { /* ... datos del aula nueva ... */ }
  }
}
```

**🎯 Cuándo usar:**
- Botón "Cambiar Aula" en listado de aulas asignadas
- Modal de cambio de aula

**🎨 Flujo UI Recomendado:**
```
1. Usuario hace clic en "Cambiar Aula"
2. Modal muestra sugerencias de aulas disponibles
3. Usuario selecciona nueva aula
4. Sistema valida disponibilidad
5. Al confirmar: desasigna anterior + asigna nueva
```

---

### 6️⃣ DESASIGNAR AULA (SOFT DELETE)

```http
POST /api/actividades-aulas/:asignacionId/desasignar
```

**Request Body:**
```json
{
  "fechaDesasignacion": "2025-12-31T23:59:59Z",  // Opcional: default HOY
  "observaciones": "Fin de ciclo lectivo"  // Opcional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Aula desasignada exitosamente",
  "data": {
    "id": 15,
    "activa": false,
    "fechaDesasignacion": "2025-12-31T23:59:59Z",
    "observaciones": "Fin de ciclo lectivo"
  }
}
```

**🎯 Cuándo usar:**
- Botón "Desasignar" en listado de aulas
- Al finalizar una actividad
- Cambio temporal de aula

---

### 7️⃣ REACTIVAR ASIGNACIÓN

```http
POST /api/actividades-aulas/:asignacionId/reactivar
```

**Response:**
```json
{
  "success": true,
  "message": "Asignación reactivada exitosamente",
  "data": { /* asignación reactivada */ }
}
```

**🎯 Cuándo usar:**
- Vista de historial de asignaciones
- Botón "Reactivar" en asignaciones inactivas

**⚠️ IMPORTANTE:** Al reactivar, el sistema RE-VALIDA disponibilidad horaria actual.

---

### 8️⃣ CONSULTAR OCUPACIÓN DE AULA

```http
GET /api/aulas/:aulaId/ocupacion
```

**Response:**
```json
{
  "success": true,
  "data": {
    "aula": {
      "id": 5,
      "nombre": "Aula Principal",
      "capacidad": 30,
      "ubicacion": "Planta Baja"
    },
    "ocupacion": {
      "actividadesActivas": 3,
      "totalActividades": 5,
      "reservasPuntuales": 8,
      "seccionesActivas": 2,
      "totalAsignaciones": 13
    }
  }
}
```

**🎯 Cuándo usar:**
- Vista detalle de aula
- Dashboard de aulas
- Indicador de uso del aula

**🎨 UI Recomendada:**
```
┌──────────────────────────────────┐
│ Aula Principal - Ocupación       │
├──────────────────────────────────┤
│ 📊 Actividades: 3 activas        │
│ 📅 Reservas puntuales: 8         │
│ 🏫 Secciones: 2                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Total: 13 asignaciones           │
└──────────────────────────────────┘
```

---

### 9️⃣ LISTAR ACTIVIDADES DE UN AULA

```http
GET /api/aulas/:aulaId/actividades?soloActivas=true
```

**Response:** Similar a endpoint #4, pero con actividades en lugar de aulas

---

## 🔐 VALIDACIONES AUTOMÁTICAS DEL BACKEND

### ✅ Validación 1: Actividad Existe y Está Activa

**Se ejecuta:** Al asignar aula
**Error si:**
- Actividad no existe
- Actividad está inactiva (`activa = false`)

**Mensaje de error:**
```
"Actividad con ID X no encontrada"
"No se puede asignar aula a la actividad 'Nombre' porque está inactiva"
```

**🎨 Mostrar en UI:**
- Deshabilitar botón "Asignar Aula" si actividad inactiva
- Badge "INACTIVA" en rojo

---

### ✅ Validación 2: Actividad Tiene Horarios Definidos

**Se ejecuta:** Al asignar aula
**Error si:** La actividad no tiene horarios en `horarios_actividades`

**Mensaje de error:**
```
"La actividad 'Nombre' no tiene horarios definidos. Debe asignar horarios antes de asignar un aula."
```

**🎨 Mostrar en UI:**
```
⚠️ Esta actividad no tiene horarios definidos.
   Debe definir horarios antes de asignar aulas.
   [IR A HORARIOS]
```

---

### ✅ Validación 3: Aula Existe y Está Activa

**Se ejecuta:** Al asignar aula
**Error si:**
- Aula no existe
- Aula está inactiva (`activa = false`)

**Mensaje de error:**
```
"Aula con ID X no encontrada"
"No se puede asignar el aula 'Nombre' porque está inactiva"
```

**🎨 Mostrar en UI:**
- Filtrar aulas inactivas del dropdown/listado
- Mostrar badge "INACTIVA" si se muestra

---

### ✅ Validación 4: NO Duplicar Asignación Activa

**Se ejecuta:** Al asignar aula
**Error si:** Ya existe una asignación activa de esa aula a esa actividad

**Mensaje de error:**
```
"El aula 'Nombre Aula' ya está asignada a la actividad 'Nombre Actividad'. Si desea reasignar, primero desasigne el aula existente."
```

**🎨 Mostrar en UI:**
- Marcar como "Ya asignada" en el selector
- Deshabilitar opción
- Mostrar badge "ASIGNADA"

---

### ✅ Validación 5: Capacidad Suficiente

**Se ejecuta:** Al asignar aula
**Verifica:** `participantes_activos <= aula.capacidad`

**Mensaje de error:**
```
"Capacidad insuficiente: El aula 'Nombre' tiene capacidad para 20 personas, pero la actividad 'Nombre' tiene 30 participantes activos. Necesita un aula con capacidad mínima de 30 personas."
```

**🎨 Mostrar en UI:**
```
Aula Principal
Capacidad: 20/30 ⚠️ INSUFICIENTE
15 participantes activos
```

**Cálculo para mostrar:**
```javascript
const participantesActivos = 15;
const capacidadAula = 20;
const porcentajeUso = (participantesActivos / capacidadAula) * 100;

// Mostrar colores según porcentaje:
// Verde: 0-70%
// Amarillo: 71-90%
// Rojo: 91-100%
```

---

### ✅ Validación 6: Disponibilidad Horaria (LA MÁS IMPORTANTE)

**Se ejecuta:** Al asignar aula
**Verifica conflictos con:**
1. Otras actividades en la misma aula
2. Reservas puntuales (`reserva_aulas`)
3. Reservas de secciones (`reservas_aulas_secciones`)

**Mensaje de error:**
```
"No se puede asignar el aula 'Aula Principal' a la actividad 'Coro de Adultos' debido a conflictos horarios:
- ACTIVIDAD: 'Orquesta Juvenil' (LUNES 18:00-20:00)
- RESERVA: 'Ensayo Piano' (MIERCOLES 19:00-20:30)
- SECCION: 'Piano Avanzado' (VIERNES 17:00-19:00)

Sugerencia: Use el endpoint /verificar-disponibilidad para obtener aulas alternativas."
```

**🎨 Mostrar en UI:**

**Opción 1 - Lista de Conflictos:**
```
⚠️ CONFLICTOS HORARIOS DETECTADOS

┌─────────────────────────────────────┐
│ LUNES 18:00 - 20:00                 │
│ 🎵 Orquesta Juvenil                 │
│ Tipo: Actividad                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ MIÉRCOLES 19:00 - 20:30             │
│ 🎹 Ensayo Piano                     │
│ Tipo: Reserva Puntual               │
└─────────────────────────────────────┘

Esta aula NO está disponible.
[VER AULAS ALTERNATIVAS]
```

**Opción 2 - Vista de Calendario:**
```
Semana: Aula Principal
┌────┬──────┬──────┬──────┬──────┬──────┐
│    │ LUN  │ MAR  │ MIE  │ JUE  │ VIE  │
├────┼──────┼──────┼──────┼──────┼──────┤
│18:00│ ⚠️  │      │      │      │      │
│    │Orq.  │      │      │      │      │
├────┼──────┼──────┼──────┼──────┼──────┤
│19:00│ ⚠️  │      │ ⚠️  │      │ ⚠️  │
│    │Orq.  │      │Piano│      │Piano │
│    │      │      │     │      │Avanz.│
└────┴──────┴──────┴──────┴──────┴──────┘

⚠️ = Conflicto
```

---

## 🎯 FLUJOS DE USO RECOMENDADOS

### FLUJO 1: Asignar Aula a Nueva Actividad

```
1. Usuario va a "Nueva Actividad"
2. Llena datos básicos (nombre, tipo, etc.)
3. Define horarios (OBLIGATORIO antes de asignar aula)
4. Hace clic en "Asignar Aula"

5. Frontend:
   GET /api/actividades/:id/aulas/sugerencias
   Muestra listado de aulas ordenadas por score

6. Usuario selecciona un aula

7. Frontend (opcional pero recomendado):
   POST /api/actividades/:id/aulas/verificar-disponibilidad
   Muestra mensaje de confirmación o advertencia

8. Usuario confirma

9. Frontend:
   POST /api/actividades/:id/aulas
   { "aulaId": X, "prioridad": 1 }

10. Mostrar mensaje de éxito y actualizar vista
```

---

### FLUJO 2: Ver Aulas de Actividad Existente

```
1. Usuario abre detalle de actividad

2. Frontend:
   GET /api/actividades/:id/aulas?soloActivas=true

3. Muestra listado con:
   - Nombre del aula
   - Capacidad vs Participantes
   - Prioridad
   - Ubicación
   - Botones: [Cambiar] [Desasignar]
```

---

### FLUJO 3: Cambiar Aula de Actividad

```
1. Usuario hace clic en "Cambiar Aula"

2. Frontend:
   GET /api/actividades/:id/aulas/sugerencias

3. Modal muestra sugerencias ordenadas

4. Usuario selecciona nueva aula

5. Frontend (recomendado):
   POST /api/actividades/:id/aulas/verificar-disponibilidad
   { "aulaId": nuevaAulaId }

6. Mostrar confirmación

7. Frontend:
   PUT /api/actividades/:id/aulas/:aulaActualId/cambiar
   { "nuevaAulaId": X, "observaciones": "..." }

8. Actualizar vista
```

---

### FLUJO 4: Validación en Tiempo Real al Seleccionar Aula

```javascript
// React/Vue example
const handleAulaChange = async (aulaId) => {
  setLoading(true);

  try {
    const response = await fetch(
      `/api/actividades/${actividadId}/aulas/verificar-disponibilidad`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aulaId })
      }
    );

    const { data } = await response.json();

    if (!data.disponible) {
      // Mostrar advertencias
      if (data.conflictos && data.conflictos.length > 0) {
        setConflictos(data.conflictos);
        showWarning('Esta aula tiene conflictos horarios. Ver detalles.');
      }

      if (!data.capacidadSuficiente) {
        showError(`Capacidad insuficiente: ${data.participantesActuales} participantes > ${data.capacidadAula} capacidad`);
        setCanSubmit(false);
      }
    } else {
      setConflictos([]);
      showSuccess('✅ Aula disponible');
      setCanSubmit(true);
    }
  } catch (error) {
    showError('Error al verificar disponibilidad');
  } finally {
    setLoading(false);
  }
};
```

---

## ⚠️ MANEJO DE ERRORES

### Errores Comunes y Cómo Mostrarlos

| Código | Error | Causa | UI Recomendada |
|--------|-------|-------|----------------|
| 400 | "Actividad no tiene horarios definidos" | Falta crear horarios | Alert con botón "Definir Horarios" |
| 400 | "Capacidad insuficiente" | Aula muy pequeña | Badge rojo + mensaje explicativo |
| 400 | "Conflicto de horarios detectado" | Aula ocupada en esos horarios | Modal con lista de conflictos |
| 400 | "Ya está asignada" | Duplicado | Deshabilitar opción en selector |
| 404 | "Actividad no encontrada" | ID inválido | Redirect a lista de actividades |
| 404 | "Aula no encontrada" | ID inválido | Refrescar lista de aulas |

---

### Estructura de Respuesta de Error

```json
{
  "success": false,
  "error": "Mensaje de error principal",
  "details": [  // Opcional
    {
      "field": "aulaId",
      "message": "El aula no está activa"
    }
  ]
}
```

---

## 🎨 COMPONENTES UI RECOMENDADOS

### 1. Selector de Aula con Validación

```jsx
<AulaSelectorConValidacion
  actividadId={3}
  onAulaSelected={(aula) => {
    // Handle selection
  }}
  showSuggestions={true}
  autoValidate={true}  // Valida al seleccionar
/>
```

**Features:**
- Muestra sugerencias ordenadas por score
- Valida disponibilidad al cambiar selección
- Muestra badges: "Recomendada", "Con conflictos", "Capacidad insuficiente"
- Loading state durante validación

---

### 2. Lista de Aulas Asignadas

```jsx
<AulasAsignadasList
  actividadId={3}
  showActions={true}  // Mostrar botones Cambiar/Desasignar
  onAulaChanged={() => {
    // Refrescar lista
  }}
/>
```

**Features:**
- Ordenadas por prioridad
- Muestra capacidad vs participantes
- Botones de acción contextuales
- Indicador visual de prioridad (🏆 para prioridad 1)

---

### 3. Modal de Conflictos Horarios

```jsx
<ConflictosHorariosModal
  conflictos={conflictos}
  aulaNombre="Aula Principal"
  onVerAlternativas={() => {
    // Mostrar sugerencias
  }}
/>
```

**Features:**
- Lista detallada de conflictos
- Agrupada por día de la semana
- Botón para ver aulas alternativas
- Indicadores de tipo de conflicto (Actividad/Reserva/Sección)

---

### 4. Badge de Disponibilidad

```jsx
<DisponibilidadBadge
  disponible={true}
  capacidadSuficiente={true}
  numConflictos={0}
/>
```

**Variantes:**
- ✅ Verde: Disponible
- ⚠️ Amarillo: Con conflictos pero puede asignarse
- ❌ Rojo: No disponible
- 📊 Azul: Capacidad al límite

---

### 5. Indicador de Ocupación de Aula

```jsx
<OcupacionAulaWidget
  aulaId={5}
  compact={false}  // Versión expandida o compacta
/>
```

**Muestra:**
- Porcentaje de ocupación
- Número de actividades/reservas/secciones
- Gráfico de barras o circular
- Última actualización

---

## 📊 ESTADOS Y CASOS ESPECIALES

### Estado 1: Actividad sin Horarios

**Condición:** `horarios_actividades` vacío
**Comportamiento:** Backend rechaza asignación
**UI:**
```
┌─────────────────────────────────────┐
│ ⚠️ No se pueden asignar aulas       │
│                                     │
│ Esta actividad no tiene horarios   │
│ definidos. Primero debe:            │
│                                     │
│ 1. Definir horarios de la actividad│
│ 2. Luego asignar aulas              │
│                                     │
│ [DEFINIR HORARIOS]                  │
└─────────────────────────────────────┘
```

---

### Estado 2: Actividad con Múltiples Aulas

**Caso de uso:** Actividad grande que usa varias aulas
**UI:**
```
Aulas Asignadas (3)

🏆 Aula Principal (Prioridad 1)
   📍 Planta Baja | 👥 30 personas

📍 Aula Secundaria (Prioridad 2)
   📍 Primer Piso | 👥 25 personas

📍 Aula Auxiliar (Prioridad 3)
   📍 Planta Baja | 👥 15 personas

[+ AGREGAR OTRA AULA]
```

**Permitir:**
- Reordenar prioridades (drag & drop)
- Eliminar aulas
- Agregar más aulas

---

### Estado 3: Aula con Alta Ocupación

**Condición:** `totalAsignaciones > 10`
**UI:**
```
⚠️ Esta aula tiene alta ocupación
   13 asignaciones totales

   - 3 Actividades permanentes
   - 8 Reservas puntuales
   - 2 Secciones

   Puede haber dificultad para
   encontrar horarios disponibles.

   [VER OCUPACIÓN DETALLADA]
```

---

### Estado 4: Cambio de Aula en Progreso

**UI Flow:**
```
1. Loading: "Verificando disponibilidad..."
2. Success: "✅ Nueva aula disponible"
3. Confirm: "¿Confirmar cambio de aula?"
4. Loading: "Cambiando aula..."
5. Success: "✅ Aula cambiada exitosamente"
```

---

## 🔔 NOTIFICACIONES Y MENSAJES

### Mensajes de Éxito

```
✅ "Aula asignada exitosamente"
✅ "Aula cambiada exitosamente"
✅ "Aula desasignada"
✅ "Asignación reactivada"
```

**Mostrar:** Toast/Snackbar verde, 3 segundos

---

### Mensajes de Advertencia

```
⚠️ "Esta aula tiene conflictos horarios. Ver detalles."
⚠️ "Capacidad al 90%. Puede llenarse pronto."
⚠️ "La actividad no tiene horarios definidos."
```

**Mostrar:** Alert amarillo, persistente hasta acción

---

### Mensajes de Error

```
❌ "No se puede asignar aula: conflictos horarios"
❌ "Capacidad insuficiente para participantes actuales"
❌ "El aula está inactiva"
```

**Mostrar:** Alert rojo, con botón "Ver detalles"

---

## 🧪 CASOS DE PRUEBA PARA FRONTEND

### Test 1: Happy Path - Asignar Aula Disponible
1. Seleccionar actividad con horarios
2. Abrir selector de aulas
3. Seleccionar aula disponible (verde)
4. Confirmar asignación
5. ✅ Verificar mensaje de éxito
6. ✅ Verificar aula aparece en lista

### Test 2: Error - Aula con Conflicto
1. Seleccionar actividad
2. Seleccionar aula con conflicto
3. ⚠️ Verificar modal de conflictos
4. ⚠️ Verificar detalles de conflicto
5. Click en "Ver alternativas"
6. ✅ Verificar lista de sugerencias

### Test 3: Error - Actividad sin Horarios
1. Seleccionar actividad sin horarios
2. Intentar asignar aula
3. ❌ Verificar mensaje de error
4. ✅ Verificar botón "Definir Horarios"

### Test 4: Cambio de Aula
1. Abrir actividad con aula asignada
2. Click en "Cambiar Aula"
3. Seleccionar nueva aula
4. ✅ Verificar validación
5. Confirmar cambio
6. ✅ Verificar actualización en lista

---

## 📞 SOPORTE Y DEBUGGING

### Logs Útiles para Debugging

```javascript
// Al verificar disponibilidad
console.log('Verificando disponibilidad:', {
  actividadId,
  aulaId,
  response: data
});

// Al asignar aula
console.log('Asignando aula:', {
  actividadId,
  aulaId,
  prioridad,
  response: data
});

// Al detectar error
console.error('Error al asignar aula:', {
  error: error.message,
  status: response.status,
  details: error.details
});
```

---

### Checklist Pre-Asignación

```
Frontend debe verificar:
☑️ Actividad tiene ID válido
☑️ Actividad tiene horarios definidos
☑️ Aula seleccionada es válida
☑️ Se ejecutó verificación de disponibilidad
☑️ Usuario confirmó la asignación

Backend valida automáticamente:
✅ Actividad existe y activa
✅ Horarios definidos
✅ Aula existe y activa
✅ No duplicado
✅ Capacidad suficiente
✅ Sin conflictos horarios
```

---

## 🚀 QUICK START PARA DESARROLLADORES

### Ejemplo Mínimo Funcional

```javascript
// 1. Obtener sugerencias
const getSugerencias = async (actividadId) => {
  const response = await fetch(
    `/api/actividades/${actividadId}/aulas/sugerencias`
  );
  return response.json();
};

// 2. Verificar disponibilidad
const verificarDisponibilidad = async (actividadId, aulaId) => {
  const response = await fetch(
    `/api/actividades/${actividadId}/aulas/verificar-disponibilidad`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aulaId })
    }
  );
  return response.json();
};

// 3. Asignar aula
const asignarAula = async (actividadId, aulaId) => {
  const response = await fetch(
    `/api/actividades/${actividadId}/aulas`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aulaId, prioridad: 1 })
    }
  );
  return response.json();
};

// 4. Listar aulas asignadas
const getAulasAsignadas = async (actividadId) => {
  const response = await fetch(
    `/api/actividades/${actividadId}/aulas?soloActivas=true`
  );
  return response.json();
};

// FLUJO COMPLETO
async function flujoCompletoAsignarAula(actividadId, aulaId) {
  try {
    // Paso 1: Verificar
    const { data: disponibilidad } = await verificarDisponibilidad(
      actividadId,
      aulaId
    );

    if (!disponibilidad.disponible) {
      alert('Aula no disponible: ' +
        (disponibilidad.conflictos?.[0]?.nombre || 'Conflicto detectado'));
      return;
    }

    // Paso 2: Asignar
    const { data: asignacion } = await asignarAula(actividadId, aulaId);
    alert('✅ Aula asignada: ' + asignacion.aulas.nombre);

    // Paso 3: Refrescar lista
    const { data: aulas } = await getAulasAsignadas(actividadId);
    console.log('Aulas actualizadas:', aulas);

  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
}
```

---

## 📋 RESUMEN PARA FRONTEND

### Lo Más Importante

1. **SIEMPRE verificar disponibilidad ANTES de asignar**
2. **Mostrar conflictos de forma clara y detallada**
3. **Usar sugerencias para facilitar selección**
4. **Validar en tiempo real al cambiar selección**
5. **Manejar errores con mensajes descriptivos**
6. **Actualizar vista después de cada operación**

---

### Endpoints Esenciales (Mínimo Viable)

```
✅ POST /verificar-disponibilidad  (OBLIGATORIO)
✅ POST /aulas                      (Asignar)
✅ GET  /aulas                      (Listar)
✅ PUT  /aulas/:id/cambiar         (Cambiar)
⚡ GET  /aulas/sugerencias         (Recomendado)
```

---

### UX Best Practices

1. **Feedback Inmediato:** Mostrar validación en tiempo real
2. **Claridad:** Explicar por qué no se puede asignar
3. **Ayuda Proactiva:** Sugerir aulas alternativas automáticamente
4. **Confirmación:** Pedir confirmación en cambios importantes
5. **Reversibilidad:** Permitir desasignar/reactivar fácilmente

---

**¿Preguntas?** Contactar al equipo de backend.

**Última actualización:** 2025-12-03
