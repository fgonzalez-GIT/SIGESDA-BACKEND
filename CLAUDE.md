# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**IMPORTANT**: This file must remain a **concise summary and configuration guide**. It should NOT become an extensive detailed document. Keep entries brief, focused on rules, guidelines, and quick reference information.

## Project Overview

**SIGESDA Backend** - Sistema de Gestión de Asociación Musical. Backend API REST para gestión integral de conservatorio/asociación musical, incluyendo socios, actividades, docentes, cuotas, recibos, aulas y relaciones familiares.

## Technology Stack

### Core Technologies
- **Runtime**: Node.js (v20+)
- **Language**: TypeScript 5.3.3 (strict mode enabled)
- **Framework**: Express 4.21.1
- **Database**: PostgreSQL 16+
- **ORM**: Prisma 5.6.0
- **Validation**: Zod 3.22.4

### Key Dependencies
- **Security**: Helmet, CORS
- **Environment**: dotenv 16.4.5
- **Utilities**: uuid, decimal.js
- **Logging**: Custom logger (winston-style)

### Development Tools
- **Hot Reload**: ts-node-dev (respawn mode)
- **Compilation**: TypeScript Compiler (tsc)
- **Path Aliases**: tsconfig-paths (supports @/* imports)
- **Database Tools**: Prisma Studio, Prisma Migrate

## Development Commands

### Server Management
- **Start development server**: `npm run dev` (auto-restart on file changes)
- **Start production server**: `npm start` (requires `npm run build` first)
- **Build for production**: `npm run build` (compiles to ./dist)

### Database Management
- **Generate Prisma Client**: `npm run db:generate`
- **Run migrations**: `npm run db:migrate`
- **Seed database**: `npm run db:seed`
- **Open Prisma Studio**: `npm run db:studio` (GUI for database)
- **Check DB connection**: `npm run db:check`

### Other
- **Install dependencies**: `npm install`

## Project Architecture

### Directory Structure
```
src/
├── server.ts              # Entry point (server startup, graceful shutdown)
├── app.ts                 # Express app configuration (middleware, routes)
├── config/
│   ├── database.ts        # Prisma singleton, connection management
│   └── env.ts             # Environment variables validation
├── routes/
│   ├── index.ts           # Main router (mounts all sub-routes)
│   ├── persona.routes.ts  # Personas/Socios/Docentes endpoints
│   ├── actividad.routes.ts
│   ├── familiar.routes.ts
│   └── ...                # Other domain routes
├── controllers/           # Request handlers
├── services/              # Business logic layer
├── repositories/          # Database access layer (Prisma)
├── dto/                   # Data Transfer Objects (Zod schemas)
├── middleware/
│   ├── error.middleware.ts      # Global error handler
│   └── validation.middleware.ts # Request validation
├── utils/
│   ├── logger.ts          # Custom logging utility
│   └── validators.ts      # Common validation helpers
└── types/
    ├── enums.ts           # TypeScript enums
    └── interfaces.ts      # Common interfaces
```

### Architectural Pattern
**Layered Architecture (Repository Pattern):**
1. **Routes** → Define HTTP endpoints
2. **Controllers** → Handle HTTP requests/responses
3. **Services** → Implement business logic and validations
4. **Repositories** → Database operations (Prisma)
5. **DTOs** → Request/Response validation (Zod)

### Main Entry Point
- **File**: `src/server.ts`
- **Port**: 3001 (configurable via `.env`)
- **Features**:
  - Graceful shutdown (SIGTERM, SIGINT)
  - Unhandled rejection/exception handlers
  - Database connection on startup

### API Structure
**Base URL**: `http://localhost:3001/api`

**Main Endpoints**:
- `GET /health` - Health check (includes DB status)
- `GET /` - API info and documentation
- `POST /api/personas` - Create person
- `GET /api/actividades` - List activities
- `POST /api/familiares` - Create family relationship
- `POST /api/recibos` - Create receipt
- `GET /api/cuotas` - List membership fees
- ... (see `src/routes/index.ts` for complete list)

### Database Configuration

**Database**: PostgreSQL (NOT MongoDB - previous documentation was incorrect)
- **Connection**: Via Prisma ORM
- **Schema**: Declarative schema in `prisma/schema.prisma`
- **Connection String**: Stored in `.env` as `DATABASE_URL`
- **Example**: `postgresql://user:pass@localhost:5432/sigesda?schema=public`

**Database Service**:
- Singleton pattern for PrismaClient
- Auto-reconnect on disconnection
- Health check via `$queryRaw`
- Graceful disconnect on shutdown

### Environment Variables

Required variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging verbosity
- `DEFAULT_PAGE_SIZE` - Pagination default
- `MAX_PAGE_SIZE` - Pagination max limit

### Middleware Configuration

**Global Middleware** (in order):
1. **Helmet** - Security headers
2. **CORS** - Cross-origin requests (allow all in dev)
3. **Body Parser** - JSON/URLencoded (10mb limit)
4. **Request Logger** - Logs all requests with duration
5. **Routes** - API endpoints
6. **404 Handler** - Not found responses
7. **Error Handler** - Global error catching

### TypeScript Configuration

**Compiler Options**:
- **Target**: ES2020
- **Module**: CommonJS
- **Strict Mode**: Enabled (all strict flags on)
- **Path Aliases**:
  - `@/*` → `src/*`
  - `@/types/*` → `src/types/*`
  - `@/config/*` → `src/config/*`
  - `@/services/*` → `src/services/*`
  - `@/controllers/*` → `src/controllers/*`
- **Decorators**: Enabled (experimental)
- **Source Maps**: Generated

### Testing

- **Status**: No automated tests configured yet
- **Manual Testing**: REST client files in `tests/` directory
- **Recommendation**: Consider adding Jest + Supertest for E2E tests

### Logging

**Custom Logger** (`src/utils/logger.ts`):
- Structured logging (JSON format in production)
- Log levels: error, warn, info, request, debug
- Request logging includes: method, path, status code, duration
- Emojis for visual differentiation in development

### Error Handling

**Strategy**:
- Custom `AppError` class with status codes
- Global error handler middleware
- Validation errors via Zod schemas
- Prisma errors mapped to HTTP status codes
- All errors return standardized JSON:
  ```json
  {
    "success": false,
    "error": "Error message",
    "details": { /* optional */ }
  }
  ```

## Database Schema Rules

### Naming Convention
- ✅ **MANDATORY**: ALWAYS use camelCase for Prisma schema fields and TypeScript code
- **Example**: `capacidadMaxima` (NOT `cupo_maximo`, NOT `capacidad_maxima`)
- **Rationale**: Consistency with Prisma conventions and TypeScript best practices
- **Note**: Use `@map("snake_case")` when PostgreSQL table uses snake_case column names

### Primary Keys
- ✅ **MANDATORY**: All tables MUST use `Int` with `SERIAL` autoincrement for primary keys
- **Format**: `id  Int  @id @default(autoincrement())`
- **Rationale**: Consistent, performant, and compatible with all database operations
- **NO EXCEPTIONS**: UUID, composite keys, or string IDs are NOT allowed

### Foreign Key Constraints
- **CASCADE**: Use `ON DELETE CASCADE` for dependent child records
  - Example: `horarios_actividades` → `actividades`
  - When parent is deleted, children are automatically removed
- **RESTRICT**: Use `ON DELETE RESTRICT` for catalog references
  - Example: `persona_tipo` → `tipo_persona_catalogo`
  - Prevents deletion if records reference this catalog entry
- **SET NULL**: Use `ON DELETE SET NULL` for optional relationships
  - Example: `persona` → `categoria_socio` (when category is nullable)

### Timestamps
- ✅ **MANDATORY**: All tables MUST include `createdAt` and `updatedAt`
- **Format**:
  ```prisma
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  ```
- **Snake Case Mapping** (for PostgreSQL conventions):
  ```prisma
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")
  ```

### Soft Deletes
- **Recommended Pattern**: Use `activo` (Boolean) field for soft delete
- **Optional Enhancement**: Add `fecha_desasignacion` or `fecha_fin` for historical tracking
- **Example**:
  ```prisma
  activo                Boolean    @default(true)
  fechaDesasignacion    DateTime?  @map("fecha_desasignacion")
  ```

### Unique Constraints
- **Purpose**: Prevent duplicate business-critical combinations
- **Format**: `@@unique([field1, field2])`
- **Examples**:
  - `@@unique([personaId, actividadId])` - One enrollment per person-activity
  - `@@unique([socioId, familiarId])` - One relationship per person pair
  - `@@unique([actividadId, diaSemana, horaInicio])` - No duplicate time slots

### Indexes
- **Mandatory**: Create indexes on all foreign keys (Prisma auto-generates)
- **Recommended**: Create indexes on frequently queried fields
  - `codigo` (catalog codes)
  - `activo` (active/inactive filtering)
  - `orden` (sorting catalogs)
  - Date ranges (`fechaInicio`, `fechaFin`)
- **Format**: `@@index([fieldName])`

### Validation Rules (Service Layer)

**Date Validations**:
- ✅ Validate `start_date < end_date`
- ✅ Validate `fechaInicio < fechaFin`
- ✅ Check for logical date order in relationships

**Numeric Range Validations**:
- ✅ Validate `0 <= descuento <= 100`
- ✅ Validate `costo >= 0`
- ✅ Validate `capacidadMaxima > 0`

**Business Logic Validations**:
- ✅ Check capacity before enrollment: `current_participants < capacidadMaxima` (FIXED)
- ✅ Prevent duplicate active relationships before creation
- ✅ Ensure at least one active type per person (no orphan persons)
- ✅ Validate parentesco logic (age consistency warnings)
- ✅ Bidirectional family relationship sync (CREATE/UPDATE/DELETE) (FIXED)

**Referential Integrity Checks**:
- ✅ Verify related entities exist before creating relationships
- ✅ Check entity is active/not deleted before operations
- ✅ Validate unique constraints before database insertion

## Business Domain Rules

### Personas (Multi-Type Architecture V2)
- **Core Table**: `personas` (demographic data)
- **Relationship Table**: `persona_tipo` (many-to-many)
- **Catalog**: `tipo_persona_catalogo` (SOCIO, NO_SOCIO, DOCENTE, PROVEEDOR)
- **Soft Delete**: Campo `activo: Boolean` con `fechaBaja` y `motivoBaja`
  - ✅ Patrón estándar: `WHERE activo = true` para filtrar personas activas
  - ✅ Helper functions: `darDeBajaPersona()`, `reactivarPersona()`, `isPersonaActiva()`
  - ✅ Índice en campo `activo` para queries eficientes
- **Rules**:
  - One person can have multiple types simultaneously
  - ✅ **CRITICAL**: SOCIO and NO_SOCIO are mutually exclusive (cannot coexist)
  - Each type has specific fields (stored in `persona_tipo`)
  - Auto-assign `numeroSocio` if not provided (next available)
  - Auto-assign default `categoria` for SOCIO
  - Auto-assign default `especialidad` for DOCENTE
  - Cannot remove the only active type from a person

### Relaciones Familiares
- **Table**: `familiares`
- **Enum**: `TipoParentesco` (20 types)
- **Helper**: `src/utils/parentesco.helper.ts`
- **Rules**:
  - ✅ Automatic bidirectional sync (CREATE/UPDATE/DELETE)
  - ✅ Complementary parentescos (PADRE↔HIJO, ESPOSA↔ESPOSO, CONYUGE↔CONYUGE, etc.)
  - Unique constraint per person pair
  - Family discounts (0-100%), permissions, group support
  - Works with all person types (SOCIO, NO_SOCIO, DOCENTE, PROVEEDOR)
- **Gender-aware**: Campo `genero` (MASCULINO, FEMENINO, NO_BINARIO, PREFIERO_NO_DECIR) determina parentesco complementario en relaciones asimétricas
- **Validation**: Age warnings (>25 years difference), duplicate prevention
- **Docs**: See `GENERO_IMPLEMENTATION.md` for detailed implementation

### Tipos de Contacto (Catálogo)
- **Tables**: `contacto_persona`, `tipo_contacto_catalogo`
- **Pattern**: Catálogo con FK (ENUM migrado a tabla, 2025-01-05)
- **Rules**:
  - ✅ Validación de formato con regex patterns (email, teléfono, etc.)
  - ✅ Sistema de contacto principal (1 principal por tipo)
  - ✅ Soft delete, prevención de duplicados
- **Tipos predefinidos**: EMAIL, TELEFONO, CELULAR, WHATSAPP, TELEGRAM, OTRO
- **Migration Scripts**: `scripts/migrate-tipos-contacto-to-catalog.sql` (with rollback support)

### Actividades
- **Tables**: `actividades`, `horarios_actividades`, `docentes_actividades`
- **Catalogs**: `tipos_actividades`, `categorias_actividades`, `estados_actividades`, `roles_docentes`
- **Rules**:
  - Multiple schedules per activity
  - ✅ Capacity validation before enrollment
  - ✅ Teacher assignment with role support
  - Unique time slot constraints

### Inscripciones (Participaciones)
- **Table**: `participacion_actividades`
- **Rules**:
  - ✅ Capacity validation before enrollment
  - Unique constraint per person-activity
  - Soft delete (activa + fechaFin)
  - Prevents duplicates

## Recently Fixed Issues ✅

### ✅ FIXED (2025-11-20): Soft Delete Implementation for Personas
- **Files**: `src/repositories/persona.repository.ts`, `src/services/persona.service.ts`
- **Fix**: DELETE endpoint now properly deactivates both `persona_tipo` records AND `persona.activo = false`
- **Helper Functions**: `hasActiveTipo()`, `getActiveTipos()`, `isPersonaActiva()`, `darDeBajaPersona()`, `reactivarPersona()`
- **Validations**: Prevent empty tipos array, ensure at least one active tipo remains
- **Test**: `tests/test-soft-delete-persona.ts`
- **Note**: Pre-deletion validations (`validateCanDelete()`) exist but are commented out (ready for future use)

### ✅ IMPLEMENTED (2025-01-05): Tipos de Contacto - Migración ENUM → Catálogo
- **Change**: Migrated TipoContacto from PostgreSQL ENUM to catalog table
- **Rationale**: Admin UI management, regex pattern validation, consistency with other catalogs
- **Architecture**: Repository, Service, Controller, DTOs (`contacto.dto.ts`)
- **Features**: Pattern validation, duplicate prevention, principal contact system, soft delete
- **Migration Scripts**: `scripts/migrate-tipos-contacto-to-catalog.sql` (with rollback support)
- **Testing**: `tests/migration/test-tipos-contacto-migration.ts`

### ✅ FIXED (2026-01-15): CUOTAS V2 - Critical Bugs in Generation and Motor de Descuentos
- **File**: `src/services/cuota.service.ts`
- **Issues Fixed**:
  1. **Bug #1 - Incorrect field access**: `socio.categoriaSocio?.montoCuota` → `socio.categoria?.montoCuota` (line 607)
  2. **Bug #2 - Concepto object display**: `${socio.categoria}` → `${socio.categoria?.nombre || ...}` (line 613)
  3. **Bug #3 - Motor signature mismatch**: Fixed call to `motorDescuentos.aplicarReglas()` with proper parameters (lines 677-722)
- **Root Causes**:
  - Repository returns field as `categoria` not `categoriaSocio` (`cuota.repository.ts:679`)
  - Motor expects `(cuotaId, personaId, itemsCuota[])` but was called with incorrect object structure
  - Response properties renamed from `.items` to `.itemsDescuento`, `.totalDescuentoAplicado` to `.totalDescuento`
- **Impact**:
  - Before: All cuotas generated with `montoTotal = "0"` and concepto showing "[object Object]"
  - After: Correct amounts (e.g., $5000 for ACTIVO category) and human-readable concepto
  - Motor now successfully applies discount rules (35/58 socios received discounts totaling $45,900 in test)
- **Error Logging**: Improved error logging to show full error message and stack trace (lines 719-723)
- **Testing**: Validated with February-May 2026 generations, verified items breakdown and discount application

### ✅ FIXED (2026-01-15): Missing actividades_aulas Table - Schema Drift
- **Problem**: Prisma Client error "The table `actividades_aulas` does not exist in the current database"
- **Root Cause**: Model defined in `prisma/schema.prisma` but migration was never generated/applied to create the physical table
- **Migration**: Created `20260115000000_add_actividades_aulas_table/migration.sql`
- **Table Structure**:
  - Many-to-many relationship: `actividades` ↔ `aulas`
  - Soft delete pattern (`activa` boolean, `fechaDesasignacion`)
  - Priority system for multiple aula assignments
  - Unique constraint: `(actividad_id, aula_id)`
  - CASCADE delete on parent removal
  - Indexes on: `actividad_id`, `aula_id`, `activa`
- **Impact**:
  - Before: Prisma Studio errors, `/api/actividades` endpoint failures
  - After: Full classroom assignment functionality operational
- **Affected Code**:
  - Repository: `src/repositories/actividad-aula.repository.ts`
  - Service: `src/services/actividad-aula.service.ts`
  - Controller: `src/controllers/actividad-aula.controller.ts`
  - Routes: `/api/actividades-aulas`, `/api/actividades/:id/aulas`, `/api/aulas/:id/actividades`
  - DTOs: `src/dto/actividad-aula.dto.ts` (175 lines)
  - Helper: `src/utils/actividad-aula.helper.ts`
- **Resolution**: Applied migration, regenerated Prisma Client, verified endpoint functionality

### ✅ FIXED (2025-01-02): Four Critical Issues Resolved
1. **docentes_actividades table**: Added missing table + roles_docentes catalog
2. **Capacity validation**: Added validation in `addParticipante()`
3. **Bidirectional family sync**: Auto-sync with `src/utils/parentesco.helper.ts`
4. **Mutually exclusive types**: SOCIO ↔ NO_SOCIO validation with `src/utils/persona.helper.ts`

## Known Issues & Limitations

### 🟡 Pre-existing: Snake_case vs camelCase Naming
- Some repository files have field name inconsistencies (non-blocking TypeScript warnings)
- Out of scope, requires systematic refactor

## Development Notes

- **Port**: Server runs on PORT 3001 by default (configurable)
- **CORS**: Enabled for all origins in development
- **Request Logging**: All requests are logged with duration
- **Error Format**: Standardized JSON responses with `success`, `error`, `data` fields
- **Pagination**: Default page size is 20, max is 100 (configurable)
- **Security**: Helmet middleware for HTTP headers, input validation via Zod


## Future Enhancements (Planned)

- JWT-based authentication
- Email notifications (SMTP configured in .env)
- File upload support (images, documents)
- Swagger/OpenAPI documentation
- Automated testing (Jest + Supertest)
- Audit logs (createdBy, updatedBy tracking)
