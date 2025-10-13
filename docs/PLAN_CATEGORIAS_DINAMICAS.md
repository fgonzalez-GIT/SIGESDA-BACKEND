# Plan de Implementación: Categorías de Socios Dinámicas

## Objetivo

Convertir el enum `CategoriaSocio` en una tabla/modelo independiente para permitir que el Administrador pueda crear, modificar y eliminar categorías de socios de forma dinámica.

## Análisis de Impacto

### Archivos Afectados (17 archivos identificados)

#### Schema y Base de Datos
- `prisma/schema.prisma` - Definición del enum y referencias
- `prisma/migrations/` - Nueva migración requerida
- `prisma/seed.ts` - Scripts de seeding

#### DTOs y Validaciones
- `src/dto/persona.dto.ts` - Validaciones de categoría en personas
- `src/dto/cuota.dto.ts` - Validaciones de categoría en cuotas
- `src/utils/validators.ts` - Esquemas de validación
- `src/types/enums.ts` - Re-exportación de enums

#### Repositorios
- `src/repositories/persona.repository.ts` - Queries de personas
- `src/repositories/cuota.repository.ts` - Queries de cuotas (usa CategoriaSocio extensivamente)

#### Servicios
- `src/services/persona.service.ts` - Lógica de negocio de personas
- `src/services/cuota.service.ts` - Cálculo de cuotas por categoría

#### Controladores
- `src/controllers/persona.controller.ts` - Endpoints de personas
- `src/controllers/cuota.controller.ts` - Endpoints de cuotas

---

## Fase 1: Diseño del Nuevo Modelo

### 1.1 Modelo `CategoriaSocio` (Tabla)

```prisma
model CategoriaSocio {
  id            String   @id @default(cuid())
  codigo        String   @unique // "ACTIVO", "ESTUDIANTE", etc.
  nombre        String   @unique // "Socio Activo", "Estudiante"
  descripcion   String?
  montoCuota    Decimal  @default(0) @db.Decimal(10, 2)
  descuento     Decimal  @default(0) @db.Decimal(5, 2) // Porcentaje
  activa        Boolean  @default(true)
  orden         Int      @default(0) // Para ordenar en UI

  // Campos de auditoría
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relaciones
  personas      Persona[]
  cuotas        Cuota[]

  @@map("categorias_socios")
}
```

### 1.2 Modificaciones en `Persona`

**Antes:**
```prisma
categoria    CategoriaSocio?
```

**Después:**
```prisma
categoriaId  String?
categoria    CategoriaSocio? @relation(fields: [categoriaId], references: [id])
```

### 1.3 Modificaciones en `Cuota`

**Antes:**
```prisma
categoria    CategoriaSocio
```

**Después:**
```prisma
categoriaId  String
categoria    CategoriaSocio @relation(fields: [categoriaId], references: [id])
```

---

## Fase 2: Migración de Datos

### 2.1 Script de Migración SQL

```sql
-- Paso 1: Crear tabla de categorías
CREATE TABLE "categorias_socios" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "codigo" TEXT NOT NULL UNIQUE,
  "nombre" TEXT NOT NULL UNIQUE,
  "descripcion" TEXT,
  "montoCuota" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "descuento" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "activa" BOOLEAN NOT NULL DEFAULT true,
  "orden" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Paso 2: Insertar categorías existentes
INSERT INTO "categorias_socios" (id, codigo, nombre, descripcion, montoCuota, descuento, orden)
VALUES
  (gen_random_uuid(), 'ACTIVO', 'Socio Activo', 'Socio activo con todos los beneficios', 25000, 0, 1),
  (gen_random_uuid(), 'ESTUDIANTE', 'Estudiante', 'Categoría para estudiantes con descuento', 15000, 40, 2),
  (gen_random_uuid(), 'FAMILIAR', 'Familiar', 'Categoría para familiares de socios', 12000, 0, 3),
  (gen_random_uuid(), 'JUBILADO', 'Jubilado', 'Categoría para jubilados con descuento', 18000, 25, 4);

-- Paso 3: Agregar columna categoriaId a Persona (nullable temporalmente)
ALTER TABLE "personas" ADD COLUMN "categoriaId" TEXT;

-- Paso 4: Migrar datos de enum a FK (usando código del enum)
UPDATE "personas" p
SET "categoriaId" = cs.id
FROM "categorias_socios" cs
WHERE p.categoria::text = cs.codigo
AND p.tipo = 'SOCIO';

-- Paso 5: Agregar columna categoriaId a Cuota (nullable temporalmente)
ALTER TABLE "cuotas" ADD COLUMN "categoriaId" TEXT;

-- Paso 6: Migrar datos de cuotas
UPDATE "cuotas" c
SET "categoriaId" = cs.id
FROM "categorias_socios" cs
WHERE c.categoria::text = cs.codigo;

-- Paso 7: Crear constraints y FKs
ALTER TABLE "personas"
  ADD CONSTRAINT "personas_categoriaId_fkey"
  FOREIGN KEY ("categoriaId")
  REFERENCES "categorias_socios"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "cuotas"
  ADD CONSTRAINT "cuotas_categoriaId_fkey"
  FOREIGN KEY ("categoriaId")
  REFERENCES "categorias_socios"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- Paso 8: Hacer NOT NULL donde corresponda
ALTER TABLE "cuotas" ALTER COLUMN "categoriaId" SET NOT NULL;

-- Paso 9: Eliminar columnas antiguas del enum
-- NOTA: Este paso se ejecuta DESPUÉS de actualizar el código
-- ALTER TABLE "personas" DROP COLUMN "categoria";
-- ALTER TABLE "cuotas" DROP COLUMN "categoria";

-- Paso 10: Eliminar el enum (después de actualizar código)
-- DROP TYPE "CategoriaSocio";
```

### 2.2 Estrategia de Migración Segura

**Opción A: Migración en 2 Fases (Recomendada)**

1. **Fase 2.1**: Crear tabla y agregar FK (mantener enum)
   - Crear tabla `categorias_socios`
   - Agregar columnas `categoriaId` en `personas` y `cuotas`
   - Migrar datos
   - Actualizar código para usar `categoriaId`
   - Desplegar y probar

2. **Fase 2.2**: Eliminar enum (posterior)
   - Eliminar referencias al enum en código
   - Drop columnas antiguas
   - Drop enum

**Opción B: Migración Directa (Más rápida pero riesgosa)**

1. Ejecutar todos los pasos en una sola migración
2. Requiere downtime de la aplicación

---

## Fase 3: Actualización de Código

### 3.1 Repositorios

#### Nuevo: `src/repositories/categoria-socio.repository.ts`

```typescript
import { PrismaClient, CategoriaSocio } from '@prisma/client';

export class CategoriaSocioRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(includeInactive = false) {
    return this.prisma.categoriaSocio.findMany({
      where: includeInactive ? {} : { activa: true },
      orderBy: { orden: 'asc' }
    });
  }

  async findById(id: string) {
    return this.prisma.categoriaSocio.findUnique({
      where: { id }
    });
  }

  async findByCodigo(codigo: string) {
    return this.prisma.categoriaSocio.findUnique({
      where: { codigo }
    });
  }

  async create(data: CreateCategoriaSocioDto) {
    return this.prisma.categoriaSocio.create({ data });
  }

  async update(id: string, data: UpdateCategoriaSocioDto) {
    return this.prisma.categoriaSocio.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    // Verificar que no haya personas o cuotas asociadas
    const count = await this.prisma.persona.count({
      where: { categoriaId: id }
    });

    if (count > 0) {
      throw new Error('No se puede eliminar una categoría con socios asociados');
    }

    return this.prisma.categoriaSocio.delete({
      where: { id }
    });
  }
}
```

#### Modificar: `src/repositories/persona.repository.ts`

```typescript
// Cambiar:
where: { categoria: CategoriaSocio.ACTIVO }

// Por:
where: {
  categoria: {
    codigo: 'ACTIVO'
  }
}

// O mejor aún:
where: { categoriaId: categoriaId }
```

#### Modificar: `src/repositories/cuota.repository.ts`

```typescript
// En getMontoBasePorCategoria
async getMontoBasePorCategoria(categoriaId: string): Promise<number> {
  const categoria = await this.prisma.categoriaSocio.findUnique({
    where: { id: categoriaId }
  });

  if (!categoria) {
    throw new Error(`Categoría no encontrada: ${categoriaId}`);
  }

  return parseFloat(categoria.montoCuota.toString());
}
```

### 3.2 DTOs

#### Nuevo: `src/dto/categoria-socio.dto.ts`

```typescript
import { z } from 'zod';

export const createCategoriaSocioSchema = z.object({
  codigo: z.string()
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(30, 'El código no puede exceder 30 caracteres')
    .regex(/^[A-Z_]+$/, 'El código solo puede contener mayúsculas y guiones bajos'),
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  descripcion: z.string()
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .optional(),
  montoCuota: z.number()
    .min(0, 'El monto debe ser mayor o igual a 0')
    .max(1000000, 'El monto no puede exceder $1,000,000'),
  descuento: z.number()
    .min(0, 'El descuento no puede ser negativo')
    .max(100, 'El descuento no puede exceder 100%')
    .default(0),
  activa: z.boolean().default(true),
  orden: z.number().int().min(0).default(0)
});

export const updateCategoriaSocioSchema = createCategoriaSocioSchema.partial();

export type CreateCategoriaSocioDto = z.infer<typeof createCategoriaSocioSchema>;
export type UpdateCategoriaSocioDto = z.infer<typeof updateCategoriaSocioSchema>;
```

#### Modificar: `src/dto/persona.dto.ts`

```typescript
// Cambiar:
categoria: z.nativeEnum(CategoriaSocio)

// Por:
categoriaId: z.string().cuid('ID de categoría inválido')
```

#### Modificar: `src/dto/cuota.dto.ts`

```typescript
// Cambiar:
categoria: z.nativeEnum(CategoriaSocio)

// Por:
categoriaId: z.string().cuid('ID de categoría inválido')
```

### 3.3 Servicios

#### Nuevo: `src/services/categoria-socio.service.ts`

```typescript
export class CategoriaSocioService {
  constructor(
    private categoriaSocioRepository: CategoriaSocioRepository
  ) {}

  async getCategorias(includeInactive = false) {
    return this.categoriaSocioRepository.findAll(includeInactive);
  }

  async getCategoriaById(id: string) {
    const categoria = await this.categoriaSocioRepository.findById(id);
    if (!categoria) {
      throw new Error(`Categoría con ID ${id} no encontrada`);
    }
    return categoria;
  }

  async createCategoria(data: CreateCategoriaSocioDto) {
    // Validar que el código no exista
    const existingCodigo = await this.categoriaSocioRepository.findByCodigo(data.codigo);
    if (existingCodigo) {
      throw new Error(`Ya existe una categoría con el código ${data.codigo}`);
    }

    return this.categoriaSocioRepository.create(data);
  }

  async updateCategoria(id: string, data: UpdateCategoriaSocioDto) {
    // Verificar que existe
    await this.getCategoriaById(id);

    // Si se cambia el código, validar que no exista
    if (data.codigo) {
      const existing = await this.categoriaSocioRepository.findByCodigo(data.codigo);
      if (existing && existing.id !== id) {
        throw new Error(`Ya existe una categoría con el código ${data.codigo}`);
      }
    }

    return this.categoriaSocioRepository.update(id, data);
  }

  async deleteCategoria(id: string) {
    // Verificar que existe
    await this.getCategoriaById(id);

    // El repository ya valida que no tenga socios asociados
    return this.categoriaSocioRepository.delete(id);
  }
}
```

#### Modificar: `src/services/cuota.service.ts`

```typescript
// En calcularDescuentos
private async calcularDescuentos(categoriaId: string, montoBase: number): Promise<{...}> {
  const categoria = await this.categoriaSocioRepository.findById(categoriaId);

  if (!categoria) {
    throw new Error(`Categoría no encontrada: ${categoriaId}`);
  }

  const descuentos: any[] = [];
  let total = 0;

  // Aplicar descuento configurado en la categoría
  if (categoria.descuento > 0) {
    const descuento = montoBase * (categoria.descuento / 100);
    descuentos.push({
      tipo: `Descuento ${categoria.nombre}`,
      porcentaje: categoria.descuento,
      monto: descuento
    });
    total += descuento;
  }

  return { total, detalle: descuentos };
}
```

### 3.4 Controladores

#### Nuevo: `src/controllers/categoria-socio.controller.ts`

```typescript
import { Request, Response } from 'express';
import { CategoriaSocioService } from '@/services/categoria-socio.service';
import { createCategoriaSocioSchema, updateCategoriaSocioSchema } from '@/dto/categoria-socio.dto';

export class CategoriaSocioController {
  constructor(private service: CategoriaSocioService) {}

  async getCategorias(req: Request, res: Response) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categorias = await this.service.getCategorias(includeInactive);
      res.json(categorias);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCategoriaById(req: Request, res: Response) {
    try {
      const categoria = await this.service.getCategoriaById(req.params.id);
      res.json(categoria);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async createCategoria(req: Request, res: Response) {
    try {
      const validated = createCategoriaSocioSchema.parse(req.body);
      const categoria = await this.service.createCategoria(validated);
      res.status(201).json(categoria);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateCategoria(req: Request, res: Response) {
    try {
      const validated = updateCategoriaSocioSchema.parse(req.body);
      const categoria = await this.service.updateCategoria(req.params.id, validated);
      res.json(categoria);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCategoria(req: Request, res: Response) {
    try {
      await this.service.deleteCategoria(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
```

#### Nuevo: `src/routes/categoria-socio.routes.ts`

```typescript
import { Router } from 'express';
import { CategoriaSocioController } from '@/controllers/categoria-socio.controller';

export const categoriaSocioRouter = Router();

// GET /api/categorias-socios
categoriaSocioRouter.get('/', (req, res) => controller.getCategorias(req, res));

// GET /api/categorias-socios/:id
categoriaSocioRouter.get('/:id', (req, res) => controller.getCategoriaById(req, res));

// POST /api/categorias-socios
categoriaSocioRouter.post('/', (req, res) => controller.createCategoria(req, res));

// PUT /api/categorias-socios/:id
categoriaSocioRouter.put('/:id', (req, res) => controller.updateCategoria(req, res));

// DELETE /api/categorias-socios/:id
categoriaSocioRouter.delete('/:id', (req, res) => controller.deleteCategoria(req, res));
```

---

## Fase 4: Testing

### 4.1 Tests Unitarios

```typescript
describe('CategoriaSocioService', () => {
  it('debe crear una nueva categoría', async () => {
    const data = {
      codigo: 'VIP',
      nombre: 'Socio VIP',
      montoCuota: 50000,
      descuento: 0
    };

    const result = await service.createCategoria(data);
    expect(result.codigo).toBe('VIP');
  });

  it('no debe permitir códigos duplicados', async () => {
    await expect(
      service.createCategoria({ codigo: 'ACTIVO', ... })
    ).rejects.toThrow('Ya existe una categoría');
  });

  it('no debe eliminar categorías con socios asociados', async () => {
    await expect(
      service.deleteCategoria(categoriaConSocios.id)
    ).rejects.toThrow('No se puede eliminar');
  });
});
```

### 4.2 Tests de Integración

```typescript
describe('GET /api/categorias-socios', () => {
  it('debe listar todas las categorías activas', async () => {
    const response = await request(app).get('/api/categorias-socios');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(4);
  });
});

describe('POST /api/categorias-socios', () => {
  it('debe crear una nueva categoría', async () => {
    const response = await request(app)
      .post('/api/categorias-socios')
      .send({
        codigo: 'VIP',
        nombre: 'Socio VIP',
        montoCuota: 50000
      });

    expect(response.status).toBe(201);
    expect(response.body.codigo).toBe('VIP');
  });
});
```

---

## Fase 5: Documentación y Deployment

### 5.1 Actualizar Documentación

- [ ] Actualizar README con nuevos endpoints
- [ ] Documentar proceso de creación de categorías
- [ ] Crear guía para migración de datos existentes
- [ ] Actualizar ejemplos de API

### 5.2 Plan de Deployment

1. **Pre-deployment**
   - Backup completo de base de datos
   - Notificar a usuarios del mantenimiento
   - Preparar rollback plan

2. **Deployment**
   - Ejecutar migración de base de datos
   - Desplegar nuevo código
   - Verificar migración de datos

3. **Post-deployment**
   - Verificar endpoints nuevos
   - Probar creación de categorías
   - Verificar que cuotas se generen correctamente
   - Monitorear logs por errores

---

## Riesgos y Mitigaciones

### Riesgos Identificados

1. **Pérdida de datos durante migración**
   - Mitigación: Backup completo antes de migrar
   - Mitigación: Migración en 2 fases con rollback

2. **Queries lentas por nuevos JOINs**
   - Mitigación: Crear índices apropiados
   - Mitigación: Usar includes selectivos en Prisma

3. **Validaciones de frontend rotas**
   - Mitigación: Actualizar frontend para usar IDs en lugar de enums
   - Mitigación: Crear endpoint para obtener categorías disponibles

4. **Integridad referencial**
   - Mitigación: ON DELETE RESTRICT para cuotas
   - Mitigación: ON DELETE SET NULL para personas

---

## Cronograma Estimado

| Fase | Descripción | Tiempo Estimado |
|------|-------------|----------------|
| 1 | Diseño del modelo | 1 hora |
| 2 | Migración de base de datos | 2 horas |
| 3 | Actualización de código backend | 4 horas |
| 4 | Testing | 2 horas |
| 5 | Documentación y deployment | 1 hora |
| **Total** | | **10 horas** |

---

## Checklist de Implementación

### Base de Datos
- [ ] Crear modelo `CategoriaSocio` en schema
- [ ] Generar migración Prisma
- [ ] Ejecutar migración en desarrollo
- [ ] Verificar migración de datos
- [ ] Crear índices necesarios

### Backend
- [ ] Crear `categoria-socio.repository.ts`
- [ ] Crear `categoria-socio.service.ts`
- [ ] Crear `categoria-socio.controller.ts`
- [ ] Crear `categoria-socio.dto.ts`
- [ ] Crear rutas de categorías
- [ ] Actualizar `persona.repository.ts`
- [ ] Actualizar `cuota.repository.ts`
- [ ] Actualizar `persona.service.ts`
- [ ] Actualizar `cuota.service.ts`
- [ ] Actualizar DTOs de persona y cuota
- [ ] Actualizar validadores

### Testing
- [ ] Tests unitarios de servicio
- [ ] Tests de integración de API
- [ ] Tests de migración de datos
- [ ] Pruebas manuales end-to-end

### Documentación
- [ ] Actualizar README
- [ ] Documentar endpoints nuevos
- [ ] Crear guía de migración
- [ ] Actualizar ejemplos de API

### Deployment
- [ ] Backup de base de datos
- [ ] Ejecutar migración en producción
- [ ] Desplegar código
- [ ] Verificar funcionamiento
- [ ] Monitorear errores

---

## Notas Adicionales

### Consideraciones de Performance

1. **Índices Recomendados**:
   ```sql
   CREATE INDEX idx_categorias_socios_codigo ON categorias_socios(codigo);
   CREATE INDEX idx_categorias_socios_activa ON categorias_socios(activa);
   CREATE INDEX idx_personas_categoriaId ON personas(categoriaId);
   CREATE INDEX idx_cuotas_categoriaId ON cuotas(categoriaId);
   ```

2. **Caching**:
   - Considerar cachear lista de categorías activas
   - Cache invalidation al crear/modificar categorías

### Extensiones Futuras

1. **Permisos por Categoría**: Agregar tabla de permisos asociados a categorías
2. **Historial de Cambios**: Tabla de auditoría para cambios en categorías
3. **Subcategorías**: Soporte para jerarquía de categorías
4. **Reglas de Negocio**: Motor de reglas para cálculo dinámico de cuotas
