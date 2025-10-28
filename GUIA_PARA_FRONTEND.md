# 📱 GUÍA PARA EQUIPO FRONTEND - Módulo Persona v2

**Destinatario:** Equipo de Desarrollo Frontend
**Propósito:** Implementar interfaz para módulo Persona con múltiples tipos
**Fecha:** 2025-10-27

---

## 📋 ORDEN DE LECTURA RECOMENDADO

Sigue este orden para una comprensión progresiva del sistema:

### 🎯 FASE 1: COMPRENSIÓN GENERAL (15-20 min)

#### 1. **LEER PRIMERO** - Resumen Ejecutivo
📄 **[README_PERSONA_MULTIPLES_TIPOS.md](./README_PERSONA_MULTIPLES_TIPOS.md)**

**Por qué leerlo:**
- Vista general del proyecto completo
- Entender QUÉ cambió y POR QUÉ
- Ver ejemplos rápidos de uso

**Puntos clave a entender:**
- ✅ Ahora una persona puede tener MÚLTIPLES tipos
- ✅ 38 endpoints disponibles (26 públicos + 12 admin)
- ✅ Tipos se gestionan dinámicamente (sin hardcodear)

**Tiempo:** 5-10 minutos

---

#### 2. **LEER SEGUNDO** - Resumen de Implementación
📄 **[RESUMEN_REFACTORIZACION_PERSONA.md](./RESUMEN_REFACTORIZACION_PERSONA.md)**

**Por qué leerlo:**
- Entender el cambio de modelo de datos
- Ver arquitectura del sistema
- Conocer funcionalidades implementadas

**Puntos clave a entender:**
```
ANTES: Persona → tipo (ENUM único)
AHORA: Persona → tipos[] (múltiples)
```

**Tiempo:** 5-10 minutos

---

### 🔧 FASE 2: DOCUMENTACIÓN TÉCNICA DE API (30-45 min)

#### 3. **LEER TERCERO** - API Principal (OBLIGATORIO)
📄 **[docs/API_PERSONA_V2.md](./docs/API_PERSONA_V2.md)**

**⭐ ESTE ES EL DOCUMENTO MÁS IMPORTANTE PARA FRONTEND**

**Por qué leerlo:**
- Documentación completa de todos los endpoints
- Ejemplos con curl (fácil de traducir a fetch/axios)
- Request/Response de cada endpoint
- Códigos de error
- Validaciones

**Secciones críticas:**

1. **Crear Persona** (página 1)
   ```json
   POST /api/personas
   {
     "nombre": "Juan",
     "apellido": "Pérez",
     "dni": "12345678",
     "tipos": [
       {
         "tipoPersonaCodigo": "SOCIO",
         "categoriaId": 1
       }
     ],
     "contactos": [...]
   }
   ```

2. **Listar Personas** (página 2)
   ```
   GET /api/personas?tiposCodigos=SOCIO,DOCENTE&includeTipos=true
   ```

3. **Gestión de Tipos** (página 8)
   ```
   POST /api/personas/:id/tipos
   DELETE /api/personas/:id/tipos/:tipoId
   ```

4. **Gestión de Contactos** (página 10)
   ```
   POST /api/personas/:id/contactos
   ```

5. **Catálogos** (página 12)
   ```
   GET /api/catalogos/tipos-persona
   GET /api/catalogos/especialidades-docentes
   ```

**Tiempo:** 20-30 minutos

---

#### 4. **LEER CUARTO** - API Admin (SOLO SI DESARROLLAN PANEL ADMIN)
📄 **[docs/API_CATALOGOS_ADMIN.md](./docs/API_CATALOGOS_ADMIN.md)**

**Por qué leerlo:**
- Solo necesario si van a desarrollar interfaz administrativa
- Gestión de catálogos (crear/editar/eliminar tipos)
- Requiere autenticación y rol ADMIN

**Cuándo leerlo:**
- ⏭️ Saltar si no van a desarrollar panel admin
- ✅ Leer si van a implementar gestión de catálogos

**Tiempo:** 15-20 minutos

---

### 📖 FASE 3: DETALLES DE IMPLEMENTACIÓN (OPCIONAL - 20-30 min)

#### 5. **LEER QUINTO** - Guía de Integración (OPCIONAL)
📄 **[GUIA_INTEGRACION_PERSONA_V2.md](./GUIA_INTEGRACION_PERSONA_V2.md)**

**Por qué leerlo:**
- Entender opciones de integración (v1 vs v2)
- Conocer proceso de activación del backend
- Ver verificaciones post-integración

**Cuándo leerlo:**
- Si necesitan coordinarse con backend
- Si van a hacer testing conjunto
- Si necesitan entender migración de datos

**Tiempo:** 10-15 minutos

---

#### 6. **LEER SEXTO** - Implementación Técnica (OPCIONAL)
📄 **[IMPLEMENTACION_PERSONA_MULTIPLES_TIPOS.md](./IMPLEMENTACION_PERSONA_MULTIPLES_TIPOS.md)**

**Por qué leerlo:**
- Detalles técnicos de la implementación backend
- Estructura de base de datos
- Principalmente para curiosidad técnica

**Cuándo leerlo:**
- Si tienen dudas sobre cómo funciona internamente
- Si necesitan debuggear problemas complejos
- Generalmente NO necesario para frontend

**Tiempo:** 10-15 minutos

---

## 🎯 RESUMEN: ¿QUÉ LEER SEGÚN TU ROL?

### 👨‍💻 Developer Frontend - CRUD Personas (Todos deben leer)

```
✅ OBLIGATORIO:
1. README_PERSONA_MULTIPLES_TIPOS.md
2. RESUMEN_REFACTORIZACION_PERSONA.md
3. docs/API_PERSONA_V2.md (⭐ MÁS IMPORTANTE)

⏭️ OPCIONAL:
4. GUIA_INTEGRACION_PERSONA_V2.md
```

**Tiempo total:** ~40-50 minutos

---

### 👨‍💼 Developer Frontend - Panel Admin (Además de lo anterior)

```
✅ OBLIGATORIO (adicional):
4. docs/API_CATALOGOS_ADMIN.md
5. RESUMEN_GESTION_CATALOGOS.md

⏭️ OPCIONAL:
6. PROPUESTA_GESTION_CATALOGOS_TIPOS.md
```

**Tiempo total adicional:** ~30-40 minutos

---

### 🎨 UI/UX Designer

```
✅ OBLIGATORIO:
1. README_PERSONA_MULTIPLES_TIPOS.md (secciones de ejemplos)
2. docs/API_PERSONA_V2.md (ver estructura de datos)

📝 ENFOCARSE EN:
- Casos de uso (Ejemplos de Uso)
- Estructura de datos (Request/Response)
- Validaciones (para mensajes de error)
```

**Tiempo total:** ~30 minutos

---

### 🧪 QA / Tester

```
✅ OBLIGATORIO:
1. README_PERSONA_MULTIPLES_TIPOS.md
2. docs/API_PERSONA_V2.md (todos los endpoints)
3. docs/API_CATALOGOS_ADMIN.md (si prueban admin)

📝 ENFOCARSE EN:
- Validaciones y Restricciones
- Códigos de Error
- Ejemplos de Uso (casos de prueba)
```

**Tiempo total:** ~60 minutos

---

## 📚 DOCUMENTOS DE REFERENCIA RÁPIDA

Durante el desarrollo, tener a mano:

| Necesidad | Documento | Sección |
|-----------|-----------|---------|
| ¿Cómo crear persona? | API_PERSONA_V2.md | Pág. 1 - Crear Persona |
| ¿Cómo listar personas? | API_PERSONA_V2.md | Pág. 2 - Listar Personas |
| ¿Cómo asignar tipo? | API_PERSONA_V2.md | Pág. 8 - Asignar Tipo |
| ¿Qué tipos existen? | API_PERSONA_V2.md | Pág. 12 - Catálogos |
| ¿Códigos de error? | API_PERSONA_V2.md | Última pág. - Códigos Error |
| ¿Crear nuevo tipo? | API_CATALOGOS_ADMIN.md | Pág. 1 - Crear Tipo |

---

## 🚀 CHECKLIST DE IMPLEMENTACIÓN FRONTEND

### Paso 1: Comprensión (Día 1)
- [ ] Leer README_PERSONA_MULTIPLES_TIPOS.md
- [ ] Leer RESUMEN_REFACTORIZACION_PERSONA.md
- [ ] Leer docs/API_PERSONA_V2.md
- [ ] Reunión de equipo para resolver dudas

### Paso 2: Diseño (Día 2-3)
- [ ] Diseñar formulario de creación de persona
- [ ] Diseñar selector de múltiples tipos
- [ ] Diseñar gestión de contactos
- [ ] Diseñar filtros de búsqueda
- [ ] (Admin) Diseñar gestión de catálogos

### Paso 3: Desarrollo (Día 4-8)
- [ ] Implementar servicios API (fetch/axios)
- [ ] Implementar componentes de UI
- [ ] Implementar validaciones frontend
- [ ] Integrar con backend
- [ ] Testing

### Paso 4: Testing (Día 9-10)
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Testing E2E
- [ ] Ajustes y correcciones

---

## 💡 CONCEPTOS CLAVE PARA FRONTEND

### 1. Persona puede tener MÚLTIPLES tipos

```javascript
// ❌ ANTES (un solo tipo)
const persona = {
  id: 1,
  nombre: "Juan",
  tipo: "SOCIO"  // Solo uno
}

// ✅ AHORA (múltiples tipos)
const persona = {
  id: 1,
  nombre: "Juan",
  tipos: [
    { tipoPersona: { codigo: "SOCIO" } },
    { tipoPersona: { codigo: "DOCENTE" } }
  ]
}
```

### 2. Tipos se obtienen dinámicamente

```javascript
// ❌ ANTES (hardcodeado en frontend)
const tipos = ['SOCIO', 'NO_SOCIO', 'DOCENTE', 'PROVEEDOR'];

// ✅ AHORA (obtener del backend)
const tipos = await fetch('/api/catalogos/tipos-persona')
  .then(res => res.json());
```

### 3. Cada tipo tiene campos específicos

```javascript
// SOCIO requiere:
{
  tipoPersonaCodigo: "SOCIO",
  categoriaId: 1  // OBLIGATORIO
}

// DOCENTE requiere:
{
  tipoPersonaCodigo: "DOCENTE",
  especialidadId: 1  // OBLIGATORIO
}

// PROVEEDOR requiere:
{
  tipoPersonaCodigo: "PROVEEDOR",
  cuit: "20123456789",      // OBLIGATORIO
  razonSocial: "Mi Empresa"  // OBLIGATORIO
}

// NO_SOCIO no requiere nada
{
  tipoPersonaCodigo: "NO_SOCIO"
}
```

### 4. Validaciones importantes

```javascript
// ✅ DNI único
// ✅ Email único (opcional)
// ✅ Al menos un tipo activo
// ✅ Número de socio auto-generado
// ✅ CUIT único para proveedores
```

---

## 🎨 SUGERENCIAS DE UI/UX

### Formulario de Creación de Persona

```
┌─────────────────────────────────────┐
│ Datos Personales                    │
├─────────────────────────────────────┤
│ Nombre: [_____________]             │
│ Apellido: [_____________]           │
│ DNI: [________]                     │
│ Email: [_____________]              │
│ Teléfono: [_____________]           │
├─────────────────────────────────────┤
│ Tipos de Persona                    │
├─────────────────────────────────────┤
│ ☑ Socio                             │
│   └─ Categoría: [Dropdown ▼]       │
│                                     │
│ ☑ Docente                           │
│   └─ Especialidad: [Dropdown ▼]    │
│   └─ Honorarios/hora: [_______]    │
│                                     │
│ ☐ Proveedor                         │
│   └─ CUIT: [___________]           │
│   └─ Razón Social: [__________]    │
├─────────────────────────────────────┤
│ Contactos Adicionales               │
├─────────────────────────────────────┤
│ [+ Agregar contacto]                │
│ • WhatsApp: +549351... ⭐ Principal │
│ • Instagram: @usuario              │
└─────────────────────────────────────┘
```

### Lista de Personas

```
┌─────────────────────────────────────────────┐
│ Buscar: [________________] 🔍              │
│ Filtros:                                    │
│ ☐ Socios  ☐ Docentes  ☐ Proveedores       │
│ Estado: [Todos ▼]  Categoría: [Todas ▼]   │
├─────────────────────────────────────────────┤
│ Juan Pérez                                  │
│ DNI: 12345678 | 🏷️ Socio, Docente         │
│ ✉️ juan@example.com | 📱 351-1234567       │
│ [Ver] [Editar] [Tipos]                     │
├─────────────────────────────────────────────┤
│ María García                                │
│ DNI: 87654321 | 🏷️ Socio                   │
│ ✉️ maria@example.com | 📱 351-7654321      │
│ [Ver] [Editar] [Tipos]                     │
└─────────────────────────────────────────────┘
```

### Gestión de Tipos (Modal)

```
┌─────────────────────────────────────┐
│ Tipos de Juan Pérez                 │
├─────────────────────────────────────┤
│ ✅ SOCIO (desde 2023-01-15)        │
│    Categoría: General               │
│    N° Socio: 1001                   │
│    [Editar] [Desasignar]           │
│                                     │
│ ✅ DOCENTE (desde 2023-06-10)      │
│    Especialidad: Danza              │
│    Honorarios: $8,000/hora          │
│    [Editar] [Desasignar]           │
│                                     │
│ [+ Asignar nuevo tipo]              │
└─────────────────────────────────────┘
```

---

## 🔌 EJEMPLOS DE CÓDIGO FRONTEND

### React - Obtener Catálogo de Tipos

```typescript
// services/catalogos.service.ts
export const getCatalogoTipos = async () => {
  const response = await fetch('/api/catalogos/tipos-persona');
  const data = await response.json();
  return data.data;
};

// components/PersonaForm.tsx
const [tiposDisponibles, setTiposDisponibles] = useState([]);

useEffect(() => {
  getCatalogoTipos().then(setTiposDisponibles);
}, []);

// Renderizar
{tiposDisponibles.map(tipo => (
  <Checkbox key={tipo.id} value={tipo.codigo}>
    {tipo.nombre}
  </Checkbox>
))}
```

### React - Crear Persona con Tipos

```typescript
// services/personas.service.ts
export const createPersona = async (data) => {
  const response = await fetch('/api/personas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return response.json();
};

// components/PersonaForm.tsx
const handleSubmit = async (e) => {
  e.preventDefault();

  const data = {
    nombre: formData.nombre,
    apellido: formData.apellido,
    dni: formData.dni,
    email: formData.email,
    tipos: selectedTipos.map(tipo => ({
      tipoPersonaCodigo: tipo,
      // Agregar campos específicos según tipo
      ...(tipo === 'SOCIO' && { categoriaId: formData.categoriaId }),
      ...(tipo === 'DOCENTE' && {
        especialidadId: formData.especialidadId,
        honorariosPorHora: formData.honorarios
      }),
      ...(tipo === 'PROVEEDOR' && {
        cuit: formData.cuit,
        razonSocial: formData.razonSocial
      })
    })),
    contactos: formData.contactos
  };

  try {
    await createPersona(data);
    // Mostrar mensaje de éxito
    navigate('/personas');
  } catch (error) {
    // Mostrar mensaje de error
    setError(error.message);
  }
};
```

### React - Asignar Tipo a Persona Existente

```typescript
// services/personas.service.ts
export const asignarTipo = async (personaId, tipoData) => {
  const response = await fetch(`/api/personas/${personaId}/tipos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tipoData)
  });
  return response.json();
};

// Uso
await asignarTipo(1, {
  tipoPersonaCodigo: 'DOCENTE',
  especialidadId: 1,
  honorariosPorHora: 8000
});
```

---

## ⚠️ ERRORES COMUNES A EVITAR

### 1. ❌ No hardcodear tipos

```javascript
// ❌ MAL
const TIPOS = ['SOCIO', 'NO_SOCIO', 'DOCENTE', 'PROVEEDOR'];

// ✅ BIEN
const [tipos, setTipos] = useState([]);
useEffect(() => {
  fetch('/api/catalogos/tipos-persona')
    .then(res => res.json())
    .then(data => setTipos(data.data));
}, []);
```

### 2. ❌ No asumir un solo tipo

```javascript
// ❌ MAL
const tipoPersona = persona.tipo; // Ya no existe

// ✅ BIEN
const tipos = persona.tipos.map(t => t.tipoPersona.codigo);
const esSocio = tipos.includes('SOCIO');
const esDocente = tipos.includes('DOCENTE');
```

### 3. ❌ No olvidar campos obligatorios por tipo

```javascript
// ❌ MAL
{
  tipoPersonaCodigo: "SOCIO"
  // Falta categoriaId!
}

// ✅ BIEN
{
  tipoPersonaCodigo: "SOCIO",
  categoriaId: 1
}
```

### 4. ❌ No ignorar validaciones

```javascript
// ✅ VALIDAR antes de enviar
if (selectedTipos.includes('PROVEEDOR')) {
  if (!formData.cuit || formData.cuit.length !== 11) {
    setError('CUIT debe tener 11 dígitos');
    return;
  }
  if (!formData.razonSocial) {
    setError('Razón social es obligatoria');
    return;
  }
}
```

---

## 📞 SOPORTE Y CONTACTO

### Durante el Desarrollo

**Dudas sobre API:**
- Consultar: `docs/API_PERSONA_V2.md`
- Consultar: `docs/API_CATALOGOS_ADMIN.md`

**Dudas sobre modelo de datos:**
- Consultar: `RESUMEN_REFACTORIZACION_PERSONA.md`

**Problemas de integración:**
- Consultar: `GUIA_INTEGRACION_PERSONA_V2.md`
- Contactar: Equipo Backend

**Testing conjunto:**
- Usar ejemplos de: `docs/API_PERSONA_V2.md`
- Scripts de prueba disponibles

---

## 🎯 OBJETIVOS FINALES FRONTEND

Al terminar la implementación, el usuario debe poder:

### Módulo Público
- ✅ Crear persona con múltiples tipos simultáneos
- ✅ Ver lista de personas filtrada por tipos
- ✅ Asignar/desasignar tipos a personas existentes
- ✅ Gestionar múltiples contactos por persona
- ✅ Buscar personas por nombre/DNI/tipo
- ✅ Ver historial de tipos de una persona

### Módulo Admin (si aplica)
- ✅ Crear nuevos tipos de persona
- ✅ Crear nuevas especialidades docentes
- ✅ Ver estadísticas de uso de tipos
- ✅ Activar/Desactivar tipos
- ✅ Editar tipos existentes

---

## ✅ CHECKLIST FINAL

Antes de considerar completa la implementación:

- [ ] Formulario de persona permite seleccionar múltiples tipos
- [ ] Campos dinámicos según tipo seleccionado
- [ ] Catálogos se obtienen del backend (no hardcodeados)
- [ ] Validaciones frontend coinciden con backend
- [ ] Mensajes de error claros y descriptivos
- [ ] Lista de personas muestra todos los tipos
- [ ] Filtros por múltiples tipos funcionan
- [ ] Gestión de contactos múltiples implementada
- [ ] (Admin) Panel de gestión de catálogos funcional
- [ ] Testing completo
- [ ] Documentación de componentes

---

**¡Buena suerte con la implementación!** 🚀

Si tienen dudas durante el desarrollo, consulten primero la documentación en el orden indicado.

---

**Última actualización:** 2025-10-27
