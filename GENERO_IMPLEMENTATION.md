# Implementación de Campo Género en Sistema de Personas

**Fecha**: 2025-12-09
**Autor**: Sistema SIGESDA
**Estado**: ✅ Implementación Completa

---

## 📋 Resumen Ejecutivo

Se ha implementado el campo `genero` en el sistema de personas para permitir relaciones familiares asimétricas correctas basadas en género. Esto resuelve el problema de determinar correctamente si una relación padre-hijo debe ser `HIJO` o `HIJA` según el género del hijo.

**Problema Resuelto**:
- ❌ Antes: `PADRE → HIJO` (siempre masculino, incorrecto para hijas)
- ✅ Ahora: `PADRE → HIJO` (si hijo es masculino) o `PADRE → HIJA` (si hija es femenino)

---

## 🎯 Características Implementadas

### 1. **Enum Genero**
- **Valores**: `MASCULINO`, `FEMENINO`, `NO_BINARIO`, `PREFIERO_NO_DECIR`
- **Tipo**: Enum PostgreSQL
- **Ubicación**: `prisma/schema.prisma`

### 2. **Campo genero en Persona**
- **Tipo**: `Genero?` (opcional, nullable)
- **Índice**: Sí (para queries eficientes)
- **Retrocompatibilidad**: Personas existentes tendrán `genero = NULL`

### 3. **Lógica de Parentesco con Género**
- Nueva función: `getParentescoComplementarioConGenero(parentesco, generoDestino)`
- Fallback: Usa forma masculina cuando género es `NULL`, `NO_BINARIO` o `PREFIERO_NO_DECIR`
- Validación: `validateParentescoGenero()` genera warnings (no errores) cuando hay conflicto

### 4. **Sincronización Bidireccional Mejorada**
- Relaciones familiares ahora usan género para calcular parentesco complementario
- Logs informativos incluyen género de ambas personas
- Warnings automáticos si género conflicta con parentesco

---

## 📦 Archivos Modificados

### Base de Datos
- ✅ `prisma/schema.prisma` - Enum `Genero` y campo en modelo `Persona`
- ✅ `prisma/migrations/20251209_add_genero_to_persona/migration.sql` - Migración SQL

### DTOs y Validación
- ✅ `src/dto/persona.dto.ts` - Validación Zod para campo `genero`

### Lógica de Negocio
- ✅ `src/utils/parentesco.helper.ts` - Funciones con género
- ✅ `src/services/familiar.service.ts` - Uso de género en relaciones

### Repositorios
- ✅ `src/repositories/persona.repository.ts` - Ya maneja `genero` automáticamente (spread operator)

### Tests
- ✅ `tests/test-genero-parentesco.ts` - Suite completa de tests

---

## 🚀 Instrucciones de Despliegue

### Paso 1: Aplicar Migración de Base de Datos

**Opción A: Migración automática de Prisma**
```bash
npx prisma migrate deploy
```

**Opción B: Migración manual (si Prisma tiene problemas)**
```bash
PGPASSWORD='SiGesda2024!' psql -h localhost -U sigesda_user -d asociacion_musical -f prisma/migrations/20251209_add_genero_to_persona/migration.sql
```

### Paso 2: Regenerar Prisma Client
```bash
npm run db:generate
```

### Paso 3: Reiniciar Servidor
```bash
# Detener servidor actual
pkill -f "node.*server.ts"

# Iniciar servidor
npm run dev
```

### Paso 4: Ejecutar Tests
```bash
npx ts-node tests/test-genero-parentesco.ts
```

---

## 🧪 Casos de Uso

### Caso 1: Relación Padre-Hijo (Masculino)
```json
// POST /api/personas
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "dni": "12345678",
  "genero": "MASCULINO"
}

// POST /api/personas
{
  "nombre": "Carlos",
  "apellido": "Pérez",
  "dni": "87654321",
  "genero": "MASCULINO"
}

// POST /api/familiares
{
  "socioId": 1,      // Juan
  "familiarId": 2,   // Carlos
  "parentesco": "PADRE"
}

// Resultado: Crea 2 relaciones
// - Juan → PADRE → Carlos
// - Carlos → HIJO → Juan  ✅ (usa HIJO porque Carlos es MASCULINO)
```

### Caso 2: Relación Padre-Hija (Femenino)
```json
// POST /api/personas
{
  "nombre": "María",
  "apellido": "Pérez",
  "dni": "11111111",
  "genero": "FEMENINO"
}

// POST /api/familiares
{
  "socioId": 1,      // Juan (del ejemplo anterior)
  "familiarId": 3,   // María
  "parentesco": "PADRE"
}

// Resultado:
// - Juan → PADRE → María
// - María → HIJA → Juan  ✅ (usa HIJA porque María es FEMENINO)
```

### Caso 3: Persona sin Género (Retrocompatibilidad)
```json
// POST /api/personas
{
  "nombre": "Pedro",
  "apellido": "López",
  "dni": "22222222"
  // No se especifica género → genero = NULL
}

// POST /api/familiares
{
  "socioId": 1,      // Juan
  "familiarId": 4,   // Pedro
  "parentesco": "PADRE"
}

// Resultado:
// - Juan → PADRE → Pedro
// - Pedro → HIJO → Juan  ✅ (fallback a masculino cuando género es NULL)
```

### Caso 4: Género No Binario
```json
// POST /api/personas
{
  "nombre": "Alex",
  "apellido": "García",
  "dni": "33333333",
  "genero": "NO_BINARIO"
}

// POST /api/familiares
{
  "socioId": 1,
  "familiarId": 5,
  "parentesco": "PADRE"
}

// Resultado:
// - Juan → PADRE → Alex
// - Alex → HIJO → Juan  ✅ (fallback a masculino por convención del español)
```

### Caso 5: Validación de Conflictos (Warning)
```json
// POST /api/personas
{
  "nombre": "Ana",
  "apellido": "Martínez",
  "dni": "44444444",
  "genero": "FEMENINO"
}

// POST /api/familiares
{
  "socioId": 6,
  "familiarId": 1,     // Juan (MASCULINO)
  "parentesco": "HIJA" // ⚠️ Conflicto: Juan es MASCULINO pero se le asigna como HIJA
}

// Resultado:
// - Relación se crea correctamente
// - Log WARNING: "Posible inconsistencia: persona con género MASCULINO asignada como HIJA"
// - La operación NO se rechaza (política: solo warning, no error)
```

---

## 📊 Reglas de Negocio

### Política de Género NULL/NO_BINARIO/PREFIERO_NO_DECIR
- **Fallback**: Siempre usa forma masculina (convención del español genérico)
- **Ejemplos**:
  - `PADRE + NULL → HIJO` (no HIJA)
  - `MADRE + NO_BINARIO → HIJO` (no HIJA)
  - `HERMANO + PREFIERO_NO_DECIR → HERMANO` (no HERMANA)

### Política de Validación de Conflictos
- **Comportamiento**: Solo genera WARNING en logs (no error HTTP 400)
- **Rationale**: Máxima flexibilidad para casos edge y identidades de género complejas
- **Ejemplos de conflictos detectados**:
  - Persona con género `MASCULINO` asignada como `HIJA`
  - Persona con género `FEMENINO` asignada como `HIJO`
  - Persona con género `MASCULINO` asignada como `HERMANA`

### Relaciones que NO Dependen de Género del Hijo
- `CONYUGE ↔ CONYUGE` (simétrico)
- `ESPOSA ↔ ESPOSO` (asimétrico, depende del género del cónyuge)
- `ESPOSO ↔ ESPOSA` (asimétrico, depende del género del cónyuge)
- `OTRO` (genérico)

---

## 🔍 Logs y Debugging

### Logs Informativos
```
🧬 Género persona A (Juan): MASCULINO
🧬 Género persona B (Carlos): MASCULINO
🔗 Parentesco complementario calculado: HIJO
```

### Logs de Warning
```
⚠️  Posible inconsistencia: persona con género MASCULINO asignada como HIJA (parentesco femenino) - Persona: Juan Pérez (ID: 123)
```

### Logs de Actualización
```
🔗 Parentesco complementario actualizado: HIJA (género B: FEMENINO)
```

---

## 🧩 Endpoints Afectados

### GET /api/personas
- **Cambio**: Incluye campo `genero` en la respuesta
- **Ejemplo**:
```json
{
  "id": 1,
  "nombre": "Juan",
  "apellido": "Pérez",
  "genero": "MASCULINO",  // ← Nuevo campo
  ...
}
```

### POST /api/personas
- **Cambio**: Acepta campo `genero` opcional
- **Validación**: `MASCULINO | FEMENINO | NO_BINARIO | PREFIERO_NO_DECIR`

### PUT /api/personas/:id
- **Cambio**: Permite actualizar campo `genero`

### POST /api/familiares
- **Cambio**: Usa género para calcular parentesco complementario
- **Log**: Incluye información de género en logs

### PUT /api/familiares/:id
- **Cambio**: Si se actualiza parentesco, recalcula complementario con género

---

## ⚙️ Variables de Configuración

No se requieren nuevas variables de entorno.

---

## 📚 Documentación Técnica

### Función Principal: `getParentescoComplementarioConGenero()`

**Signatura**:
```typescript
function getParentescoComplementarioConGenero(
  parentesco: TipoParentesco,
  generoDestino?: Genero
): TipoParentesco
```

**Parámetros**:
- `parentesco`: El parentesco original (de A hacia B)
- `generoDestino`: Género de la persona B (opcional)

**Retorna**: El parentesco complementario (de B hacia A)

**Ejemplos**:
```typescript
getParentescoComplementarioConGenero('PADRE', 'MASCULINO') // → 'HIJO'
getParentescoComplementarioConGenero('PADRE', 'FEMENINO')  // → 'HIJA'
getParentescoComplementarioConGenero('PADRE', null)        // → 'HIJO' (fallback)
getParentescoComplementarioConGenero('HERMANO', 'FEMENINO') // → 'HERMANA'
getParentescoComplementarioConGenero('CONYUGE', 'MASCULINO') // → 'CONYUGE' (simétrico)
```

### Función de Validación: `validateParentescoGenero()`

**Signatura**:
```typescript
function validateParentescoGenero(
  parentesco: TipoParentesco,
  genero: Genero
): { valid: boolean; warning?: string }
```

**Parámetros**:
- `parentesco`: El parentesco asignado
- `genero`: El género de la persona

**Retorna**: Objeto con `valid` (siempre true) y `warning` opcional

**Ejemplos**:
```typescript
validateParentescoGenero('HIJO', 'MASCULINO')
// → { valid: true }

validateParentescoGenero('HIJO', 'FEMENINO')
// → { valid: true, warning: "Posible inconsistencia: ..." }

validateParentescoGenero('HIJO', null)
// → { valid: true } (NULL siempre válido)
```

---

## ✅ Checklist de Implementación

- [x] Crear enum `Genero` en Prisma schema
- [x] Agregar campo `genero` a modelo `Persona`
- [x] Crear migración SQL
- [x] Actualizar DTOs con validación Zod
- [x] Implementar `getParentescoComplementarioConGenero()`
- [x] Implementar `validateParentescoGenero()`
- [x] Actualizar `familiar.service.ts` para usar género
- [x] Verificar `persona.repository.ts` (ya funciona con spread operator)
- [x] Crear test suite completo
- [x] Documentar cambios

---

## 🔄 Compatibilidad con Frontend

El frontend ya está preparado para usar el campo género. Los cambios son compatibles con la implementación existente en:
- `sigesda-frontend/src/components/personas/PersonaForm.tsx`
- `sigesda-frontend/src/stores/personaStore.ts`

**No se requieren cambios adicionales en el frontend.**

---

## 🐛 Troubleshooting

### Error: Migración Prisma falla con "type does not exist"
**Solución**: Aplicar migración manualmente con psql (ver Paso 1, Opción B)

### Warning: "No se pudo obtener género de personas"
**Causa**: Personas no encontradas en base de datos al actualizar relación
**Impacto**: Usa lógica sin género (fallback seguro)
**Solución**: Verificar que IDs de personas sean correctos

### Tests fallan: "Cannot find module '@prisma/client'"
**Solución**:
```bash
npm run db:generate
npm install
```

---

## 📞 Soporte

Para dudas o issues:
1. Revisar logs del servidor (`npm run dev`)
2. Ejecutar tests: `npx ts-node tests/test-genero-parentesco.ts`
3. Revisar documentación en `CLAUDE.md`

---

## 🐛 Correcciones de Bugs (Changelog)

### Bug Fix: Género incorrecto en relación inversa (2025-12-10)

**Problema Identificado:**
Cuando se creaba una relación familiar del tipo `HIJO/HIJA → PADRE/MADRE`, el sistema usaba incorrectamente el **género del hijo** para determinar el parentesco del progenitor en la relación inversa.

**Ejemplo del bug:**
```json
// Request
{
  "socioId": 30,     // María Cristina (FEMENINO)
  "familiarId": 29,  // Manuel (MASCULINO)
  "parentesco": "HIJO"
}

// Comportamiento INCORRECTO (antes del fix):
// - María Cristina → HIJO → Manuel ✅
// - Manuel → PADRE → María Cristina ❌ (incorrecto, debería ser MADRE)

// Comportamiento CORRECTO (después del fix):
// - María Cristina → HIJO → Manuel ✅
// - Manuel → MADRE → María Cristina ✅
```

**Causa raíz:**
En `familiar.service.ts`, líneas 96 y 257, se pasaba `personaB.genero` (género del hijo) en lugar de `personaA.genero` (género del progenitor) a la función `getParentescoComplementarioConGenero()`.

**Archivos corregidos:**
- ✅ `src/services/familiar.service.ts`:
  - Línea 97: `personaB.genero` → `personaA.genero` (CREATE operation)
  - Línea 258: `personaB.genero` → `personaA.genero` (UPDATE operation)
  - Actualizados comentarios y logs para reflejar cambio

- ✅ `src/utils/parentesco.helper.ts`:
  - Línea 302: Actualizada documentación del parámetro `generoDestino`
  - Líneas 352-359: Eliminado TODO y actualizada lógica `HIJO/HIJA → PADRE/MADRE`
  - Líneas 372-376: Actualizada lógica `NIETO/NIETA → ABUELO/ABUELA`
  - Líneas 383-387: Actualizada lógica `SOBRINO/SOBRINA → TIO/TIA`

**Relaciones afectadas por el fix:**
- ✅ `HIJO/HIJA → PADRE/MADRE` (ahora usa género del progenitor)
- ✅ `NIETO/NIETA → ABUELO/ABUELA` (ahora usa género del abuelo/a)
- ✅ `SOBRINO/SOBRINA → TIO/TIA` (ahora usa género del tío/a)

**Verificación:**
```bash
# Test manual realizado 2025-12-10
curl -X POST http://localhost:8000/api/familiares \
  -H "Content-Type: application/json" \
  -d '{
    "socioId": 30,     # María Cristina (FEMENINO)
    "familiarId": 29,  # Manuel (MASCULINO)
    "parentesco": "HIJO"
  }'

# Resultado:
# - ID 32: María Cristina → HIJO → Manuel
# - ID 33: Manuel → MADRE → María Cristina ✅ (CORRECTO)
```

**Impacto:**
- **Severidad**: Alta (relaciones inversas incorrectas en base de datos)
- **Alcance**: Solo afecta relaciones creadas/actualizadas ANTES de este fix
- **Datos históricos**: Relaciones existentes NO se corrigen automáticamente
- **Migración de datos**: No requerida (las nuevas relaciones usarán lógica correcta)

**Nota sobre datos existentes:**
Si tienes relaciones familiares creadas antes de este fix con parentescos incorrectos, puedes:
1. Eliminarlas y recrearlas (recomendado para pocas relaciones)
2. Actualizarlas manualmente usando `PUT /api/familiares/:id` con el parentesco correcto
3. Ejecutar un script de migración de datos (disponible bajo demanda)

---

**Última actualización**: 2025-12-10
**Versión**: 1.0.1
