# Guía Rápida para Frontend - API de Actividades

Esta guía está diseñada para que el equipo de frontend pueda empezar a trabajar con la API de Actividades V2.0 de inmediato.

## 🚀 Inicio Rápido (5 minutos)

### 1. Base URL

```javascript
const API_BASE_URL = 'http://localhost:8000/api/actividades';
```

### 2. Helper Function Básico

```javascript
// utils/api.js
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${getToken()}`, // Para producción
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

### 3. Obtener Catálogos (Primera Llamada)

Los catálogos se necesitan para crear/editar actividades. Llamar una vez al inicio:

```javascript
// hooks/useCatalogos.js
import { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';

export const useCatalogos = () => {
  const [catalogos, setCatalogos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const data = await apiCall('/catalogos/todos');
        setCatalogos(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogos();
  }, []);

  return { catalogos, loading, error };
};

// Uso en componente:
// const { catalogos, loading } = useCatalogos();
// console.log(catalogos.tipos); // Array de tipos
// console.log(catalogos.categorias); // Array de categorías
```

## 📋 Casos de Uso Comunes

### Caso 1: Listar Actividades Disponibles

```javascript
// components/ActividadesLista.jsx
import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';

const ActividadesLista = () => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchActividades = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        estadoId: '1', // Solo activas
        conCupo: 'true', // Con cupo disponible
        incluirRelaciones: 'true',
        orderBy: 'nombre',
        orderDir: 'asc'
      });

      const data = await apiCall(`/?${params}`);

      setActividades(data.data.data);
      setPagination({
        page: data.data.page,
        limit: data.data.limit,
        total: data.data.total,
        pages: data.data.pages
      });
    } catch (error) {
      console.error('Error al cargar actividades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActividades();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Actividades Disponibles ({pagination.total})</h2>

      <div className="actividades-grid">
        {actividades.map(actividad => (
          <div key={actividad.id} className="actividad-card">
            <h3>{actividad.nombre}</h3>
            <p><strong>Tipo:</strong> {actividad.tipos_actividades.nombre}</p>
            <p><strong>Categoría:</strong> {actividad.categorias_actividades.nombre}</p>
            <p><strong>Cupo:</strong> {actividad.cupo_maximo} personas</p>
            <p><strong>Costo:</strong> ${actividad.costo}</p>

            {/* Mostrar horarios */}
            <div className="horarios">
              <h4>Horarios:</h4>
              {actividad.horarios_actividades?.map(h => (
                <div key={h.id}>
                  {h.dias_semana.nombre}: {h.hora_inicio.slice(0,5)} - {h.hora_fin.slice(0,5)}
                </div>
              ))}
            </div>

            <button onClick={() => verDetalle(actividad.id)}>
              Ver Detalles
            </button>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="pagination">
        <button
          onClick={() => fetchActividades(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          Anterior
        </button>
        <span>Página {pagination.page} de {pagination.pages}</span>
        <button
          onClick={() => fetchActividades(pagination.page + 1)}
          disabled={pagination.page === pagination.pages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default ActividadesLista;
```

### Caso 2: Crear Nueva Actividad (Formulario)

```javascript
// components/CrearActividad.jsx
import React, { useState } from 'react';
import { apiCall } from '../utils/api';
import { useCatalogos } from '../hooks/useCatalogos';

const CrearActividad = ({ onSuccess }) => {
  const { catalogos, loading: catalogosLoading } = useCatalogos();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    codigoActividad: '',
    nombre: '',
    tipoActividadId: '',
    categoriaId: '',
    estadoId: 1, // Activa por defecto
    descripcion: '',
    fechaDesde: '',
    fechaHasta: '',
    cupoMaximo: '',
    costo: 0,
    horarios: []
  });

  const [nuevoHorario, setNuevoHorario] = useState({
    diaSemanaId: '',
    horaInicio: '',
    horaFin: '',
    activo: true
  });

  const agregarHorario = () => {
    if (!nuevoHorario.diaSemanaId || !nuevoHorario.horaInicio || !nuevoHorario.horaFin) {
      alert('Complete todos los campos del horario');
      return;
    }

    setFormData({
      ...formData,
      horarios: [...formData.horarios, { ...nuevoHorario }]
    });

    // Resetear formulario de horario
    setNuevoHorario({
      diaSemanaId: '',
      horaInicio: '',
      horaFin: '',
      activo: true
    });
  };

  const eliminarHorario = (index) => {
    setFormData({
      ...formData,
      horarios: formData.horarios.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Preparar datos
      const payload = {
        ...formData,
        tipoActividadId: parseInt(formData.tipoActividadId),
        categoriaId: parseInt(formData.categoriaId),
        estadoId: parseInt(formData.estadoId),
        cupoMaximo: formData.cupoMaximo ? parseInt(formData.cupoMaximo) : null,
        costo: parseFloat(formData.costo),
        fechaDesde: new Date(formData.fechaDesde).toISOString(),
        fechaHasta: formData.fechaHasta ? new Date(formData.fechaHasta).toISOString() : null,
        horarios: formData.horarios.map(h => ({
          ...h,
          diaSemanaId: parseInt(h.diaSemanaId)
        }))
      };

      const data = await apiCall('/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      console.log('Actividad creada:', data.data);

      if (onSuccess) {
        onSuccess(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (catalogosLoading) return <div>Cargando catálogos...</div>;

  return (
    <form onSubmit={handleSubmit} className="crear-actividad-form">
      <h2>Crear Nueva Actividad</h2>

      {error && <div className="error-message">{error}</div>}

      {/* Datos básicos */}
      <div className="form-group">
        <label>Código de Actividad *</label>
        <input
          type="text"
          placeholder="Ej: CORO-ADU-2025-A"
          value={formData.codigoActividad}
          onChange={(e) => setFormData({...formData, codigoActividad: e.target.value.toUpperCase()})}
          required
        />
        <small>Solo mayúsculas, números y guiones</small>
      </div>

      <div className="form-group">
        <label>Nombre *</label>
        <input
          type="text"
          placeholder="Nombre de la actividad"
          value={formData.nombre}
          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Tipo *</label>
          <select
            value={formData.tipoActividadId}
            onChange={(e) => setFormData({...formData, tipoActividadId: e.target.value})}
            required
          >
            <option value="">Seleccione...</option>
            {catalogos?.tipos.map(tipo => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Categoría *</label>
          <select
            value={formData.categoriaId}
            onChange={(e) => setFormData({...formData, categoriaId: e.target.value})}
            required
          >
            <option value="">Seleccione...</option>
            {catalogos?.categorias.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Descripción</label>
        <textarea
          value={formData.descripcion}
          onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
          rows={4}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Fecha Desde *</label>
          <input
            type="date"
            value={formData.fechaDesde}
            onChange={(e) => setFormData({...formData, fechaDesde: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Fecha Hasta</label>
          <input
            type="date"
            value={formData.fechaHasta}
            onChange={(e) => setFormData({...formData, fechaHasta: e.target.value})}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Cupo Máximo</label>
          <input
            type="number"
            min="1"
            value={formData.cupoMaximo}
            onChange={(e) => setFormData({...formData, cupoMaximo: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Costo ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.costo}
            onChange={(e) => setFormData({...formData, costo: e.target.value})}
          />
        </div>
      </div>

      {/* Sección de Horarios */}
      <div className="horarios-section">
        <h3>Horarios</h3>

        {/* Lista de horarios agregados */}
        {formData.horarios.length > 0 && (
          <div className="horarios-list">
            {formData.horarios.map((h, index) => {
              const dia = catalogos?.diasSemana.find(d => d.id === parseInt(h.diaSemanaId));
              return (
                <div key={index} className="horario-item">
                  <span>{dia?.nombre}: {h.horaInicio} - {h.horaFin}</span>
                  <button type="button" onClick={() => eliminarHorario(index)}>
                    Eliminar
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Formulario para agregar horario */}
        <div className="agregar-horario">
          <div className="form-row">
            <select
              value={nuevoHorario.diaSemanaId}
              onChange={(e) => setNuevoHorario({...nuevoHorario, diaSemanaId: e.target.value})}
            >
              <option value="">Día...</option>
              {catalogos?.diasSemana.map(dia => (
                <option key={dia.id} value={dia.id}>
                  {dia.nombre}
                </option>
              ))}
            </select>

            <input
              type="time"
              value={nuevoHorario.horaInicio}
              onChange={(e) => setNuevoHorario({...nuevoHorario, horaInicio: e.target.value})}
            />

            <input
              type="time"
              value={nuevoHorario.horaFin}
              onChange={(e) => setNuevoHorario({...nuevoHorario, horaFin: e.target.value})}
            />

            <button type="button" onClick={agregarHorario}>
              + Agregar
            </button>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Crear Actividad'}
        </button>
      </div>
    </form>
  );
};

export default CrearActividad;
```

### Caso 3: Ver Detalle de Actividad

```javascript
// components/ActividadDetalle.jsx
import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';

const ActividadDetalle = ({ actividadId }) => {
  const [actividad, setActividad] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActividad = async () => {
      try {
        const data = await apiCall(`/${actividadId}`);
        setActividad(data.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActividad();
  }, [actividadId]);

  if (loading) return <div>Cargando...</div>;
  if (!actividad) return <div>Actividad no encontrada</div>;

  return (
    <div className="actividad-detalle">
      <h1>{actividad.nombre}</h1>
      <p className="codigo">Código: {actividad.codigo_actividad}</p>

      <div className="info-grid">
        <div className="info-item">
          <strong>Tipo:</strong>
          <span>{actividad.tipos_actividades.nombre}</span>
        </div>
        <div className="info-item">
          <strong>Categoría:</strong>
          <span>{actividad.categorias_actividades.nombre}</span>
        </div>
        <div className="info-item">
          <strong>Estado:</strong>
          <span className={`estado ${actividad.estados_actividades.codigo}`}>
            {actividad.estados_actividades.nombre}
          </span>
        </div>
        <div className="info-item">
          <strong>Cupo:</strong>
          <span>{actividad.cupo_maximo} personas</span>
        </div>
        <div className="info-item">
          <strong>Costo:</strong>
          <span>${actividad.costo}</span>
        </div>
      </div>

      <div className="descripcion">
        <h3>Descripción</h3>
        <p>{actividad.descripcion || 'Sin descripción'}</p>
      </div>

      <div className="horarios">
        <h3>Horarios</h3>
        {actividad.horarios_actividades?.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Día</th>
                <th>Horario</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {actividad.horarios_actividades.map(h => (
                <tr key={h.id}>
                  <td>{h.dias_semana.nombre}</td>
                  <td>{h.hora_inicio.slice(0,5)} - {h.hora_fin.slice(0,5)}</td>
                  <td>{h.activo ? '✓ Activo' : '✗ Inactivo'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Sin horarios definidos</p>
        )}
      </div>

      <div className="docentes">
        <h3>Docentes</h3>
        {actividad.docentes_actividades?.length > 0 ? (
          <ul>
            {actividad.docentes_actividades.map(d => (
              <li key={d.id}>
                {d.personas.nombre} {d.personas.apellido} - {d.roles_docentes.nombre}
              </li>
            ))}
          </ul>
        ) : (
          <p>Sin docentes asignados</p>
        )}
      </div>
    </div>
  );
};

export default ActividadDetalle;
```

### Caso 4: Actualizar Actividad

```javascript
// services/actividadesService.js
export const actualizarActividad = async (id, cambios) => {
  try {
    const data = await apiCall(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(cambios)
    });
    return data.data;
  } catch (error) {
    throw error;
  }
};

// Uso en componente:
const handleActualizar = async () => {
  try {
    const actividadActualizada = await actualizarActividad(1, {
      cupoMaximo: 35,
      costo: 2000,
      descripcion: 'Nueva descripción'
    });
    console.log('Actualizado:', actividadActualizada);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Caso 5: Filtros Dinámicos

```javascript
// components/FiltrosActividades.jsx
const FiltrosActividades = ({ onFilter }) => {
  const { catalogos } = useCatalogos();
  const [filtros, setFiltros] = useState({
    tipoActividadId: '',
    categoriaId: '',
    estadoId: '',
    conCupo: false,
    vigentes: false,
    search: ''
  });

  const aplicarFiltros = () => {
    const params = new URLSearchParams();

    if (filtros.tipoActividadId) params.append('tipoActividadId', filtros.tipoActividadId);
    if (filtros.categoriaId) params.append('categoriaId', filtros.categoriaId);
    if (filtros.estadoId) params.append('estadoId', filtros.estadoId);
    if (filtros.conCupo) params.append('conCupo', 'true');
    if (filtros.vigentes) params.append('vigentes', 'true');
    if (filtros.search) params.append('search', filtros.search);

    params.append('incluirRelaciones', 'true');
    params.append('page', '1');
    params.append('limit', '20');

    onFilter(params.toString());
  };

  return (
    <div className="filtros">
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={filtros.search}
        onChange={(e) => setFiltros({...filtros, search: e.target.value})}
      />

      <select
        value={filtros.tipoActividadId}
        onChange={(e) => setFiltros({...filtros, tipoActividadId: e.target.value})}
      >
        <option value="">Todos los tipos</option>
        {catalogos?.tipos.map(t => (
          <option key={t.id} value={t.id}>{t.nombre}</option>
        ))}
      </select>

      <select
        value={filtros.estadoId}
        onChange={(e) => setFiltros({...filtros, estadoId: e.target.value})}
      >
        <option value="">Todos los estados</option>
        {catalogos?.estados.map(e => (
          <option key={e.id} value={e.id}>{e.nombre}</option>
        ))}
      </select>

      <label>
        <input
          type="checkbox"
          checked={filtros.conCupo}
          onChange={(e) => setFiltros({...filtros, conCupo: e.target.checked})}
        />
        Solo con cupo disponible
      </label>

      <label>
        <input
          type="checkbox"
          checked={filtros.vigentes}
          onChange={(e) => setFiltros({...filtros, vigentes: e.target.checked})}
        />
        Solo vigentes
      </label>

      <button onClick={aplicarFiltros}>Aplicar Filtros</button>
    </div>
  );
};
```

## 🎨 Componentes Útiles

### Selector de Horarios

```javascript
// components/HorarioSelector.jsx
const HorarioSelector = ({ value, onChange, catalogos }) => {
  const diasSemana = catalogos?.diasSemana || [];

  return (
    <div className="horario-selector">
      <select
        value={value.diaSemanaId || ''}
        onChange={(e) => onChange({...value, diaSemanaId: e.target.value})}
      >
        <option value="">Seleccione día...</option>
        {diasSemana.map(dia => (
          <option key={dia.id} value={dia.id}>
            {dia.nombre}
          </option>
        ))}
      </select>

      <input
        type="time"
        value={value.horaInicio || ''}
        onChange={(e) => onChange({...value, horaInicio: e.target.value})}
        placeholder="Hora inicio"
      />

      <input
        type="time"
        value={value.horaFin || ''}
        onChange={(e) => onChange({...value, horaFin: e.target.value})}
        placeholder="Hora fin"
      />
    </div>
  );
};
```

### Badge de Estado

```javascript
// components/EstadoBadge.jsx
const EstadoBadge = ({ estado }) => {
  const colors = {
    'ACTIVA': 'green',
    'INACTIVA': 'gray',
    'FINALIZADA': 'blue',
    'CANCELADA': 'red'
  };

  return (
    <span
      className="badge"
      style={{ backgroundColor: colors[estado.codigo] }}
    >
      {estado.nombre}
    </span>
  );
};
```

## ⚠️ Errores Comunes y Soluciones

### Error 400: Código duplicado

```javascript
try {
  await crearActividad(data);
} catch (error) {
  if (error.message.includes('código')) {
    alert('El código de actividad ya existe. Use uno diferente.');
  }
}
```

### Error 404: Actividad no encontrada

```javascript
try {
  const actividad = await obtenerActividad(id);
} catch (error) {
  if (error.message.includes('no encontrada')) {
    // Redirigir a lista o mostrar mensaje
    navigate('/actividades');
  }
}
```

### Horarios en conflicto

```javascript
// El backend valida automáticamente conflictos
// Si hay error, mostrarlo al usuario
catch (error) {
  if (error.message.includes('conflicto') || error.message.includes('superpone')) {
    alert('Los horarios se superponen. Por favor verifique.');
  }
}
```

## 📱 Tips de UX

1. **Cachear catálogos**: Los catálogos no cambian frecuentemente, usar localStorage o Context

2. **Loading states**: Siempre mostrar indicador de carga durante las peticiones

3. **Validación client-side**: Validar antes de enviar para mejor UX
   - Código en mayúsculas y formato correcto
   - Fechas coherentes (hasta >= desde)
   - Horarios sin superposición

4. **Confirmación antes de eliminar**: Siempre pedir confirmación

5. **Feedback visual**: Mostrar mensajes de éxito/error claros

## 🔍 Debugging

### Ver todas las peticiones

```javascript
// Agregar a api.js
const apiCall = async (endpoint, options = {}) => {
  console.log('API Request:', endpoint, options);

  const response = await fetch(url, config);
  const data = await response.json();

  console.log('API Response:', data);

  return data;
};
```

### Inspeccionar datos de actividad

```javascript
// En DevTools console:
fetch('http://localhost:8000/api/actividades/1')
  .then(r => r.json())
  .then(d => console.table(d.data));
```

## 📚 Recursos Adicionales

- **Documentación completa**: [API_ACTIVIDADES_V2.md](./API_ACTIVIDADES_V2.md)
- **Tipos TypeScript**: Ver sección de tipos en la documentación completa
- **Postman Collection**: [Solicitar al equipo backend]

## 🆘 Ayuda

Si tienes dudas:
1. Revisa la [documentación completa](./API_ACTIVIDADES_V2.md)
2. Verifica los ejemplos de este documento
3. Contacta al equipo backend

---

**Última actualización**: 2025-10-15
