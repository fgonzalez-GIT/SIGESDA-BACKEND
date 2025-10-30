# Implementación: API Endpoint POST /api/personas con Array de Tipos

## Fecha: 2025-10-29

## Objetivo
Preparar el endpoint `POST /api/personas` para recibir un array de tipos de persona en lugar de un solo tipo.

## Cambios Realizados

### 1. Actualización del DTO (src/dto/persona.dto.ts)

Se modificó el `createPersonaSchema` para aceptar el campo `tipo` como:
- **Array de strings**: `["NO_SOCIO"]`, `["SOCIO", "DOCENTE"]`, etc.
- **String simple**: `"NO_SOCIO"` (retrocompatibilidad)

**Implementación:**
```typescript
// Si 'tipo' es un array, procesar el primer elemento
if (data && Array.isArray(data.tipo)) {
  if (data.tipo.length === 0) {
    return { ...data, tipo: TipoPersona.NO_SOCIO };
  }
  // Tomar el primer tipo del array
  return { ...data, tipo: data.tipo[0].toUpperCase() };
}
```

### 2. Actualización del Repositorio (src/repositories/persona.repository.ts)

Se agregaron las siguientes mejoras:
- **Generación automática de UUID** para el campo `id`
- **Conversión de categoriaId** de number a string para compatibilidad con el schema actual

```typescript
import { v4 as uuidv4 } from 'uuid';

async create(data: CreatePersonaDto): Promise<Persona> {
  const { categoriaId, ...rest } = data as any;

  return this.prisma.persona.create({
    data: {
      id: uuidv4(),
      ...rest,
      categoriaId: categoriaId ? String(categoriaId) : null,
      // ... resto de campos
    }
  });
}
```

### 3. Instalación de Dependencias

Se instalaron los siguientes paquetes:
```bash
npm install uuid
npm install --save-dev @types/uuid
```

## Funcionalidad Actual

### ✅ Casos de Uso Soportados

1. **Crear persona con un tipo en array:**
```json
{
  "tipo": ["NO_SOCIO"],
  "nombre": "María",
  "apellido": "González",
  "dni": "99999994",
  "email": "maria@example.com"
}
```

2. **Crear persona DOCENTE:**
```json
{
  "tipo": ["DOCENTE"],
  "nombre": "Carlos",
  "apellido": "López",
  "dni": "99999996",
  "email": "carlos@example.com",
  "especialidad": "Piano"
}
```

3. **Crear persona PROVEEDOR:**
```json
{
  "tipo": ["PROVEEDOR"],
  "nombre": "Roberto",
  "apellido": "Fernández",
  "dni": "99999997",
  "email": "roberto@example.com",
  "cuit": "20999999979",
  "razonSocial": "Fernández SA"
}
```

### ⚠️ Limitaciones Actuales

1. **Solo procesa el primer tipo del array**:
   - Si se envía `["SOCIO", "DOCENTE"]`, solo se crea con tipo "SOCIO"
   - El sistema actual (`persona.dto.ts` y `persona.repository.ts`) no soporta múltiples tipos simultáneos

2. **Para soporte completo de múltiples tipos**:
   - Usar los archivos `.new` (persona.dto.new.ts, persona.service.new.ts, etc.)
   - Estos archivos tienen la arquitectura completa para manejar personas con múltiples tipos

3. **Dependencias entre tipos y campos**:
   - SOCIO requiere `categoriaId` (actualmente como string en BD)
   - DOCENTE requiere `especialidad`
   - PROVEEDOR requiere `cuit` y `razonSocial`

## Pruebas Realizadas

### Casos exitosos:
✅ Crear persona con tipo NO_SOCIO en array
✅ Crear persona con tipo DOCENTE en array
✅ Crear persona con tipo PROVEEDOR en array

### Archivo de pruebas:
`tests/personas-tipos-array.http` - Contiene 15 casos de prueba diferentes

## Arquitectura del Sistema

### Sistema Actual (Legacy)
- **Modelo**: Una persona tiene UN tipo
- **Archivos**: `persona.dto.ts`, `persona.repository.ts`, `persona.service.ts`
- **Limitación**: Solo soporta un tipo por persona

### Sistema Nuevo (V2)
- **Modelo**: Una persona puede tener MÚLTIPLES tipos simultáneos
- **Archivos**: `persona.dto.new.ts`, `persona.repository.new.ts`, `persona.service.new.ts`
- **Ventaja**: Soporta múltiples tipos con tabla intermedia `personas_tipos`

## Tareas Pendientes

### Para Soporte Completo de Múltiples Tipos:
1. Migrar completamente a la arquitectura V2 (archivos `.new`)
2. Actualizar las rutas para usar los nuevos controladores
3. Migrar datos existentes al nuevo modelo

### Para Migración de IDs:
1. Cambiar TODOS los IDs del sistema de String a Int autoincremental
2. Esto incluye:
   - Personas
   - Categorías de Socios
   - Actividades
   - Recibos
   - Y todas las tablas relacionadas
3. Esta será una tarea separada y requiere:
   - Crear migraciones de Prisma
   - Actualizar todos los repositorios
   - Probar exhaustivamente

## Notas Técnicas

- **UUID v4** se usa para generar IDs únicos como strings
- **Zod** se usa para validación del DTO con `z.preprocess`
- **Prisma** maneja las operaciones de base de datos
- Los errores de TypeScript en otros módulos no afectan esta funcionalidad

## Conclusión

El endpoint `POST /api/personas` ahora acepta correctamente el formato con array de tipos:
```json
{
  "tipo": ["NO_SOCIO", "SOCIO", "DOCENTE", "PROVEEDOR"],
  ...
}
```

Sin embargo, **actualmente solo procesa el primer elemento del array** debido a las limitaciones del modelo legacy. Para soporte completo de múltiples tipos simultáneos, se debe migrar a la arquitectura V2.
