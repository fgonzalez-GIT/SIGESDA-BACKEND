# GUÍA DE INTEGRACIÓN: PERSONA CON MÚLTIPLES TIPOS

Esta guía explica cómo integrar el nuevo código refactorizado del módulo Persona.

---

## 📋 ARCHIVOS CREADOS

### DTOs (Data Transfer Objects)
- ✅ `src/dto/persona-tipo.dto.ts` - DTOs para tipos y contactos
- ✅ `src/dto/persona.dto.new.ts` - DTOs refactorizados de persona

### Repositories
- ✅ `src/repositories/persona-tipo.repository.ts` - Gestión de tipos y contactos
- ✅ `src/repositories/persona.repository.new.ts` - Gestión de personas (refactorizado)

### Services
- ✅ `src/services/persona-tipo.service.ts` - Lógica de negocio para tipos y contactos
- ✅ `src/services/persona.service.new.ts` - Lógica de negocio de personas (refactorizado)

### Controllers
- ✅ `src/controllers/persona-tipo.controller.ts` - Endpoints para tipos y contactos
- ✅ `src/controllers/persona.controller.new.ts` - Endpoints de personas (refactorizado)

### Routes
- ✅ `src/routes/persona-tipo.routes.ts` - Rutas para tipos y contactos
- ✅ `src/routes/persona.routes.new.ts` - Rutas de personas (refactorizado)
- ✅ `src/routes/index.persona-v2.ts` - Router principal integrado

---

## 🔄 PASOS PARA ACTIVAR EL NUEVO CÓDIGO

### OPCIÓN A: Reemplazo Directo (Recomendado para producción)

#### 1. Ejecutar la migración de base de datos

```bash
cd scripts/persona-multiples-tipos
./ejecutar-migracion.sh
```

Esto ejecutará:
- Backup de datos actuales
- Migración de esquema y datos
- Validación de la migración
- Regeneración de Prisma Client

#### 2. Reemplazar archivos existentes

```bash
# DTOs
mv src/dto/persona.dto.ts src/dto/persona.dto.old.ts
mv src/dto/persona.dto.new.ts src/dto/persona.dto.ts

# Repositories
mv src/repositories/persona.repository.ts src/repositories/persona.repository.old.ts
mv src/repositories/persona.repository.new.ts src/repositories/persona.repository.ts

# Services
mv src/services/persona.service.ts src/services/persona.service.old.ts
mv src/services/persona.service.new.ts src/services/persona.service.ts

# Controllers
mv src/controllers/persona.controller.ts src/controllers/persona.controller.old.ts
mv src/controllers/persona.controller.new.ts src/controllers/persona.controller.ts

# Routes
mv src/routes/persona.routes.ts src/routes/persona.routes.old.ts
mv src/routes/persona.routes.new.ts src/routes/persona.routes.ts
```

#### 3. Actualizar el archivo principal de rutas

Editar `src/index.ts` o `src/app.ts` para incluir las nuevas rutas:

```typescript
import personaRoutes from './routes/persona.routes';
import personaTipoRoutes from './routes/persona-tipo.routes';

// ...

app.use('/api/personas', personaRoutes);
app.use('/api', personaTipoRoutes); // Para /api/personas/:id/tipos, /api/catalogos, etc.
```

O usar el router integrado:

```typescript
import personaV2Routes from './routes/index.persona-v2';

// ...

app.use('/api', personaV2Routes);
```

#### 4. Reiniciar el servidor

```bash
npm run dev
```

---

### OPCIÓN B: Coexistencia Temporal (Para testing gradual)

Esta opción permite mantener ambas versiones funcionando simultáneamente.

#### 1. Ejecutar la migración

```bash
cd scripts/persona-multiples-tipos
./ejecutar-migracion.sh
```

#### 2. Montar ambas versiones en rutas diferentes

Editar `src/index.ts` o `src/app.ts`:

```typescript
// Versión antigua (legacy)
import personaRoutesV1 from './routes/persona.routes';

// Versión nueva
import personaV2Routes from './routes/index.persona-v2';

// ...

// API v1 (legacy - mantener para retrocompatibilidad temporal)
app.use('/api/v1/personas', personaRoutesV1);

// API v2 (nueva versión)
app.use('/api/v2', personaV2Routes);

// Alias: ruta por defecto apunta a v2
app.use('/api', personaV2Routes);
```

#### 3. Testing gradual

- Frontend/clientes existentes siguen usando `/api/v1/personas`
- Nuevas funcionalidades usan `/api/v2/personas` o `/api/personas`
- Una vez validado, deprecar v1

---

## 📝 VERIFICACIÓN POST-INTEGRACIÓN

### 1. Verificar que el servidor inicia sin errores

```bash
npm run dev
```

Revisar logs para confirmar que no hay errores de importación.

### 2. Verificar endpoints básicos

```bash
# Listar personas
curl http://localhost:8000/api/personas

# Obtener persona por ID
curl http://localhost:8000/api/personas/1

# Crear persona
curl -X POST http://localhost:8000/api/personas \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "email": "juan@example.com"
  }'
```

### 3. Verificar endpoints de tipos

```bash
# Listar catálogo de tipos
curl http://localhost:8000/api/catalogos/tipos-persona

# Asignar tipo SOCIO
curl -X POST http://localhost:8000/api/personas/1/tipos \
  -H "Content-Type: application/json" \
  -d '{
    "tipoPersonaCodigo": "SOCIO",
    "categoriaId": 1
  }'

# Listar tipos de una persona
curl http://localhost:8000/api/personas/1/tipos
```

### 4. Verificar endpoints de contactos

```bash
# Agregar contacto
curl -X POST http://localhost:8000/api/personas/1/contactos \
  -H "Content-Type: application/json" \
  -d '{
    "tipoContacto": "CELULAR",
    "valor": "+5493512345678",
    "principal": true
  }'

# Listar contactos
curl http://localhost:8000/api/personas/1/contactos
```

---

## 🔧 CONFIGURACIÓN DE PRISMA

Después de ejecutar la migración, asegurarse de regenerar el Prisma Client:

```bash
npx prisma generate
```

Si hay problemas con tipos TypeScript, ejecutar:

```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Regenerar Prisma Client
npx prisma generate
```

---

## 📊 ENDPOINTS DISPONIBLES EN V2

### Personas (CRUD Base)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/personas` | Crear persona con tipos y contactos |
| GET | `/api/personas` | Listar personas (filtros: tipos, categorías, search) |
| GET | `/api/personas/:id` | Obtener persona por ID |
| PUT | `/api/personas/:id` | Actualizar datos base |
| DELETE | `/api/personas/:id` | Eliminar persona (soft/hard) |
| GET | `/api/personas/search?q=...` | Buscar personas |
| GET | `/api/personas/socios` | Listar socios |
| GET | `/api/personas/docentes` | Listar docentes |
| GET | `/api/personas/proveedores` | Listar proveedores |
| GET | `/api/personas/dni/:dni/check` | Verificar existencia de DNI |
| POST | `/api/personas/:id/reactivate` | Reactivar persona inactiva |
| GET | `/api/personas/:id/estado` | Obtener estado (activo/inactivo) |

### Gestión de Tipos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/personas/:personaId/tipos` | Asignar tipo a persona |
| GET | `/api/personas/:personaId/tipos` | Listar tipos de persona |
| PUT | `/api/personas/:personaId/tipos/:tipoId` | Actualizar datos de tipo |
| DELETE | `/api/personas/:personaId/tipos/:tipoPersonaId` | Desasignar tipo (soft) |
| DELETE | `/api/personas/:personaId/tipos/:tipoPersonaId/hard` | Eliminar tipo (hard) |

### Gestión de Contactos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/personas/:personaId/contactos` | Agregar contacto |
| GET | `/api/personas/:personaId/contactos` | Listar contactos |
| PUT | `/api/personas/:personaId/contactos/:contactoId` | Actualizar contacto |
| DELETE | `/api/personas/:personaId/contactos/:contactoId` | Eliminar contacto |

### Catálogos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/catalogos/tipos-persona` | Listar tipos de persona |
| GET | `/api/catalogos/tipos-persona/:codigo` | Obtener tipo por código |
| GET | `/api/catalogos/especialidades-docentes` | Listar especialidades |
| GET | `/api/catalogos/especialidades-docentes/:codigo` | Obtener especialidad por código |

---

## 🔙 ROLLBACK (En caso de problemas)

Si hay problemas críticos, ejecutar el rollback:

```bash
cd scripts/persona-multiples-tipos
./ejecutar-rollback.sh
```

Luego:

1. Revertir archivos de código:
```bash
git checkout HEAD -- src/dto/persona.dto.ts
git checkout HEAD -- src/repositories/persona.repository.ts
git checkout HEAD -- src/services/persona.service.ts
git checkout HEAD -- src/controllers/persona.controller.ts
git checkout HEAD -- src/routes/persona.routes.ts
```

2. Regenerar Prisma Client:
```bash
npx prisma generate
```

3. Reiniciar servidor:
```bash
npm run dev
```

---

## 📞 SOPORTE

En caso de problemas:

1. Revisar logs del servidor
2. Verificar que la migración se ejecutó correctamente: `scripts/persona-multiples-tipos/02-validar-migracion.sql`
3. Consultar `IMPLEMENTACION_PERSONA_MULTIPLES_TIPOS.md` para más detalles
4. Revisar el plan original en `PLAN_PERSONA_MULTIPLES_TIPOS.md`

---

**Última actualización:** 2025-10-27
