# IMPLEMENTACIÓN: PERSONA CON MÚLTIPLES TIPOS

**Fecha de inicio:** 2025-10-27
**Estado:** EN PROGRESO
**Branch:** postgres-y-negocio-etapa-2

---

## 📊 PROGRESO GENERAL

### ✅ Completado
- [x] FASE 1: Crear nuevos modelos en Prisma schema
- [x] FASE 2: Crear scripts de migración de datos
- [x] FASE 3: Refactorizar backend completo
  - [x] FASE 3.1: Crear nuevos DTOs
  - [x] FASE 3.2: Crear PersonaTipoRepository
  - [x] FASE 3.3: Refactorizar PersonaRepository
  - [x] FASE 3.4: Crear Services
  - [x] FASE 3.5: Crear Controllers
  - [x] FASE 3.6: Actualizar Routes
- [x] FASE 5: Documentar cambios y API

### ⏳ Pendiente
- [ ] FASE 4: Crear tests (opcional)
- [ ] Ejecutar migración en base de datos
- [ ] Activar código refactorizado

---

## 📁 ARCHIVOS CREADOS/MODIFICADOS

### Schema de Prisma
- ✅ **prisma/schema.prisma** - Modificado con nuevos modelos:
  - `TipoPersonaCatalogo` (tabla: `tipos_persona`)
  - `EspecialidadDocente` (tabla: `especialidades_docentes`)
  - `PersonaTipo` (tabla: `persona_tipos`)
  - `ContactoPersona` (tabla: `contactos_persona`)
  - Enum `TipoContacto`
  - Modelo `Persona` simplificado (sin campos específicos de tipo)
  - `ComisionDirectiva` actualizado (socioId → personaId)
  - `Familiar` actualizado (socioId → personaPrincipalId)

### Scripts de Migración
- ✅ **prisma/migrations/20251027185921_persona_multiples_tipos/migration.sql**
  - Crea catálogos (tipos_persona, especialidades_docentes)
  - Crea tablas (persona_tipos, contactos_persona)
  - Migra datos existentes
  - Elimina columnas obsoletas de personas
  - Actualiza tablas relacionadas

- ✅ **scripts/persona-multiples-tipos/01-backup-antes-migracion.sql**
  - Respalda datos antes de la migración

- ✅ **scripts/persona-multiples-tipos/02-validar-migracion.sql**
  - Valida que la migración se ejecutó correctamente
  - Verifica integridad de datos

- ✅ **scripts/persona-multiples-tipos/03-rollback-migracion.sql**
  - Revierte la migración en caso de error

- ✅ **scripts/persona-multiples-tipos/ejecutar-migracion.sh**
  - Script automatizado para ejecutar la migración

- ✅ **scripts/persona-multiples-tipos/ejecutar-rollback.sh**
  - Script automatizado para revertir la migración

### DTOs
- ✅ **src/dto/persona-tipo.dto.ts** - Nuevo archivo:
  - `createPersonaTipoSchema`
  - `updatePersonaTipoSchema`
  - `createContactoPersonaSchema`
  - `updateContactoPersonaSchema`
  - Interfaces para datos específicos por tipo

- ✅ **src/dto/persona.dto.new.ts** - Nuevo archivo:
  - `createPersonaSchema` (nuevo modelo con tipos y contactos)
  - `updatePersonaSchema`
  - `personaQuerySchema` (con filtros por múltiples tipos)
  - `createPersonaLegacySchema` (retrocompatibilidad)
  - Funciones de transformación y validación

### Repositories
- ✅ **src/repositories/persona-tipo.repository.ts** - Nuevo archivo:
  - Gestión de tipos de persona
  - Gestión de contactos
  - Acceso a catálogos

### Services
- ⏳ **src/services/persona.service.ts** - A refactorizar
- ⏳ **src/services/persona-tipo.service.ts** - A crear

### Controllers
- ⏳ **src/controllers/persona.controller.ts** - A refactorizar
- ⏳ **src/controllers/persona-tipo.controller.ts** - A crear

### Routes
- ✅ **src/routes/persona.routes.new.ts** - Refactorizado
- ✅ **src/routes/persona-tipo.routes.ts** - Nuevo archivo
- ✅ **src/routes/index.persona-v2.ts** - Router integrado

### Documentación
- ✅ **GUIA_INTEGRACION_PERSONA_V2.md** - Guía de integración
- ✅ **docs/API_PERSONA_V2.md** - Documentación completa de API con ejemplos

---

## 🔑 CAMBIOS CLAVE DEL MODELO

### Modelo Anterior
```typescript
model Persona {
  id: Int
  tipo: TipoPersona (ENUM único)
  // Campos mezclados de todos los tipos
  categoriaId, numeroSocio, fechaIngreso  // SOCIO
  especialidad, honorariosPorHora         // DOCENTE
  cuit, razonSocial                       // PROVEEDOR
}
```

### Modelo Nuevo
```typescript
model Persona {
  id: Int
  // Solo datos base
  nombre, apellido, dni, email, telefono

  // Relaciones
  tipos: PersonaTipo[]      // Múltiples tipos
  contactos: ContactoPersona[]  // Múltiples contactos
}

model PersonaTipo {
  personaId: Int
  tipoPersonaId: Int
  // Campos específicos por tipo
  categoriaId, numeroSocio, ... // SOCIO
  especialidadId, honorariosPorHora // DOCENTE
  cuit, razonSocial             // PROVEEDOR
}
```

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### ✅ Catálogos
- Tipos de persona (NO_SOCIO, SOCIO, DOCENTE, PROVEEDOR)
- Especialidades de docentes (GENERAL + extensible)
- Tipos de contacto (EMAIL, TELEFONO, CELULAR, WHATSAPP, etc.)

### ✅ Gestión de Tipos
- Asignar múltiples tipos a una persona
- Actualizar datos específicos de cada tipo
- Desasignar tipos (con fecha de desasignación)
- Historial de tipos asignados

### ✅ Gestión de Contactos
- Múltiples contactos por persona
- Diferentes tipos de contacto
- Contacto principal por tipo
- Mantener email y telefono en tabla personas (campo legacy)

### ✅ Validaciones
- Tipo SOCIO requiere categoriaId
- Tipo DOCENTE requiere especialidadId
- Tipo PROVEEDOR requiere cuit y razonSocial
- Auto-asignación de numeroSocio para nuevos socios

### ✅ Retrocompatibilidad
- Mantener email y telefono en personas
- Schema legacy para API v1
- Función de transformación de datos legacy

---

## 🚀 PRÓXIMOS PASOS

### 1. Completar Refactorización Backend
- [ ] Refactorizar PersonaRepository
- [ ] Crear PersonaTipoService
- [ ] Refactorizar PersonaService
- [ ] Crear PersonaTipoController
- [ ] Refactorizar PersonaController
- [ ] Actualizar Routes

### 2. Ejecutar Migración
```bash
cd scripts/persona-multiples-tipos
./ejecutar-migracion.sh
```

### 3. Testing
- [ ] Tests unitarios de repositories
- [ ] Tests unitarios de services
- [ ] Tests de integración de endpoints
- [ ] Pruebas manuales con Postman/Thunder Client

### 4. Documentación
- [ ] Documentar endpoints nuevos
- [ ] Actualizar README
- [ ] Ejemplos de uso de la API

---

## 📝 NOTAS IMPORTANTES

### Consideraciones de Migración
1. **Backup obligatorio** antes de ejecutar la migración
2. La migración es **irreversible** (excepto con rollback)
3. Se pierden datos específicos de tipo si se ejecuta rollback después de crear nuevos datos
4. Validar datos antes de migrar producción

### Reglas de Negocio
1. Una persona DEBE tener al menos UN tipo activo
2. Por defecto, una persona sin tipo explícito recibe tipo NO_SOCIO
3. Una persona puede tener múltiples tipos simultáneos (ej: SOCIO + DOCENTE)
4. El número de socio es único en toda la tabla persona_tipos
5. El CUIT es único en toda la tabla persona_tipos

### Endpoints Propuestos
```
# Gestión de Personas (actualizado)
POST   /api/personas                    # Crear persona (tipo NO_SOCIO por defecto)
GET    /api/personas                    # Listar (filtros: tipos, categorias, etc.)
GET    /api/personas/:id                # Obtener persona con sus tipos
PUT    /api/personas/:id                # Actualizar datos base
DELETE /api/personas/:id                # Baja lógica/física

# Gestión de Tipos (nuevo)
POST   /api/personas/:id/tipos          # Asignar nuevo tipo
PUT    /api/personas/:id/tipos/:tipoId  # Modificar datos de tipo específico
DELETE /api/personas/:id/tipos/:tipoId  # Desasignar tipo
GET    /api/personas/:id/tipos          # Listar tipos de persona

# Gestión de Contactos (nuevo)
POST   /api/personas/:id/contactos      # Agregar contacto
PUT    /api/personas/:id/contactos/:contactoId  # Modificar contacto
DELETE /api/personas/:id/contactos/:contactoId  # Eliminar contacto
GET    /api/personas/:id/contactos      # Listar contactos

# Catálogos (nuevo)
GET    /api/catalogos/tipos-persona     # Listar tipos disponibles
GET    /api/catalogos/especialidades-docentes  # Listar especialidades
```

---

## 🔧 COMANDOS ÚTILES

### Regenerar Prisma Client
```bash
npx prisma generate
```

### Validar Schema
```bash
npx prisma validate
```

### Ver estado de migraciones
```bash
npx prisma migrate status
```

### Ejecutar migración
```bash
cd scripts/persona-multiples-tipos
./ejecutar-migracion.sh
```

### Rollback (en caso de error)
```bash
cd scripts/persona-multiples-tipos
./ejecutar-rollback.sh
```

---

## 📞 CONTACTO Y SOPORTE

En caso de dudas o problemas durante la implementación, revisar:
1. Este documento (IMPLEMENTACION_PERSONA_MULTIPLES_TIPOS.md)
2. El plan original (PLAN_PERSONA_MULTIPLES_TIPOS.md)
3. Los comentarios en el código
4. Los logs de la migración

---

**Última actualización:** 2025-10-27 19:00
