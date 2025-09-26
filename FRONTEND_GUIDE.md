# 🎵 SIGESDA Frontend Development Guide

> **Guía completa para desarrollar el frontend del Sistema de Gestión de Asociación Musical**
>
> **Stack tecnológico:** React + Vite + MUI + Axios + Redux + TypeScript
>
> **Arquitectura:** Dashboard administrativo con sidebar navegable

---

## 📋 **Tabla de Contenidos**

1. [Configuración inicial del proyecto](#1-configuración-inicial-del-proyecto)
2. [Estructura de carpetas recomendada](#2-estructura-de-carpetas-recomendada)
3. [Configuración de dependencias](#3-configuración-de-dependencias)
4. [Documentación completa de APIs](#4-documentación-completa-de-apis)
5. [Estructura de componentes](#5-estructura-de-componentes)
6. [Configuración de Redux](#6-configuración-de-redux)
7. [Configuración de routing](#7-configuración-de-routing)
8. [Diseño y tema MUI](#8-diseño-y-tema-mui)
9. [Implementación paso a paso](#9-implementación-paso-a-paso)

---

## 1. **Configuración inicial del proyecto**

### Comando inicial:
```bash
npm create vite@latest sigesda-frontend -- --template react-ts
cd sigesda-frontend
npm install
```

### Dependencias principales:
```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @mui/lab @mui/x-data-grid
npm install @reduxjs/toolkit react-redux
npm install axios
npm install react-router-dom
npm install @types/react @types/react-dom
npm install date-fns
```

### Dependencias de desarrollo:
```bash
npm install -D @types/node
```

---

## 2. **Estructura de carpetas recomendada**

```
src/
├── components/           # Componentes reutilizables
│   ├── common/          # Componentes comunes (Header, Sidebar, etc.)
│   ├── ui/              # Componentes UI base
│   └── forms/           # Formularios específicos
├── pages/               # Páginas principales
│   ├── Dashboard/
│   ├── Personas/
│   ├── Actividades/
│   ├── Aulas/
│   ├── Cuotas/
│   ├── MediosPago/
│   ├── Recibos/
│   ├── Configuracion/
│   ├── Participacion/
│   ├── Familiares/
│   └── Reservas/
├── services/            # Servicios API con Axios
├── store/               # Configuración Redux
│   ├── slices/         # Redux slices por módulo
│   └── index.ts
├── types/               # Definiciones TypeScript
├── utils/               # Utilidades y helpers
├── hooks/               # Custom hooks
├── theme/               # Configuración MUI theme
└── App.tsx
```

---

## 3. **Configuración de dependencias**

### `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

### `tsconfig.json` (agregar paths):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## 4. **Documentación completa de APIs**

### 📡 **Base URL:** `http://localhost:3001/api`

### 🏠 **Health Check**
```typescript
GET /health
Response: {
  success: boolean;
  data: {
    status: string;
    timestamp: string;
    version: string;
    environment: string;
    database: string;
  };
}
```

---

## 👥 **4.1 CRUD PERSONAS**

### Tipos TypeScript:
```typescript
interface Persona {
  id: string;
  tipo: 'SOCIO' | 'NO_SOCIO' | 'DOCENTE' | 'PROVEEDOR';
  nombre: string;
  apellido: string;
  dni: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  // Campos específicos por tipo
  numeroSocio?: number;
  categoria?: 'ACTIVO' | 'ESTUDIANTE' | 'FAMILIAR' | 'JUBILADO';
  fechaIngreso?: string;
  fechaBaja?: string;
  motivoBaja?: string;
  especialidad?: string;
  honorariosPorHora?: number;
  cuit?: string;
  razonSocial?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreatePersonaDto {
  tipo: 'SOCIO' | 'NO_SOCIO' | 'DOCENTE' | 'PROVEEDOR';
  nombre: string;
  apellido: string;
  dni: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  // Campos condicionales según tipo
  numeroSocio?: number;
  categoria?: 'ACTIVO' | 'ESTUDIANTE' | 'FAMILIAR' | 'JUBILADO';
  fechaIngreso?: string;
  especialidad?: string;
  honorariosPorHora?: number;
  cuit?: string;
  razonSocial?: string;
}
```

### Endpoints:
```typescript
// Listar personas
GET /personas?page=1&limit=10&tipo=SOCIO&categoria=ACTIVO
Response: {
  success: boolean;
  data: Persona[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Crear persona
POST /personas
Body: CreatePersonaDto
Response: {
  success: boolean;
  message: string;
  data: Persona;
}

// Obtener persona por ID
GET /personas/:id
Response: {
  success: boolean;
  data: Persona;
}

// Actualizar persona
PUT /personas/:id
Body: Partial<CreatePersonaDto>
Response: {
  success: boolean;
  message: string;
  data: Persona;
}

// Eliminar persona
DELETE /personas/:id
Response: {
  success: boolean;
  message: string;
}

// Búsqueda avanzada
GET /personas/search?search=Juan&searchBy=nombre&tipo=SOCIO
Response: {
  success: boolean;
  data: Persona[];
  count: number;
}

// Endpoints especializados
GET /personas/socios/activos
GET /personas/docentes/disponibles
GET /personas/dashboard/estadisticas
```

---

## 🎭 **4.2 CRUD ACTIVIDADES**

### Tipos TypeScript:
```typescript
interface Actividad {
  id: string;
  nombre: string;
  tipo: 'CORO' | 'CLASE_CANTO' | 'CLASE_INSTRUMENTO';
  descripcion?: string;
  precio: number;
  duracion?: number; // minutos
  capacidadMaxima?: number;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
  docentes: DocenteBasico[];
  _count: {
    participaciones: number;
  };
}

interface CreateActividadDto {
  nombre: string;
  tipo: 'CORO' | 'CLASE_CANTO' | 'CLASE_INSTRUMENTO';
  descripcion?: string;
  precio: number;
  duracion?: number;
  capacidadMaxima?: number;
  activa?: boolean;
}
```

### Endpoints:
```typescript
// Listar actividades
GET /actividades?page=1&limit=10&tipo=CORO&activa=true
Response: {
  success: boolean;
  data: Actividad[];
  meta: PaginationMeta;
}

// Crear actividad
POST /actividades
Body: CreateActividadDto

// Actualizar actividad
PUT /actividades/:id
Body: Partial<CreateActividadDto>

// Asignar docente
POST /actividades/:id/docentes
Body: { docenteId: string }

// Endpoints especializados
GET /actividades/coros
GET /actividades/clases-instrumento
GET /actividades/clases-canto
GET /actividades/:id/participantes
GET /actividades/:id/estadisticas
```

---

## 🏛️ **4.3 CRUD AULAS**

### Tipos TypeScript:
```typescript
interface Aula {
  id: string;
  nombre: string;
  capacidad: number;
  ubicacion?: string;
  equipamiento?: string;
  activa: boolean;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateAulaDto {
  nombre: string;
  capacidad: number;
  ubicacion?: string;
  equipamiento?: string;
  activa?: boolean;
  observaciones?: string;
}
```

### Endpoints:
```typescript
// CRUD básico
GET /aulas?page=1&limit=10&activa=true
POST /aulas
PUT /aulas/:id
DELETE /aulas/:id

// Verificar disponibilidad
POST /aulas/:id/verificar-disponibilidad
Body: {
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
}

// Endpoints especializados
GET /aulas/disponibles
GET /aulas/con-equipamiento
GET /aulas/:id/estadisticas
GET /aulas/:id/reservas
```

---

## ⚙️ **4.4 CRUD CONFIGURACIÓN**

### Tipos TypeScript:
```typescript
interface Configuracion {
  id: string;
  clave: string;
  valor: string;
  tipoValor: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  descripcion?: string;
  categoria?: string;
  esEditable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateConfiguracionDto {
  clave: string;
  valor: string;
  tipoValor: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  descripcion?: string;
  categoria?: string;
  esEditable?: boolean;
}
```

### Endpoints:
```typescript
// CRUD básico
GET /configuracion?page=1&limit=10&categoria=SISTEMA
POST /configuracion
PUT /configuracion/clave/:clave
DELETE /configuracion/clave/:clave

// Operaciones especializadas
GET /configuracion/clave/:clave
GET /configuracion/tipo/:tipo
POST /configuracion/bulk-upsert
GET /configuracion/export
```

---

## 👥 **4.5 CRUD PARTICIPACIÓN ACTIVIDAD**

### Tipos TypeScript:
```typescript
interface ParticipacionActividad {
  id: string;
  personaId: string;
  actividadId: string;
  fechaInicio: string;
  fechaFin?: string;
  precioEspecial?: number;
  activa: boolean;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  persona: PersonaBasica;
  actividad: ActividadBasica;
}

interface CreateParticipacionDto {
  personaId: string;
  actividadId: string;
  fechaInicio: string;
  fechaFin?: string;
  precioEspecial?: number;
  observaciones?: string;
}
```

### Endpoints:
```typescript
// CRUD básico
GET /participacion?page=1&limit=10&activa=true
POST /participacion
PUT /participacion/:id
DELETE /participacion/:id

// Inscripción masiva
POST /participacion/inscripcion-masiva
Body: {
  actividadId: string;
  personaIds: string[];
  fechaInicio: string;
  precioEspecial?: number;
}

// Endpoints especializados
GET /participacion/persona/:personaId
GET /participacion/actividad/:actividadId
GET /participacion/dashboard/estadisticas
POST /participacion/transferir
```

---

## 👨‍👩‍👧‍👦 **4.6 CRUD FAMILIARES**

### Tipos TypeScript:
```typescript
interface Familiar {
  id: string;
  socioId: string;
  familiarId: string;
  parentesco: 'HIJO' | 'HIJA' | 'CONYUGE' | 'PADRE' | 'MADRE' | 'HERMANO' | 'HERMANA' | 'OTRO';
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  socio: PersonaBasica;
  familiar: PersonaBasica;
}

interface CreateFamiliarDto {
  socioId: string;
  familiarId: string;
  parentesco: TipoParentesco;
  observaciones?: string;
}
```

### Endpoints:
```typescript
// CRUD básico
GET /familiares?page=1&limit=10&parentesco=HIJO
POST /familiares
PUT /familiares/:id
DELETE /familiares/:id

// Gestión familiar
GET /familiares/socio/:socioId
GET /familiares/arbol/:socioId
GET /familiares/estadisticas/:socioId
```

---

## 📅 **4.7 CRUD RESERVAS AULA**

### Tipos TypeScript:
```typescript
interface ReservaAula {
  id: string;
  aulaId: string;
  docenteId?: string;
  actividadId?: string;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  esRecurrente: boolean;
  frecuencia?: string;
  observaciones?: string;
  estado: 'ACTIVA' | 'CANCELADA' | 'COMPLETADA';
  createdAt: string;
  updatedAt: string;
  aula: AulaBasica;
  docente?: PersonaBasica;
  actividad?: ActividadBasica;
}

interface CreateReservaDto {
  aulaId: string;
  docenteId?: string;
  actividadId?: string;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  esRecurrente?: boolean;
  frecuencia?: string;
  observaciones?: string;
}
```

### Endpoints:
```typescript
// CRUD básico
GET /reservas?page=1&limit=10&estado=ACTIVA
POST /reservas
PUT /reservas/:id
DELETE /reservas/:id

// Gestión de conflictos
POST /reservas/verificar-disponibilidad
Body: {
  aulaId: string;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  excludeId?: string;
}

// Endpoints especializados
GET /reservas/aula/:aulaId
GET /reservas/docente/:docenteId
GET /reservas/dashboard/estadisticas
GET /reservas/conflictos/detectar
```

---

## 🧾 **4.8 CRUD RECIBOS**

### Tipos TypeScript:
```typescript
interface Recibo {
  id: string;
  numero: string;
  tipo: 'CUOTA' | 'SUELDO' | 'DEUDA' | 'PAGO_ACTIVIDAD';
  importe: number;
  fecha: string;
  fechaVencimiento?: string;
  estado: 'PENDIENTE' | 'PAGADO' | 'VENCIDO' | 'CANCELADO';
  concepto: string;
  observaciones?: string;
  emisorId?: string;
  receptorId?: string;
  createdAt: string;
  updatedAt: string;
  emisor?: PersonaBasica;
  receptor?: PersonaBasica;
  mediosPago: MedioPago[];
  cuota?: Cuota;
}

interface CreateReciboDto {
  tipo: 'CUOTA' | 'SUELDO' | 'DEUDA' | 'PAGO_ACTIVIDAD';
  importe: number;
  fechaVencimiento?: string;
  concepto: string;
  observaciones?: string;
  emisorId?: string;
  receptorId?: string;
}
```

### Endpoints:
```typescript
// CRUD básico
GET /recibos?page=1&limit=10&tipo=CUOTA&estado=PENDIENTE
POST /recibos
PUT /recibos/:id
DELETE /recibos/:id

// Gestión de estados
PUT /recibos/:id/estado
Body: { estado: 'PAGADO' | 'VENCIDO' | 'CANCELADO' }

// Endpoints especializados
GET /recibos/numero/:numero
GET /recibos/persona/:personaId
GET /recibos/dashboard/estadisticas
GET /recibos/vencidos
GET /recibos/tipo/:tipo
POST /recibos/generar-numeracion
```

---

## 💰 **4.9 CRUD CUOTAS**

### Tipos TypeScript:
```typescript
interface Cuota {
  id: string;
  reciboId: string;
  categoria: 'ACTIVO' | 'ESTUDIANTE' | 'FAMILIAR' | 'JUBILADO';
  mes: number;
  anio: number;
  montoBase: number;
  montoActividades: number;
  montoTotal: number;
  createdAt: string;
  updatedAt: string;
  recibo: {
    numero: string;
    estado: string;
    fecha: string;
    fechaVencimiento?: string;
    receptor?: PersonaBasica;
  };
}

interface CreateCuotaDto {
  reciboId: string;
  categoria: 'ACTIVO' | 'ESTUDIANTE' | 'FAMILIAR' | 'JUBILADO';
  mes: number;
  anio: number;
  montoBase: number;
  montoActividades: number;
  montoTotal: number;
}

interface GenerarCuotasDto {
  mes: number;
  anio: number;
  categorias?: string[];
  incluirInactivos?: boolean;
  aplicarDescuentos?: boolean;
  observaciones?: string;
}

interface CalcularCuotaDto {
  categoria: string;
  mes: number;
  anio: number;
  socioId?: string;
  incluirActividades?: boolean;
  aplicarDescuentos?: boolean;
}
```

### Endpoints:
```typescript
// CRUD básico
GET /cuotas?page=1&limit=10&categoria=ACTIVO&mes=10&anio=2025
POST /cuotas
PUT /cuotas/:id
DELETE /cuotas/:id

// Generación masiva
POST /cuotas/generar/masiva
Body: GenerarCuotasDto
Response: {
  success: boolean;
  message: string;
  data: {
    generated: number;
    errors: string[];
    cuotas: Cuota[];
  };
}

// Cálculo de montos
POST /cuotas/calcular/monto
Body: CalcularCuotaDto
Response: {
  success: boolean;
  data: {
    montoBase: number;
    montoActividades: number;
    montoTotal: number;
    descuentos: number;
    detalleCalculo: any;
  };
}

// Endpoints especializados
GET /cuotas/dashboard/principal
GET /cuotas/pendientes/listado
GET /cuotas/vencidas/listado
GET /cuotas/periodo/:mes/:anio
GET /cuotas/socio/:socioId
GET /cuotas/stats/resumen
POST /cuotas/recalcular/periodo
GET /cuotas/reporte/:mes/:anio
```

---

## 💳 **4.10 CRUD MEDIOS DE PAGO**

### Tipos TypeScript:
```typescript
interface MedioPago {
  id: string;
  reciboId: string;
  tipo: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'CHEQUE';
  importe: number;
  numero?: string;
  fecha: string;
  banco?: string;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  recibo: {
    numero: string;
    estado: string;
    importe: number;
    concepto: string;
    fecha: string;
    receptor?: PersonaBasica;
  };
}

interface CreateMedioPagoDto {
  reciboId: string;
  tipo: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'CHEQUE';
  importe: number;
  numero?: string;
  fecha?: string;
  banco?: string;
  observaciones?: string;
}
```

### Endpoints:
```typescript
// CRUD básico
GET /medios-pago?page=1&limit=10&tipo=EFECTIVO&fechaDesde=2024-01-01
POST /medios-pago
PUT /medios-pago/:id
DELETE /medios-pago/:id

// Validación de pagos
GET /medios-pago/validar/recibo/:reciboId?tolerancia=0.01
Response: {
  success: boolean;
  data: {
    importeRecibo: number;
    importeTotalPagos: number;
    diferencia: number;
    esPagoCompleto: boolean;
    estado: 'COMPLETO' | 'PARCIAL' | 'EXCEDIDO';
    mediosPago: MedioPagoBasico[];
    alertas: string[];
  };
}

// Endpoints especializados
GET /medios-pago/dashboard/principal
GET /medios-pago/stats/rapidas
GET /medios-pago/recibo/:reciboId
GET /medios-pago/tipo/:tipo
GET /medios-pago/efectivo/listado
GET /medios-pago/cheques/listado
GET /medios-pago/transferencias/listado
GET /medios-pago/tarjetas/listado

// Conciliación bancaria
GET /medios-pago/conciliacion/bancaria?banco=Santander&fechaDesde=2024-01-01&fechaHasta=2024-12-31
Response: {
  success: boolean;
  data: {
    banco: string;
    periodo: { desde: string; hasta: string; };
    resumen: {
      totalOperaciones: number;
      importeTotal: number;
      tiposOperaciones: any[];
    };
    operaciones: any[];
    estadisticas: any;
  };
}
```

---

## 5. **Estructura de componentes**

### 🎨 **Layout Principal**

```typescript
// src/components/layout/DashboardLayout.tsx
import React from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar open={sidebarOpen} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
```

### 📋 **Sidebar Navigation**

```typescript
// src/components/layout/Sidebar.tsx
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography
} from '@mui/material';
import {
  Dashboard,
  People,
  MusicNote,
  Room,
  Settings,
  Group,
  Family,
  CalendarToday,
  Receipt,
  Payment,
  AccountBalance
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 280;

const menuItems = [
  {
    title: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
    color: '#1976d2'
  },
  {
    title: 'Personas',
    icon: <People />,
    path: '/personas',
    color: '#2e7d32'
  },
  {
    title: 'Actividades',
    icon: <MusicNote />,
    path: '/actividades',
    color: '#ed6c02'
  },
  {
    title: 'Aulas',
    icon: <Room />,
    path: '/aulas',
    color: '#9c27b0'
  },
  {
    title: 'Participación',
    icon: <Group />,
    path: '/participacion',
    color: '#d32f2f'
  },
  {
    title: 'Familiares',
    icon: <Family />,
    path: '/familiares',
    color: '#f57c00'
  },
  {
    title: 'Reservas',
    icon: <CalendarToday />,
    path: '/reservas',
    color: '#303f9f'
  },
  {
    title: 'Recibos',
    icon: <Receipt />,
    path: '/recibos',
    color: '#388e3c'
  },
  {
    title: 'Cuotas',
    icon: <AccountBalance />,
    path: '/cuotas',
    color: '#1976d2'
  },
  {
    title: 'Medios de Pago',
    icon: <Payment />,
    path: '/medios-pago',
    color: '#7b1fa2'
  },
  {
    title: 'Configuración',
    icon: <Settings />,
    path: '/configuracion',
    color: '#616161'
  },
];

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#f8f9fa',
          borderRight: '1px solid #e0e0e0',
        },
      }}
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h5" component="h1" fontWeight="bold" color="primary">
          🎵 SIGESDA
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sistema de Gestión Musical
        </Typography>
      </Box>

      <Divider />

      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5, px: 1 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: `${item.color}15`,
                  '& .MuiListItemIcon-root': {
                    color: item.color,
                  },
                  '& .MuiListItemText-primary': {
                    color: item.color,
                    fontWeight: 600,
                  },
                },
                '&:hover': {
                  backgroundColor: `${item.color}08`,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
```

### 📊 **Data Grid Reutilizable**

```typescript
// src/components/ui/DataGrid.tsx
import React from 'react';
import {
  DataGrid as MuiDataGrid,
  GridColDef,
  GridRowsProp,
  GridPaginationModel,
  GridToolbar,
} from '@mui/x-data-grid';
import { Box, Paper } from '@mui/material';

interface DataGridProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
  onPaginationChange?: (model: GridPaginationModel) => void;
  onRowClick?: (id: string) => void;
  height?: number;
}

const DataGrid: React.FC<DataGridProps> = ({
  rows,
  columns,
  loading = false,
  pagination,
  onPaginationChange,
  onRowClick,
  height = 600,
}) => {
  return (
    <Paper sx={{ height, width: '100%' }}>
      <MuiDataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pagination
        paginationMode={pagination ? 'server' : 'client'}
        paginationModel={pagination ? {
          page: pagination.page - 1, // MUI usa 0-indexed
          pageSize: pagination.pageSize,
        } : undefined}
        rowCount={pagination?.total}
        onPaginationModelChange={onPaginationChange ? (model) => {
          onPaginationChange({
            ...model,
            page: model.page + 1, // Convertir a 1-indexed
          });
        } : undefined}
        onRowClick={onRowClick ? (params) => onRowClick(params.id as string) : undefined}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
          },
        }}
      />
    </Paper>
  );
};

export default DataGrid;
```

---

## 6. **Configuración de Redux**

### 🏪 **Store Configuration**

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import personasReducer from './slices/personasSlice';
import actividadesReducer from './slices/actividadesSlice';
import aulasReducer from './slices/aulasSlice';
import cuotasReducer from './slices/cuotasSlice';
import mediosPagoReducer from './slices/mediosPagoSlice';
import recibosReducer from './slices/recibosSlice';
import configuracionReducer from './slices/configuracionSlice';
import participacionReducer from './slices/participacionSlice';
import familiaresReducer from './slices/familiaresSlice';
import reservasReducer from './slices/reservasSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    personas: personasReducer,
    actividades: actividadesReducer,
    aulas: aulasReducer,
    cuotas: cuotasReducer,
    mediosPago: mediosPagoReducer,
    recibos: recibosReducer,
    configuracion: configuracionReducer,
    participacion: participacionReducer,
    familiares: familiaresReducer,
    reservas: reservasReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 🍕 **Slice Example (Personas)**

```typescript
// src/store/slices/personasSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { personasApi } from '../../services/personasApi';
import { Persona, CreatePersonaDto } from '../../types/personas';

interface PersonasState {
  personas: Persona[];
  currentPersona: Persona | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    tipo?: string;
    categoria?: string;
    search?: string;
  };
}

const initialState: PersonasState = {
  personas: [],
  currentPersona: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
};

// Async Thunks
export const fetchPersonas = createAsyncThunk(
  'personas/fetchPersonas',
  async (params: {
    page?: number;
    limit?: number;
    tipo?: string;
    categoria?: string;
    search?: string;
  }) => {
    const response = await personasApi.getPersonas(params);
    return response.data;
  }
);

export const createPersona = createAsyncThunk(
  'personas/createPersona',
  async (personaData: CreatePersonaDto) => {
    const response = await personasApi.createPersona(personaData);
    return response.data;
  }
);

export const updatePersona = createAsyncThunk(
  'personas/updatePersona',
  async ({ id, data }: { id: string; data: Partial<CreatePersonaDto> }) => {
    const response = await personasApi.updatePersona(id, data);
    return response.data;
  }
);

export const deletePersona = createAsyncThunk(
  'personas/deletePersona',
  async (id: string) => {
    await personasApi.deletePersona(id);
    return id;
  }
);

export const fetchPersonaById = createAsyncThunk(
  'personas/fetchPersonaById',
  async (id: string) => {
    const response = await personasApi.getPersonaById(id);
    return response.data;
  }
);

const personasSlice = createSlice({
  name: 'personas',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<PersonasState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentPersona: (state) => {
      state.currentPersona = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Personas
      .addCase(fetchPersonas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPersonas.fulfilled, (state, action) => {
        state.loading = false;
        state.personas = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchPersonas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error fetching personas';
      })

      // Create Persona
      .addCase(createPersona.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPersona.fulfilled, (state, action) => {
        state.loading = false;
        state.personas.unshift(action.payload.data);
      })
      .addCase(createPersona.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error creating persona';
      })

      // Update Persona
      .addCase(updatePersona.fulfilled, (state, action) => {
        const index = state.personas.findIndex(p => p.id === action.payload.data.id);
        if (index !== -1) {
          state.personas[index] = action.payload.data;
        }
        if (state.currentPersona?.id === action.payload.data.id) {
          state.currentPersona = action.payload.data;
        }
      })

      // Delete Persona
      .addCase(deletePersona.fulfilled, (state, action) => {
        state.personas = state.personas.filter(p => p.id !== action.payload);
        if (state.currentPersona?.id === action.payload) {
          state.currentPersona = null;
        }
      })

      // Fetch Persona by ID
      .addCase(fetchPersonaById.fulfilled, (state, action) => {
        state.currentPersona = action.payload.data;
      });
  },
});

export const { setFilters, clearCurrentPersona, clearError } = personasSlice.actions;
export default personasSlice.reducer;
```

---

## 7. **Configuración de routing**

```typescript
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { store } from './store';
import { theme } from './theme';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Dashboard from './pages/Dashboard/Dashboard';
import PersonasPage from './pages/Personas/PersonasPage';
import ActividadesPage from './pages/Actividades/ActividadesPage';
import AulasPage from './pages/Aulas/AulasPage';
import CuotasPage from './pages/Cuotas/CuotasPage';
import MediosPagoPage from './pages/MediosPago/MediosPagoPage';
import RecibosPage from './pages/Recibos/RecibosPage';
import ConfiguracionPage from './pages/Configuracion/ConfiguracionPage';
import ParticipacionPage from './pages/Participacion/ParticipacionPage';
import FamiliaresPage from './pages/Familiares/FamiliaresPage';
import ReservasPage from './pages/Reservas/ReservasPage';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/personas/*" element={<PersonasPage />} />
              <Route path="/actividades/*" element={<ActividadesPage />} />
              <Route path="/aulas/*" element={<AulasPage />} />
              <Route path="/cuotas/*" element={<CuotasPage />} />
              <Route path="/medios-pago/*" element={<MediosPagoPage />} />
              <Route path="/recibos/*" element={<RecibosPage />} />
              <Route path="/configuracion/*" element={<ConfiguracionPage />} />
              <Route path="/participacion/*" element={<ParticipacionPage />} />
              <Route path="/familiares/*" element={<FamiliaresPage />} />
              <Route path="/reservas/*" element={<ReservasPage />} />
            </Routes>
          </DashboardLayout>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
```

---

## 8. **Diseño y tema MUI**

```typescript
// src/theme/index.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#f50057',
      light: '#ff5983',
      dark: '#c51162',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#1976d2',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
```

---

## 9. **Implementación paso a paso**

### 🚀 **Paso 1: Configuración inicial**

```bash
# Crear proyecto
npm create vite@latest sigesda-frontend -- --template react-ts
cd sigesda-frontend

# Instalar dependencias
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @mui/lab @mui/x-data-grid
npm install @reduxjs/toolkit react-redux
npm install axios react-router-dom date-fns
npm install @types/node

# Iniciar desarrollo
npm run dev
```

### 📝 **Paso 2: Estructura de servicios**

```typescript
// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

```typescript
// src/services/personasApi.ts
import { api } from './api';
import { Persona, CreatePersonaDto } from '../types/personas';

export const personasApi = {
  async getPersonas(params: {
    page?: number;
    limit?: number;
    tipo?: string;
    categoria?: string;
    search?: string;
  }) {
    const response = await api.get('/personas', { params });
    return response.data;
  },

  async createPersona(data: CreatePersonaDto) {
    const response = await api.post('/personas', data);
    return response.data;
  },

  async getPersonaById(id: string) {
    const response = await api.get(`/personas/${id}`);
    return response.data;
  },

  async updatePersona(id: string, data: Partial<CreatePersonaDto>) {
    const response = await api.put(`/personas/${id}`, data);
    return response.data;
  },

  async deletePersona(id: string) {
    const response = await api.delete(`/personas/${id}`);
    return response.data;
  },

  async searchPersonas(params: {
    search: string;
    searchBy?: string;
    tipo?: string;
  }) {
    const response = await api.get('/personas/search', { params });
    return response.data;
  },
};
```

### 🎯 **Paso 3: Páginas principales**

```typescript
// src/pages/Personas/PersonasPage.tsx
import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import PersonasList from './PersonasList';
import PersonaForm from './PersonaForm';
import PersonaDetail from './PersonaDetail';

const PersonasPage: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PersonasList />} />
      <Route path="/nuevo" element={<PersonaForm />} />
      <Route path="/:id" element={<PersonaDetail />} />
      <Route path="/:id/editar" element={<PersonaForm />} />
    </Routes>
  );
};

export default PersonasPage;
```

```typescript
// src/pages/Personas/PersonasList.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
} from '@mui/material';
import { Add, Person, School, Work, Business } from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchPersonas, setFilters } from '../../store/slices/personasSlice';
import DataGrid from '../../components/ui/DataGrid';

const PersonasList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { personas, loading, pagination, filters } = useAppSelector(state => state.personas);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchPersonas({
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
    }));
  }, [dispatch, pagination.page, pagination.limit, filters]);

  const handleSearch = () => {
    dispatch(setFilters({ search: searchTerm }));
  };

  const handleFilterChange = (field: string, value: string) => {
    dispatch(setFilters({ [field]: value || undefined }));
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'SOCIO': return <Person />;
      case 'DOCENTE': return <School />;
      case 'PROVEEDOR': return <Business />;
      default: return <Work />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'SOCIO': return 'primary';
      case 'DOCENTE': return 'secondary';
      case 'PROVEEDOR': return 'warning';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'tipo',
      headerName: 'Tipo',
      width: 130,
      renderCell: (params) => (
        <Chip
          icon={getTipoIcon(params.value)}
          label={params.value}
          size="small"
          color={getTipoColor(params.value) as any}
          variant="outlined"
        />
      ),
    },
    {
      field: 'numeroSocio',
      headerName: 'N° Socio',
      width: 100,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'nombre',
      headerName: 'Nombre',
      width: 200,
      renderCell: (params) => `${params.row.nombre} ${params.row.apellido}`,
    },
    {
      field: 'dni',
      headerName: 'DNI',
      width: 120,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'categoria',
      headerName: 'Categoría',
      width: 130,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'especialidad',
      headerName: 'Especialidad',
      width: 180,
      renderCell: (params) => params.value || '-',
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Personas
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/personas/nuevo')}
          size="large"
        >
          Nueva Persona
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Buscar personas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={filters.tipo || ''}
                  onChange={(e) => handleFilterChange('tipo', e.target.value)}
                  label="Tipo"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="SOCIO">Socios</MenuItem>
                  <MenuItem value="DOCENTE">Docentes</MenuItem>
                  <MenuItem value="NO_SOCIO">No Socios</MenuItem>
                  <MenuItem value="PROVEEDOR">Proveedores</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={filters.categoria || ''}
                  onChange={(e) => handleFilterChange('categoria', e.target.value)}
                  label="Categoría"
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="ACTIVO">Activo</MenuItem>
                  <MenuItem value="ESTUDIANTE">Estudiante</MenuItem>
                  <MenuItem value="FAMILIAR">Familiar</MenuItem>
                  <MenuItem value="JUBILADO">Jubilado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                onClick={handleSearch}
                fullWidth
                size="large"
              >
                Buscar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <DataGrid
        rows={personas}
        columns={columns}
        loading={loading}
        pagination={{
          page: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
        }}
        onPaginationChange={(model) => {
          dispatch(fetchPersonas({
            page: model.page,
            limit: model.pageSize,
            ...filters,
          }));
        }}
        onRowClick={(id) => navigate(`/personas/${id}`)}
      />
    </Box>
  );
};

export default PersonasList;
```

### 🛠 **Paso 4: Formularios**

```typescript
// src/pages/Personas/PersonaForm.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Divider,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createPersona, updatePersona, fetchPersonaById } from '../../store/slices/personasSlice';

const validationSchema = Yup.object({
  tipo: Yup.string().required('El tipo es requerido'),
  nombre: Yup.string().required('El nombre es requerido'),
  apellido: Yup.string().required('El apellido es requerido'),
  dni: Yup.string().required('El DNI es requerido'),
  email: Yup.string().email('Email inválido'),
  // Validaciones condicionales según tipo
});

const PersonaForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const { currentPersona, loading, error } = useAppSelector(state => state.personas);

  const isEdit = Boolean(id);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      tipo: '',
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      telefono: '',
      direccion: '',
      fechaNacimiento: '',
      numeroSocio: '',
      categoria: '',
      fechaIngreso: '',
      especialidad: '',
      honorariosPorHora: '',
      cuit: '',
      razonSocial: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        const cleanValues = Object.fromEntries(
          Object.entries(values).filter(([_, value]) => value !== '')
        );

        if (isEdit && id) {
          await dispatch(updatePersona({ id, data: cleanValues })).unwrap();
        } else {
          await dispatch(createPersona(cleanValues)).unwrap();
        }

        navigate('/personas');
      } catch (error: any) {
        setSubmitError(error.message || 'Error al guardar la persona');
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      dispatch(fetchPersonaById(id));
    }
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (currentPersona && isEdit) {
      formik.setValues({
        tipo: currentPersona.tipo || '',
        nombre: currentPersona.nombre || '',
        apellido: currentPersona.apellido || '',
        dni: currentPersona.dni || '',
        email: currentPersona.email || '',
        telefono: currentPersona.telefono || '',
        direccion: currentPersona.direccion || '',
        fechaNacimiento: currentPersona.fechaNacimiento?.split('T')[0] || '',
        numeroSocio: currentPersona.numeroSocio?.toString() || '',
        categoria: currentPersona.categoria || '',
        fechaIngreso: currentPersona.fechaIngreso?.split('T')[0] || '',
        especialidad: currentPersona.especialidad || '',
        honorariosPorHora: currentPersona.honorariosPorHora?.toString() || '',
        cuit: currentPersona.cuit || '',
        razonSocial: currentPersona.razonSocial || '',
      });
    }
  }, [currentPersona, isEdit]);

  const renderConditionalFields = () => {
    switch (formik.values.tipo) {
      case 'SOCIO':
        return (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="numeroSocio"
                label="Número de Socio"
                type="number"
                value={formik.values.numeroSocio}
                onChange={formik.handleChange}
                error={formik.touched.numeroSocio && Boolean(formik.errors.numeroSocio)}
                helperText={formik.touched.numeroSocio && formik.errors.numeroSocio}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  name="categoria"
                  value={formik.values.categoria}
                  onChange={formik.handleChange}
                  label="Categoría"
                >
                  <MenuItem value="ACTIVO">Activo</MenuItem>
                  <MenuItem value="ESTUDIANTE">Estudiante</MenuItem>
                  <MenuItem value="FAMILIAR">Familiar</MenuItem>
                  <MenuItem value="JUBILADO">Jubilado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="fechaIngreso"
                label="Fecha de Ingreso"
                type="date"
                value={formik.values.fechaIngreso}
                onChange={formik.handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </>
        );

      case 'DOCENTE':
        return (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="especialidad"
                label="Especialidad"
                value={formik.values.especialidad}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="honorariosPorHora"
                label="Honorarios por Hora"
                type="number"
                value={formik.values.honorariosPorHora}
                onChange={formik.handleChange}
              />
            </Grid>
          </>
        );

      case 'PROVEEDOR':
        return (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="cuit"
                label="CUIT"
                value={formik.values.cuit}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="razonSocial"
                label="Razón Social"
                value={formik.values.razonSocial}
                onChange={formik.handleChange}
              />
            </Grid>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/personas')}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1">
          {isEdit ? 'Editar Persona' : 'Nueva Persona'}
        </Typography>
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Información Básica
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Persona</InputLabel>
                  <Select
                    name="tipo"
                    value={formik.values.tipo}
                    onChange={formik.handleChange}
                    label="Tipo de Persona"
                    error={formik.touched.tipo && Boolean(formik.errors.tipo)}
                  >
                    <MenuItem value="SOCIO">Socio</MenuItem>
                    <MenuItem value="NO_SOCIO">No Socio</MenuItem>
                    <MenuItem value="DOCENTE">Docente</MenuItem>
                    <MenuItem value="PROVEEDOR">Proveedor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  name="nombre"
                  label="Nombre"
                  value={formik.values.nombre}
                  onChange={formik.handleChange}
                  error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                  helperText={formik.touched.nombre && formik.errors.nombre}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  name="apellido"
                  label="Apellido"
                  value={formik.values.apellido}
                  onChange={formik.handleChange}
                  error={formik.touched.apellido && Boolean(formik.errors.apellido)}
                  helperText={formik.touched.apellido && formik.errors.apellido}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  name="dni"
                  label="DNI"
                  value={formik.values.dni}
                  onChange={formik.handleChange}
                  error={formik.touched.dni && Boolean(formik.errors.dni)}
                  helperText={formik.touched.dni && formik.errors.dni}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="telefono"
                  label="Teléfono"
                  value={formik.values.telefono}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="direccion"
                  label="Dirección"
                  value={formik.values.direccion}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="fechaNacimiento"
                  label="Fecha de Nacimiento"
                  type="date"
                  value={formik.values.fechaNacimiento}
                  onChange={formik.handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {formik.values.tipo && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Información Específica - {formik.values.tipo}
                    </Typography>
                  </Grid>
                  {renderConditionalFields()}
                </>
              )}

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/personas')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    loading={loading}
                  >
                    {isEdit ? 'Actualizar' : 'Crear'} Persona
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PersonaForm;
```

---

## 📚 **Prompts sugeridos para el desarrollador frontend**

### 🎯 **Prompt 1: Configuración inicial**

```
Necesito crear una aplicación React con TypeScript usando Vite que implemente un dashboard administrativo para el sistema SIGESDA. La aplicación debe usar:

- React 18 + TypeScript + Vite
- Material-UI (MUI) para la interfaz
- Redux Toolkit para estado global
- React Router para navegación
- Axios para servicios API

La estructura debe incluir:
- Layout con sidebar navegable
- 10 módulos principales: Dashboard, Personas, Actividades, Aulas, Cuotas, Medios de Pago, Recibos, Configuración, Participación, Familiares, Reservas
- Tema personalizado con colores corporativos
- Componentes reutilizables para DataGrid, formularios, etc.

Por favor, ayúdame a crear la estructura inicial del proyecto con la configuración de Vite, las dependencias necesarias y la estructura de carpetas recomendada.
```

### 🎯 **Prompt 2: Implementación de módulos**

```
Ayúdame a implementar el módulo de [MÓDULO] para la aplicación SIGESDA. Este módulo debe incluir:

1. **Lista con DataGrid** que muestre todos los registros con:
   - Paginación del lado del servidor
   - Filtros avanzados
   - Búsqueda en tiempo real
   - Columnas personalizadas según el tipo de datos

2. **Formulario de creación/edición** con:
   - Validaciones con Formik + Yup
   - Campos condicionales según el tipo de registro
   - Manejo de errores
   - Interfaz responsiva

3. **Vista de detalle** que muestre:
   - Información completa del registro
   - Acciones disponibles (editar, eliminar)
   - Datos relacionados

4. **Integración con Redux** para:
   - Estado global del módulo
   - Acciones asíncronas con Redux Toolkit
   - Manejo de loading y errores

El módulo debe consumir la API REST documentada y seguir los patrones establecidos en la guía de desarrollo.
```

### 🎯 **Prompt 3: Dashboard principal**

```
Necesito crear un dashboard principal para SIGESDA que incluya:

1. **Widgets informativos** con estadísticas:
   - Total de socios por categoría
   - Actividades más populares
   - Recaudación mensual
   - Cuotas vencidas y pendientes
   - Reservas de aulas próximas

2. **Gráficos interactivos** usando Chart.js o similar:
   - Evolución de ingresos por mes
   - Distribución de socios por categoría
   - Ocupación de aulas
   - Medios de pago más utilizados

3. **Tabla de actividades recientes**:
   - Últimos pagos registrados
   - Nuevas inscripciones
   - Reservas del día

4. **Accesos rápidos** a funciones importantes:
   - Generar cuotas del mes
   - Registrar nuevo pago
   - Crear nueva reserva
   - Ver reportes

Todos los datos deben obtenerse de los endpoints correspondientes y actualizarse en tiempo real.
```

### 🎯 **Prompt 4: Funcionalidades avanzadas**

```
Implementa las siguientes funcionalidades avanzadas para la aplicación SIGESDA:

1. **Sistema de notificaciones** que muestre:
   - Cuotas próximas a vencer
   - Conflictos en reservas de aulas
   - Pagos pendientes de aprobación

2. **Generación de reportes** con:
   - Filtros personalizables por fecha, categoría, etc.
   - Exportación a PDF y Excel
   - Gráficos incluidos en los reportes
   - Programación de reportes automáticos

3. **Búsqueda global** que permita:
   - Buscar en todos los módulos desde una barra principal
   - Sugerencias automáticas
   - Filtros por tipo de contenido
   - Navegación directa a los resultados

4. **Gestión de permisos** según el tipo de usuario:
   - Roles administrativos
   - Acceso restringido a ciertas funciones
   - Logs de actividad

Utiliza las mejores prácticas de UX/UI y mantén la consistencia con el diseño establecido.
```

### 🎯 **Prompt 5: Testing y optimización**

```
Ayúdame a implementar testing y optimizaciones para la aplicación SIGESDA:

1. **Testing unitario** con Jest y React Testing Library:
   - Tests para componentes principales
   - Tests para Redux slices
   - Tests para servicios API
   - Mocks para las llamadas a la API

2. **Testing de integración**:
   - Flujos completos de usuario
   - Navegación entre páginas
   - Formularios complejos

3. **Optimizaciones de rendimiento**:
   - Lazy loading de componentes
   - Memoización con React.memo
   - Optimización de re-renders
   - Code splitting por rutas

4. **PWA y accesibilidad**:
   - Service worker para cache
   - Funcionamiento offline básico
   - Estándares de accesibilidad WCAG
   - SEO optimization

Proporciona ejemplos concretos y guías de implementación.
```

---

## 🎉 **¡Proyecto listo para desarrollo!**

Esta guía proporciona toda la documentación necesaria para desarrollar el frontend completo de SIGESDA. El desarrollador frontend puede usar estos prompts paso a paso para crear una aplicación robusta, escalable y profesional que aproveche al máximo todos los endpoints del backend implementado.

### 📋 **Resumen de la aplicación a desarrollar:**

- ✅ **150+ endpoints** documentados y listos para consumir
- ✅ **10 módulos CRUD** completamente funcionales
- ✅ **Dashboard administrativo** con sidebar navegable
- ✅ **Arquitectura escalable** con React + Redux + MUI
- ✅ **TypeScript** para mayor robustez
- ✅ **Componentes reutilizables** y patrones consistentes
- ✅ **Responsive design** para todos los dispositivos

La aplicación resultante será un sistema completo de gestión para asociaciones musicales con todas las funcionalidades necesarias para administrar socios, actividades, pagos, reservas y más. 🎵✨