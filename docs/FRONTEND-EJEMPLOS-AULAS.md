# EJEMPLOS DE CÓDIGO PARA FRONTEND - GESTIÓN DE AULAS

Este documento contiene ejemplos prácticos de JavaScript/TypeScript para consumir la API de Aulas.

---

## 📋 ÍNDICE

1. [TypeScript Interfaces](#typescript-interfaces)
2. [Cargar Catálogos](#cargar-catálogos)
3. [Listar Aulas](#listar-aulas)
4. [Crear Aula](#crear-aula)
5. [Actualizar Aula](#actualizar-aula)
6. [Gestionar Equipamientos](#gestionar-equipamientos)
7. [Componente React Completo](#componente-react-completo)

---

## 1️⃣ TYPESCRIPT INTERFACES

```typescript
// ============================================================================
// INTERFACES COMPLETAS PARA TYPESCRIPT
// ============================================================================

interface TipoAula {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    aulas: number;
  };
}

interface EstadoAula {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    aulas: number;
  };
}

interface Equipamiento {
  id: number;
  codigo: string;
  nombre: string;
  categoriaEquipamientoId: number;
  descripcion?: string;
  observaciones?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AulaEquipamiento {
  id: number;
  aulaId: number;
  equipamientoId: number;
  cantidad: number;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  equipamiento: Equipamiento;
}

interface Aula {
  id: number;
  nombre: string;
  capacidad: number;
  ubicacion?: string;
  tipoAulaId?: number;
  estadoAulaId?: number;
  descripcion?: string;
  observaciones?: string;
  activa: boolean;
  createdAt: string;
  updatedAt: string;

  // Relaciones
  tipoAula?: TipoAula;
  estadoAula?: EstadoAula;

  // ⚠️ CAMPO CRÍTICO - Nombre correcto es aulas_equipamientos
  aulas_equipamientos?: AulaEquipamiento[];

  reserva_aulas?: any[];

  _count?: {
    reserva_aulas: number;
    reservas_aulas_secciones: number;
    aulas_equipamientos: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// DTOs para crear/actualizar
interface CreateAulaDto {
  nombre: string;
  capacidad: number;
  ubicacion?: string;

  // Opción 1: Usar IDs
  tipoAulaId?: number;
  estadoAulaId?: number;

  // Opción 2: Usar códigos string (más legible)
  tipo?: string; // "practica" | "teoria" | "ensayo" | "estudio" | "auditorio"
  estado?: string; // "disponible" | "en_mantenimiento" | "cerrada" | "reservada"

  descripcion?: string;
  observaciones?: string;
  activa?: boolean;

  // Equipamientos
  equipamientoIds?: number[]; // Array simple
  equipamientos?: Array<{ // Array completo
    equipamientoId: number;
    cantidad: number;
    observaciones?: string;
  }>;
}

interface UpdateAulaDto {
  nombre?: string;
  capacidad?: number;
  ubicacion?: string;
  tipoAulaId?: number;
  estadoAulaId?: number;
  tipo?: string;
  estado?: string;
  descripcion?: string;
  observaciones?: string;
  activa?: boolean;
}
```

---

## 2️⃣ CARGAR CATÁLOGOS

### Cargar Tipos de Aula

```javascript
// ============================================================================
// CARGAR TIPOS DE AULA
// ============================================================================

async function cargarTiposAula() {
  try {
    const response = await fetch('http://localhost:8000/api/catalogos/tipos-aulas');
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Error al cargar tipos de aula');
    }

    const tipos = result.data;
    console.log('Tipos de aula cargados:', tipos.length);

    // Ejemplo: Poblar un <select>
    const select = document.getElementById('tipo-aula-select');
    tipos.forEach(tipo => {
      const option = document.createElement('option');
      option.value = tipo.id; // Usar ID
      // option.value = tipo.codigo; // O usar código
      option.textContent = `${tipo.nombre} (${tipo._count.aulas} aulas)`;
      select.appendChild(option);
    });

    return tipos;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// React Hook Version
function useTiposAula() {
  const [tipos, setTipos] = useState<TipoAula[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/catalogos/tipos-aulas')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setTipos(result.data);
        } else {
          setError(result.error);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { tipos, loading, error };
}
```

### Cargar Estados de Aula

```javascript
// ============================================================================
// CARGAR ESTADOS DE AULA
// ============================================================================

async function cargarEstadosAula() {
  try {
    const response = await fetch('http://localhost:8000/api/catalogos/estados-aulas');
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Error al cargar estados');
    }

    return result.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// React Hook Version
function useEstadosAula() {
  const [estados, setEstados] = useState<EstadoAula[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/catalogos/estados-aulas')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setEstados(result.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { estados, loading };
}
```

### Cargar Equipamientos

```javascript
// ============================================================================
// CARGAR EQUIPAMIENTOS DISPONIBLES
// ============================================================================

async function cargarEquipamientos() {
  try {
    const response = await fetch('http://localhost:8000/api/equipamientos?activo=true');
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Error al cargar equipamientos');
    }

    return result.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// React Hook Version con búsqueda
function useEquipamientos(search = '') {
  const [equipamientos, setEquipamientos] = useState<Equipamiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({
      activo: 'true',
      ...(search && { search })
    });

    fetch(`http://localhost:8000/api/equipamientos?${params}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setEquipamientos(result.data);
        }
      })
      .finally(() => setLoading(false));
  }, [search]);

  return { equipamientos, loading };
}
```

---

## 3️⃣ LISTAR AULAS

### Listar con Paginación y Filtros

```javascript
// ============================================================================
// LISTAR AULAS CON PAGINACIÓN Y FILTROS
// ============================================================================

async function listarAulas({
  page = 1,
  limit = 10,
  activa = true,
  tipoAulaId = null,
  estadoAulaId = null,
  capacidadMinima = null,
  capacidadMaxima = null,
  conEquipamiento = null,
  search = ''
} = {}) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (activa !== null) params.append('activa', activa.toString());
    if (tipoAulaId) params.append('tipoAulaId', tipoAulaId.toString());
    if (estadoAulaId) params.append('estadoAulaId', estadoAulaId.toString());
    if (capacidadMinima) params.append('capacidadMinima', capacidadMinima.toString());
    if (capacidadMaxima) params.append('capacidadMaxima', capacidadMaxima.toString());
    if (conEquipamiento !== null) params.append('conEquipamiento', conEquipamiento.toString());
    if (search) params.append('search', search);

    const response = await fetch(`http://localhost:8000/api/aulas?${params}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Error al listar aulas');
    }

    return {
      aulas: result.data,
      meta: result.meta
    };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Ejemplo de uso
async function ejemploListarAulas() {
  // Ejemplo 1: Todas las aulas activas
  const { aulas, meta } = await listarAulas({ activa: true, page: 1, limit: 20 });
  console.log(`Total de aulas: ${meta.total}, Página ${meta.page} de ${meta.totalPages}`);

  // Ejemplo 2: Solo aulas de práctica con equipamiento
  const aulasConEquipo = await listarAulas({
    tipoAulaId: 1, // PRACTICA
    conEquipamiento: true
  });

  // Ejemplo 3: Búsqueda por texto
  const resultadosBusqueda = await listarAulas({
    search: 'piano'
  });
}

// React Hook Version
function useAulas(filters = {}) {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({
      page: '1',
      limit: '10',
      ...filters
    });

    fetch(`http://localhost:8000/api/aulas?${params}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setAulas(result.data);
          setMeta(result.meta);
        }
      })
      .finally(() => setLoading(false));
  }, [JSON.stringify(filters)]);

  return { aulas, meta, loading };
}
```

### Obtener Aula por ID

```javascript
// ============================================================================
// OBTENER AULA ESPECÍFICA POR ID
// ============================================================================

async function obtenerAulaPorId(id) {
  try {
    const response = await fetch(`http://localhost:8000/api/aulas/${id}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Aula no encontrada');
    }

    const aula = result.data;

    // ⚠️ IMPORTANTE: Los equipamientos están en aulas_equipamientos
    console.log('Aula:', aula.nombre);
    console.log('Tipo:', aula.tipoAula?.nombre);
    console.log('Estado:', aula.estadoAula?.nombre);
    console.log('Equipamientos:', aula.aulas_equipamientos?.length || 0);

    // Ejemplo: Extraer lista de nombres de equipamientos
    const nombresEquipamientos = aula.aulas_equipamientos?.map(
      ae => `${ae.equipamiento.nombre} (x${ae.cantidad})`
    ) || [];

    console.log('Lista de equipamientos:', nombresEquipamientos);

    return aula;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// React Hook Version
function useAula(id: number | null) {
  const [aula, setAula] = useState<Aula | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:8000/api/aulas/${id}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setAula(result.data);
        } else {
          setError(result.error);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { aula, loading, error };
}
```

---

## 4️⃣ CREAR AULA

### Crear Aula (Formato Simple)

```javascript
// ============================================================================
// CREAR NUEVA AULA - FORMATO SIMPLE CON CÓDIGOS STRING
// ============================================================================

async function crearAulaSimple(formData) {
  try {
    const payload = {
      nombre: formData.nombre,
      capacidad: parseInt(formData.capacidad),
      ubicacion: formData.ubicacion,
      tipo: formData.tipo, // "practica", "teoria", "ensayo", etc.
      estado: formData.estado, // "disponible", "en_mantenimiento", etc.
      descripcion: formData.descripcion,
      equipamientoIds: formData.equipamientoIds // [1, 3, 5]
    };

    const response = await fetch('http://localhost:8000/api/aulas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Error al crear aula');
    }

    console.log('Aula creada:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Ejemplo de uso
async function ejemploCrearAulaSimple() {
  const nuevaAula = await crearAulaSimple({
    nombre: 'Aula 301',
    capacidad: 25,
    ubicacion: 'Tercer Piso',
    tipo: 'practica',
    estado: 'disponible',
    descripcion: 'Aula nueva con piano',
    equipamientoIds: [5, 3, 1] // Piano, Atriles, Sillas
  });

  console.log('Aula creada con ID:', nuevaAula.id);
}
```

### Crear Aula (Formato Completo)

```javascript
// ============================================================================
// CREAR NUEVA AULA - FORMATO COMPLETO CON CANTIDADES ESPECÍFICAS
// ============================================================================

async function crearAulaCompleta(formData) {
  try {
    const payload = {
      nombre: formData.nombre,
      capacidad: parseInt(formData.capacidad),
      ubicacion: formData.ubicacion,
      tipoAulaId: parseInt(formData.tipoAulaId),
      estadoAulaId: parseInt(formData.estadoAulaId),
      descripcion: formData.descripcion,
      observaciones: formData.observaciones,
      equipamientos: formData.equipamientos.map(eq => ({
        equipamientoId: eq.equipamientoId,
        cantidad: eq.cantidad,
        observaciones: eq.observaciones
      }))
    };

    const response = await fetch('http://localhost:8000/api/aulas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Error al crear aula');
    }

    return result.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Ejemplo de uso
async function ejemploCrearAulaCompleta() {
  const nuevaAula = await crearAulaCompleta({
    nombre: 'Aula 302',
    capacidad: 30,
    ubicacion: 'Tercer Piso',
    tipoAulaId: 1, // PRACTICA
    estadoAulaId: 2, // DISPONIBLE
    descripcion: 'Sala amplia para práctica grupal',
    observaciones: 'Requiere limpieza diaria',
    equipamientos: [
      { equipamientoId: 5, cantidad: 1, observaciones: 'Piano nuevo 2025' },
      { equipamientoId: 3, cantidad: 25, observaciones: 'Atriles metálicos' },
      { equipamientoId: 1, cantidad: 30, observaciones: 'Sillas cómodas' }
    ]
  });

  console.log('Aula creada:', nuevaAula.nombre);
  console.log('Equipamientos asignados:', nuevaAula.aulas_equipamientos.length);
}
```

---

## 5️⃣ ACTUALIZAR AULA

```javascript
// ============================================================================
// ACTUALIZAR AULA EXISTENTE
// ============================================================================

async function actualizarAula(id, updates) {
  try {
    const payload = {};

    // Solo incluir campos que se van a actualizar
    if (updates.nombre) payload.nombre = updates.nombre;
    if (updates.capacidad) payload.capacidad = parseInt(updates.capacidad);
    if (updates.ubicacion !== undefined) payload.ubicacion = updates.ubicacion;
    if (updates.tipo) payload.tipo = updates.tipo;
    if (updates.estado) payload.estado = updates.estado;
    if (updates.tipoAulaId) payload.tipoAulaId = parseInt(updates.tipoAulaId);
    if (updates.estadoAulaId) payload.estadoAulaId = parseInt(updates.estadoAulaId);
    if (updates.descripcion !== undefined) payload.descripcion = updates.descripcion;
    if (updates.observaciones !== undefined) payload.observaciones = updates.observaciones;
    if (updates.activa !== undefined) payload.activa = updates.activa;

    const response = await fetch(`http://localhost:8000/api/aulas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Error al actualizar aula');
    }

    console.log('Aula actualizada:', result.message);
    return result.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Ejemplos de uso
async function ejemplosActualizar() {
  // Ejemplo 1: Cambiar solo el nombre
  await actualizarAula(10, {
    nombre: 'Aula 301 - Renovada'
  });

  // Ejemplo 2: Cambiar tipo y estado usando códigos
  await actualizarAula(10, {
    tipo: 'ensayo',
    estado: 'en_mantenimiento'
  });

  // Ejemplo 3: Actualización completa
  await actualizarAula(10, {
    nombre: 'Aula Principal',
    capacidad: 50,
    ubicacion: 'Planta Baja',
    tipoAulaId: 3, // ENSAYO
    estadoAulaId: 2, // DISPONIBLE
    descripcion: 'Sala principal para ensayos orquestales',
    observaciones: 'Incluye sistema de sonido profesional'
  });
}
```

---

## 6️⃣ GESTIONAR EQUIPAMIENTOS

### Agregar Equipamiento a Aula

```javascript
// ============================================================================
// AGREGAR EQUIPAMIENTO A UN AULA EXISTENTE
// ============================================================================

async function agregarEquipamiento(aulaId, equipamientoId, cantidad = 1, observaciones = null) {
  try {
    const payload = {
      equipamientoId: parseInt(equipamientoId),
      cantidad: parseInt(cantidad),
      ...(observaciones && { observaciones })
    };

    const response = await fetch(`http://localhost:8000/api/aulas/${aulaId}/equipamientos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Error al agregar equipamiento');
    }

    console.log('Equipamiento agregado:', result.data.equipamiento.nombre);
    return result.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Ejemplo de uso
async function ejemploAgregarEquipamiento() {
  // Agregar 20 sillas al aula 3
  await agregarEquipamiento(3, 1, 20, 'Sillas nuevas');

  // Agregar 1 piano al aula 5
  await agregarEquipamiento(5, 5, 1, 'Piano recién afinado');
}
```

### Listar Equipamientos de un Aula

```javascript
// ============================================================================
// LISTAR EQUIPAMIENTOS DE UN AULA
// ============================================================================

async function listarEquipamientosAula(aulaId) {
  try {
    const response = await fetch(`http://localhost:8000/api/aulas/${aulaId}/equipamientos`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Error al listar equipamientos');
    }

    const equipamientos = result.data;

    console.log(`Aula ${aulaId} tiene ${equipamientos.length} equipamientos:`);
    equipamientos.forEach(ae => {
      console.log(`- ${ae.equipamiento.nombre}: ${ae.cantidad} unidades`);
      if (ae.observaciones) {
        console.log(`  Observaciones: ${ae.observaciones}`);
      }
    });

    return equipamientos;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

### Actualizar Cantidad de Equipamiento

```javascript
// ============================================================================
// ACTUALIZAR CANTIDAD DE EQUIPAMIENTO EN AULA
// ============================================================================

async function actualizarCantidadEquipamiento(aulaId, equipamientoId, cantidad, observaciones = null) {
  try {
    const payload = {
      cantidad: parseInt(cantidad),
      ...(observaciones && { observaciones })
    };

    const response = await fetch(
      `http://localhost:8000/api/aulas/${aulaId}/equipamientos/${equipamientoId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Error al actualizar cantidad');
    }

    console.log('Cantidad actualizada:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Ejemplo de uso
async function ejemploActualizarCantidad() {
  // Aumentar cantidad de sillas de 20 a 25
  await actualizarCantidadEquipamiento(3, 1, 25, 'Se agregaron 5 sillas más');
}
```

### Quitar Equipamiento de Aula

```javascript
// ============================================================================
// QUITAR EQUIPAMIENTO DE UN AULA
// ============================================================================

async function quitarEquipamiento(aulaId, equipamientoId) {
  try {
    const response = await fetch(
      `http://localhost:8000/api/aulas/${aulaId}/equipamientos/${equipamientoId}`,
      {
        method: 'DELETE'
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Error al quitar equipamiento');
    }

    console.log('Equipamiento removido exitosamente');
    return true;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Ejemplo de uso
async function ejemploQuitarEquipamiento() {
  // Confirmar antes de eliminar
  if (confirm('¿Está seguro de quitar este equipamiento del aula?')) {
    await quitarEquipamiento(3, 7); // Quitar escritorio (ID 7) del aula 3
  }
}
```

---

## 7️⃣ COMPONENTE REACT COMPLETO

```typescript
// ============================================================================
// COMPONENTE REACT COMPLETO PARA GESTIÓN DE AULAS
// ============================================================================

import React, { useState, useEffect } from 'react';

interface AulaFormProps {
  aulaId?: number; // Si existe, es edición; si no, es creación
  onSuccess?: () => void;
}

const AulaForm: React.FC<AulaFormProps> = ({ aulaId, onSuccess }) => {
  // Estados para catálogos
  const [tiposAula, setTiposAula] = useState<TipoAula[]>([]);
  const [estadosAula, setEstadosAula] = useState<EstadoAula[]>([]);
  const [equipamientos, setEquipamientos] = useState<Equipamiento[]>([]);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    capacidad: '',
    ubicacion: '',
    tipoAulaId: '',
    estadoAulaId: '',
    descripcion: '',
    observaciones: '',
    equipamientoIds: [] as number[]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar catálogos al montar
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/catalogos/tipos-aulas').then(r => r.json()),
      fetch('http://localhost:8000/api/catalogos/estados-aulas').then(r => r.json()),
      fetch('http://localhost:8000/api/equipamientos?activo=true').then(r => r.json())
    ]).then(([tipos, estados, equips]) => {
      if (tipos.success) setTiposAula(tipos.data);
      if (estados.success) setEstadosAula(estados.data);
      if (equips.success) setEquipamientos(equips.data);
    });
  }, []);

  // Si es edición, cargar datos del aula
  useEffect(() => {
    if (aulaId) {
      fetch(`http://localhost:8000/api/aulas/${aulaId}`)
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            const aula = result.data;
            setFormData({
              nombre: aula.nombre,
              capacidad: aula.capacidad.toString(),
              ubicacion: aula.ubicacion || '',
              tipoAulaId: aula.tipoAulaId?.toString() || '',
              estadoAulaId: aula.estadoAulaId?.toString() || '',
              descripcion: aula.descripcion || '',
              observaciones: aula.observaciones || '',
              equipamientoIds: aula.aulas_equipamientos?.map(ae => ae.equipamientoId) || []
            });
          }
        });
    }
  }, [aulaId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEquipamientoToggle = (equipamientoId: number) => {
    setFormData(prev => ({
      ...prev,
      equipamientoIds: prev.equipamientoIds.includes(equipamientoId)
        ? prev.equipamientoIds.filter(id => id !== equipamientoId)
        : [...prev.equipamientoIds, equipamientoId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        nombre: formData.nombre,
        capacidad: parseInt(formData.capacidad),
        ubicacion: formData.ubicacion,
        tipoAulaId: parseInt(formData.tipoAulaId),
        estadoAulaId: parseInt(formData.estadoAulaId),
        descripcion: formData.descripcion,
        observaciones: formData.observaciones,
        ...(aulaId ? {} : { equipamientoIds: formData.equipamientoIds }) // Solo en creación
      };

      const url = aulaId
        ? `http://localhost:8000/api/aulas/${aulaId}`
        : 'http://localhost:8000/api/aulas';

      const method = aulaId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al guardar aula');
      }

      alert(result.message || 'Aula guardada exitosamente');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="aula-form">
      <h2>{aulaId ? 'Editar Aula' : 'Nueva Aula'}</h2>

      {error && <div className="error">{error}</div>}

      <div className="form-group">
        <label>Nombre *</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Capacidad *</label>
        <input
          type="number"
          name="capacidad"
          value={formData.capacidad}
          onChange={handleChange}
          min="1"
          required
        />
      </div>

      <div className="form-group">
        <label>Ubicación</label>
        <input
          type="text"
          name="ubicacion"
          value={formData.ubicacion}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Tipo de Aula *</label>
        <select
          name="tipoAulaId"
          value={formData.tipoAulaId}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione...</option>
          {tiposAula.map(tipo => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Estado *</label>
        <select
          name="estadoAulaId"
          value={formData.estadoAulaId}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione...</option>
          {estadosAula.map(estado => (
            <option key={estado.id} value={estado.id}>
              {estado.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Descripción</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows={3}
        />
      </div>

      {!aulaId && (
        <div className="form-group">
          <label>Equipamientos</label>
          <div className="equipamientos-list">
            {equipamientos.map(eq => (
              <div key={eq.id} className="equipamiento-item">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.equipamientoIds.includes(eq.id)}
                    onChange={() => handleEquipamientoToggle(eq.id)}
                  />
                  {eq.nombre} ({eq.codigo})
                </label>
              </div>
            ))}
          </div>
          <small>⚠️ Nota: Los equipamientos solo se asignan al crear el aula.
          Para gestionar equipamientos de aulas existentes, use el módulo de Equipamientos.</small>
        </div>
      )}

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : (aulaId ? 'Actualizar' : 'Crear')}
        </button>
        <button type="button" onClick={() => onSuccess && onSuccess()}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default AulaForm;
```

### Componente de Lista de Aulas

```typescript
// ============================================================================
// COMPONENTE PARA LISTAR AULAS
// ============================================================================

const AulasList: React.FC = () => {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const cargarAulas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/aulas?page=${page}&limit=10&activa=true`);
      const result = await response.json();

      if (result.success) {
        setAulas(result.data);
        setTotalPages(result.meta.totalPages);
      }
    } catch (error) {
      console.error('Error al cargar aulas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAulas();
  }, [page]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="aulas-list">
      <h2>Aulas</h2>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Capacidad</th>
            <th>Ubicación</th>
            <th>Equipamientos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {aulas.map(aula => (
            <tr key={aula.id}>
              <td>{aula.nombre}</td>
              <td>{aula.tipoAula?.nombre || '-'}</td>
              <td>{aula.estadoAula?.nombre || '-'}</td>
              <td>{aula.capacidad}</td>
              <td>{aula.ubicacion || '-'}</td>
              <td>
                {/* ⚠️ IMPORTANTE: Usar aulas_equipamientos */}
                {aula._count?.aulas_equipamientos || 0} equipamientos
                {aula.aulas_equipamientos && aula.aulas_equipamientos.length > 0 && (
                  <ul>
                    {aula.aulas_equipamientos.map(ae => (
                      <li key={ae.id}>
                        {ae.equipamiento.nombre} (x{ae.cantidad})
                      </li>
                    ))}
                  </ul>
                )}
              </td>
              <td>
                <button onClick={() => window.location.href = `/aulas/${aula.id}`}>
                  Ver
                </button>
                <button onClick={() => window.location.href = `/aulas/${aula.id}/editar`}>
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default AulasList;
```

---

## ✅ CHECKLIST PARA FRONTEND

- [ ] **Cargar catálogos al inicio**: Tipos de aula, Estados, Equipamientos
- [ ] **Usar el campo correcto**: `aulas_equipamientos` (NO `equipamientos`)
- [ ] **Implementar paginación**: Usar `meta.page`, `meta.totalPages`, `meta.total`
- [ ] **Mostrar relaciones completas**: `tipoAula`, `estadoAula`, `aulas_equipamientos`
- [ ] **Manejo de errores**: Verificar `success: false` y mostrar `error`
- [ ] **Validaciones**: Capacidad > 0, Nombre requerido, Tipo y Estado requeridos
- [ ] **Formateo de datos**: Convertir strings a números donde corresponda
- [ ] **Testing**: Probar crear, listar, actualizar, eliminar

---

**Última actualización**: 2025-11-27
**Versión**: 1.0
