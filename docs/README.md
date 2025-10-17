# Documentación del Sistema SIGESDA - Backend

Bienvenido a la documentación del backend de SIGESDA (Sistema de Gestión de Servicios para Adultos).

## 📚 Documentos Disponibles

### APIs y Endpoints

- **[API de Actividades V2.0](./API_ACTIVIDADES_V2.md)** ⭐ *NUEVO*
  - Documentación completa de todos los endpoints del módulo de Actividades
  - Incluye ejemplos de uso, códigos de respuesta y validaciones
  - 26 endpoints documentados con request/response detallados
  - Preparado para el equipo de desarrollo frontend

### Planes de Implementación

- **[Plan de Rediseño de Actividades](./REDISENO_ACTIVIDAD_COMPLETO.md)**
  - Plan completo del rediseño del módulo de actividades
  - Cambio de modelo UUID a SERIAL IDs
  - Implementación de tablas de catálogos dinámicos

- **[Resumen de Implementación](./RESUMEN_IMPLEMENTACION_REDISENO.md)**
  - Estado de implementación por fases
  - Progreso del rediseño V2.0

### DTOs y Validaciones

- **[Resumen de DTOs V2](./RESUMEN_DTOS_V2.md)**
  - Documentación de Data Transfer Objects
  - Schemas de validación con Zod

### Soluciones y Fixes

- **[Solución Actualización de Familiares](./SOLUCION_ACTUALIZACION_FAMILIARES.md)**
  - Fix para problemas con actualización de relaciones familiares

## 🚀 Quick Start

### Para Desarrolladores Frontend

Si necesitas integrar el frontend con el backend, empieza por aquí:

1. **Lee la [API de Actividades V2.0](./API_ACTIVIDADES_V2.md)**
   - Base URL: `http://localhost:8000/api/actividades`
   - Todos los endpoints están documentados con ejemplos
   - Incluye tipos TypeScript sugeridos

2. **Revisa los ejemplos de uso**
   - Cada endpoint tiene ejemplos con fetch/axios
   - Manejo de errores incluido

3. **Considera la autenticación**
   - Actualmente no requiere auth (desarrollo)
   - En producción requerirá JWT token

### Para Desarrolladores Backend

Si vas a modificar o extender el backend:

1. **Revisa el plan de rediseño**
   - [Plan de Rediseño de Actividades](./REDISENO_ACTIVIDAD_COMPLETO.md)
   - Entiende la arquitectura V2.0

2. **Ejecuta las pruebas**
   ```bash
   # Pruebas unitarias
   npx tsx scripts/test-actividades-repository.ts

   # Pruebas de integración
   npx tsx scripts/test-actividades-integration.ts

   # Validación de integridad
   npx tsx scripts/validar-integridad-referencial.ts

   # Prueba end-to-end
   npx tsx scripts/test-e2e-actividades.ts
   ```

3. **Revisa los DTOs**
   - [Resumen de DTOs V2](./RESUMEN_DTOS_V2.md)
   - Ubicación: `src/dto/actividad-v2.dto.ts`

## 📊 Estado del Proyecto

### Módulo de Actividades V2.0

| Componente | Estado | Pruebas |
|------------|--------|---------|
| **Migración de datos** | ✅ Completado | 100% |
| **Repository Layer** | ✅ Completado | 18/18 ✅ |
| **Service Layer** | ✅ Completado | N/A |
| **Controller Layer** | ✅ Completado | N/A |
| **Endpoints HTTP** | ✅ Completado | 23/23 ✅ |
| **Integridad referencial** | ✅ Validado | 11/11 ✅ |
| **Flujo end-to-end** | ✅ Validado | 17/17 ✅ |
| **Documentación API** | ✅ Completado | - |

**Total de validaciones**: 69/69 (100%) ✅

## 🛠️ Scripts Disponibles

### Scripts de Migración

```bash
# Migrar datos de actividades al nuevo modelo
npx tsx scripts/migracion-datos-actividades.ts
```

### Scripts de Pruebas

```bash
# Pruebas unitarias del Repository
npx tsx scripts/test-actividades-repository.ts

# Pruebas de integración de endpoints
npx tsx scripts/test-actividades-integration.ts

# Validación de integridad referencial
npx tsx scripts/validar-integridad-referencial.ts

# Prueba end-to-end completa
npx tsx scripts/test-e2e-actividades.ts
```

### Scripts de Validación

```bash
# Validar DTOs V2
npx tsx scripts/validar_dtos_v2.ts

# Validar rediseño completo
npx tsx scripts/validar_rediseno.ts
```

## 🏗️ Arquitectura

### Estructura de Capas

```
┌─────────────────────────────────────┐
│     Routes (actividad.routes.ts)    │
│  - Definición de endpoints          │
│  - Binding de controllers           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Controller (actividad.controller) │
│  - Validación de parámetros         │
│  - Parsing de DTOs                  │
│  - Manejo de respuestas HTTP        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Service (actividad.service)      │
│  - Lógica de negocio                │
│  - Validaciones complejas           │
│  - Coordinación de operaciones      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Repository (actividad.repository)  │
│  - Acceso a datos con Prisma        │
│  - Queries optimizadas              │
│  - Transformaciones de datos        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Database (PostgreSQL)        │
│  - Modelo V2.0 con SERIAL IDs       │
│  - Tablas de catálogos              │
│  - Integridad referencial           │
└─────────────────────────────────────┘
```

### Modelo de Datos V2.0

**Cambios principales**:
- ✅ IDs SERIAL (INTEGER) en lugar de UUID/CUID
- ✅ Tablas de catálogos dinámicos (tipos, categorías, estados, etc.)
- ✅ Relación N:M entre actividades y horarios
- ✅ Soft delete para docentes_actividades
- ✅ Mejor normalización y escalabilidad

**Tablas principales**:
- `actividades` - Información básica de actividades
- `horarios_actividades` - Horarios semanales (N:M)
- `docentes_actividades` - Asignación de docentes
- `participaciones_actividades` - Inscripciones de participantes
- `reservas_aulas_actividades` - Reservas de espacios

**Catálogos**:
- `tipos_actividades` - Coro, Taller, Club, etc.
- `categorias_actividades` - Adultos, Jóvenes, Niños, etc.
- `estados_actividades` - Activa, Inactiva, Finalizada, Cancelada
- `dias_semana` - Lunes a Domingo
- `roles_docentes` - Profesor, Ayudante, Invitado, Coordinador

## 📝 Convenciones de Código

### Nomenclatura

- **Archivos**: `kebab-case.ts` (ej: `actividad.service.ts`)
- **Clases**: `PascalCase` (ej: `ActividadService`)
- **Funciones**: `camelCase` (ej: `getActividades`)
- **Constantes**: `UPPER_SNAKE_CASE` (ej: `BASE_URL`)

### Manejo de Errores

```typescript
// Usar errores personalizados
throw new NotFoundError('Actividad no encontrada');
throw new ValidationError('Código duplicado');

// El middleware de errores convierte a HTTP status correcto
// NotFoundError -> 404
// ValidationError -> 400
```

### DTOs y Validación

```typescript
// Usar Zod para validación
const data = createActividadSchema.parse(req.body);

// Los schemas están en src/dto/actividad-v2.dto.ts
```

## 🔐 Seguridad

### Estado Actual (Desarrollo)

- ❌ Sin autenticación
- ❌ Sin rate limiting
- ✅ Validación de entrada (Zod)
- ✅ SQL injection protection (Prisma)

### Pendiente para Producción

- [ ] Implementar JWT authentication
- [ ] Agregar rate limiting
- [ ] HTTPS obligatorio
- [ ] Validar permisos por rol
- [ ] Logs de auditoría

## 🐛 Reporte de Bugs

Si encuentras algún problema:

1. Verifica que no sea un problema conocido
2. Ejecuta las pruebas para reproducir
3. Documenta el caso de uso
4. Crea un issue con:
   - Descripción del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Logs relevantes

## 📞 Contacto

- **Equipo Backend**: [correo del equipo]
- **Repositorio**: [URL del repositorio]
- **Wiki**: [URL de la wiki si existe]

## 📜 Licencia

[Especificar licencia del proyecto]

---

**Última actualización**: 2025-10-15
**Versión**: 2.0
