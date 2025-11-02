# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- ✅ Check capacity before enrollment: `current_participants < cupo_maximo`
- ✅ Prevent duplicate active relationships before creation
- ✅ Ensure at least one active type per person (no orphan persons)
- ✅ Validate parentesco logic (age consistency warnings)

**Referential Integrity Checks**:
- ✅ Verify related entities exist before creating relationships
- ✅ Check entity is active/not deleted before operations
- ✅ Validate unique constraints before database insertion

## Business Domain Rules

### Personas (Multi-Type Architecture V2)
- **Core Table**: `personas` (demographic data)
- **Relationship Table**: `persona_tipo` (many-to-many)
- **Catalog**: `tipo_persona_catalogo` (SOCIO, NO_SOCIO, DOCENTE, PROVEEDOR)
- **Rules**:
  - One person can have multiple types simultaneously
  - Each type has specific fields (stored in `persona_tipo`)
  - Auto-assign `numeroSocio` if not provided (next available)
  - Auto-assign default `categoria` for SOCIO (ID=1)
  - Auto-assign default `especialidad` for DOCENTE (ID=1)
  - Cannot remove the only active type from a person

### Relaciones Familiares
- **Table**: `familiares` (bidirectional relationships)
- **Enum**: `TipoParentesco` (16 relationship types)
- **Rules**:
  - Unique constraint: one relationship per person pair
  - Includes permissions: financial, emergency contact, authorized pickup
  - Supports family discounts (0-100%)
  - Age validation (warning only, non-blocking)
  - Optional family group ID for bulk operations

### Actividades
- **Tables**: `actividades`, `horarios_actividades`
- **Catalogs**: `tipos_actividades`, `categorias_actividades`, `estados_actividades`
- **Rules**:
  - Multiple schedules per activity
  - Unique constraint prevents duplicate time slots
  - Capacity validation before enrollment
  - Date range for activity validity
  - Soft delete for schedules (activo field)

### Inscripciones (Participaciones)
- **Table**: `participaciones_actividades`
- **Rules**:
  - Unique constraint: one enrollment per person-activity
  - Check capacity before allowing enrollment
  - Soft delete (activa + fecha_fin)
  - Optional special pricing per participant

## Known Issues & Limitations

### 🔴 CRITICAL: Missing Table `docentes_actividades`
- **Problem**: Code references `docentes_actividades` table that doesn't exist in schema.prisma
- **Impact**: Teacher assignment to activities DOES NOT WORK
- **Location**: `src/repositories/actividad.repository.ts:513-605`
- **Status**: Requires schema fix (add explicit many-to-many table with role support)

### 🟡 Missing: Bidirectional Family Sync
- **Problem**: Creating `PADRE → HIJO` doesn't auto-create inverse `HIJO → PADRE`
- **Impact**: Inconsistent family trees
- **Recommendation**: Implement service-layer logic or database trigger

### 🟡 Missing: Enrollment Capacity Validation
- **Problem**: `addParticipante` doesn't check capacity before insert
- **Impact**: Can exceed `cupo_maximo`
- **Recommendation**: Add validation in service layer

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
