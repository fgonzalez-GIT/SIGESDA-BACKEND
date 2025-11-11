# Pruebas Manuales - SIGESDA Backend

Este directorio contiene scripts simples para probar manualmente las APIs del backend de SIGESDA. Cada script es ejecutable con `npx tsx` y muestra resultados en consola con formato claro y colores.

## 📋 Índice de Scripts

1. [test-personas-crud-simple.ts](#1-test-personas-crud-simplets) - CRUD básico de personas
2. [test-personas-tipos.ts](#2-test-personas-tipoststs) - Asignación de tipos (SOCIO, DOCENTE, etc.)
3. [test-personas-contactos.ts](#3-test-personas-contactosts) - Gestión de contactos
4. [test-relaciones-familiares.ts](#4-test-relaciones-familiarests) - Relaciones familiares con sincronización bidireccional
5. [test-inscripciones-actividades.ts](#5-test-inscripciones-actividadests) - Inscripciones y participaciones en actividades

---

## Prerequisitos Generales

Para todos los scripts:

1. **Servidor corriendo**:
   ```bash
   npm run dev
   ```

2. **Base de datos con seed**:
   ```bash
   npm run db:seed
   ```

3. **Dependencia axios instalada**:
   ```bash
   npm install axios
   ```

---

## 1. test-personas-crud-simple.ts

**Script básico que ejecuta operaciones CRUD completas contra el API de Personas.**

### Características

- **Pruebas incluidas**:
  - ✅ CREATE: Crear nueva persona
  - ✅ READ: Leer persona por ID
  - ✅ UPDATE: Actualizar datos de persona
  - ✅ DELETE: Eliminar persona (soft delete)
  - ✅ VERIFY: Verificar eliminación

- **Datos de prueba**:
  - DNI y email únicos generados automáticamente
  - Se crea como NO_SOCIO por defecto
  - Datos hardcodeados simples

### Ejecución

```bash
npx tsx tests/manual/test-personas-crud-simple.ts
```

### Tests incluidos

1. CREATE - Persona básica (NO_SOCIO por defecto)
2. READ - Leer persona por ID
3. UPDATE - Actualizar nombre, teléfono, dirección
4. DELETE - Soft delete (marca como inactiva)
5. VERIFY - Confirmar eliminación

---

## 2. test-personas-tipos.ts

**Prueba la asignación, actualización y eliminación de tipos de persona, incluyendo multi-tipo y validación de exclusión mutua SOCIO ↔ NO_SOCIO.**

### Características

- **Tipos soportados**: SOCIO, NO_SOCIO, DOCENTE, PROVEEDOR
- **Multi-tipo**: Una persona puede tener múltiples tipos simultáneos (ej: SOCIO + DOCENTE)
- **Exclusión mutua**: SOCIO y NO_SOCIO son mutuamente excluyentes
- **Auto-assignments**:
  - SOCIO: numeroSocio y categoría (ACTIVO por defecto)
  - DOCENTE: especialidad (GENERAL por defecto)
  - NO_SOCIO: Asignado automáticamente si no se especifica ningún tipo

### Ejecución

```bash
npx tsx tests/manual/test-personas-tipos.ts
```

### Tests incluidos

1. TEST 1 - Crear persona SIN tipos → NO_SOCIO asignado automáticamente
2. TEST 2 - Asignar SOCIO → Debe eliminar NO_SOCIO (mutual exclusion)
3. TEST 3 - Asignar DOCENTE → Multi-tipo SOCIO + DOCENTE
4. TEST 4 - Crear persona CON SOCIO desde inicio
5. TEST 5 - Crear persona multi-tipo (NO_SOCIO + DOCENTE)
6. TEST 6 - Validar exclusión mutua (convertir NO_SOCIO → SOCIO)
7. TEST 7 - Actualizar datos de un tipo (honorarios)
8. TEST 8 - Eliminar tipo (soft delete, desasignación)

### Validaciones especiales

- ✅ NO_SOCIO asignado por defecto si no se especifican tipos
- ✅ SOCIO y NO_SOCIO no pueden coexistir
- ✅ Auto-assignment de numeroSocio (siguiente disponible)
- ✅ Auto-assignment de categoría (ACTIVO por defecto)
- ✅ Auto-assignment de especialidad (GENERAL por defecto)
- ✅ Soft delete marca tipo como inactivo con fechaDesasignacion

---

## 3. test-personas-contactos.ts

**Prueba la gestión completa de contactos de personas (EMAIL, TELEFONO, CELULAR, WHATSAPP, OTRO).**

### Características

- **Tipos de contacto**: EMAIL, TELEFONO, CELULAR, WHATSAPP, OTRO
- **Contactos principales**: Marcar contactos como principales
- **Múltiples contactos**: Una persona puede tener múltiples contactos del mismo tipo

### Ejecución

```bash
npx tsx tests/manual/test-personas-contactos.ts
```

### Tests incluidos

1. TEST 1 - Crear persona base
2. TEST 2 - Agregar contacto EMAIL (principal)
3. TEST 3 - Agregar contacto TELEFONO
4. TEST 4 - Agregar contacto CELULAR (principal)
5. TEST 5 - Agregar contacto WHATSAPP
6. TEST 6 - Listar todos los contactos
7. TEST 7 - Actualizar contacto (cambiar valor y observaciones)
8. TEST 8 - Eliminar contacto

### Validaciones especiales

- ✅ Múltiples contactos por persona
- ✅ Marcar contactos como principales
- ✅ Observaciones opcionales
- ✅ Soft delete o hard delete según configuración

---

## 4. test-relaciones-familiares.ts

**Prueba la creación y gestión de relaciones familiares con sincronización bidireccional automática.**

### Características

- **Tipos de parentesco**: PADRE, MADRE, HIJO, HIJA, HERMANO, HERMANA, ESPOSO, ESPOSA, ABUELO, ABUELA, NIETO, NIETA, TIO, TIA, SOBRINO, SOBRINA, PRIMO, PRIMA
- **Sincronización bidireccional**: Al crear PADRE→HIJO se crea automáticamente HIJO→PADRE
- **Descuentos familiares**: 0-100%
- **Grupos familiares**: Marcar relaciones como grupo familiar

### Ejecución

```bash
npx tsx tests/manual/test-relaciones-familiares.ts
```

### Tests incluidos

1. TEST 1 - Crear familia base (padre, madre, 2 hijos)
2. TEST 2 - Crear relación PADRE→HIJO (con sync bidireccional)
3. TEST 3 - Crear relación MADRE→HIJO
4. TEST 4 - Crear relación HERMANO↔HERMANA
5. TEST 5 - Crear relación ESPOSO↔ESPOSA
6. TEST 6 - Listar relaciones familiares de una persona
7. TEST 7 - Actualizar relación (cambiar descuento)
8. TEST 8 - Eliminar relación (elimina ambas direcciones)

### Validaciones especiales

- ✅ **Sincronización bidireccional automática**:
  - PADRE → HIJO crea automáticamente HIJO → PADRE
  - HERMANO → HERMANA crea automáticamente HERMANA → HERMANO
  - ESPOSO → ESPOSA crea automáticamente ESPOSA → ESPOSO
- ✅ Parentescos complementarios correctos
- ✅ Eliminación bidireccional (eliminar una relación elimina ambas)
- ✅ Descuentos y permisos por relación
- ✅ Soporte para grupos familiares

---

## 5. test-inscripciones-actividades.ts

**Prueba el proceso completo de inscripción de personas en actividades, validación de cupo y gestión de participaciones.**

### Características

- **Inscripciones**: Agregar personas a actividades
- **Validación de cupo**: Verificar capacidad máxima
- **Precios especiales**: Aplicar descuentos por persona
- **Prevención de duplicados**: Una persona no puede inscribirse dos veces en la misma actividad
- **Gestión activa**: Dar de baja (soft delete) participaciones

### Ejecución

```bash
npx tsx tests/manual/test-inscripciones-actividades.ts
```

### Tests incluidos

1. TEST 1 - Obtener actividades disponibles
2. TEST 2 - Crear personas para inscripciones (3 personas)
3. TEST 3 - Inscribir persona 1 (precio normal)
4. TEST 4 - Verificar cupo de actividad
5. TEST 5 - Inscribir persona 2 (con precio especial)
6. TEST 6 - Listar participantes de actividad
7. TEST 7 - Actualizar participación (cambiar precio especial)
8. TEST 8 - Validar prevención de inscripción duplicada
9. TEST 9 - Desactivar participación (dar de baja)

### Validaciones especiales

- ✅ **Validación de cupo**: No permite inscribir si actividad está llena
- ✅ **Prevención de duplicados**: Una persona solo puede inscribirse una vez
- ✅ Precio especial por persona (descuentos individuales)
- ✅ Soft delete mantiene historial de participaciones
- ✅ Verificación de capacidad en tiempo real
- ✅ Unique constraint: `[personaId, actividadId]`

---

## 🎨 Formato de Salida

Todos los scripts comparten el mismo formato de salida:

```
████████████████████████████████████████████████████████████████████████████████
  SCRIPT DE PRUEBAS - [NOMBRE DEL MÓDULO]
  SIGESDA Backend API
████████████████████████████████████████████████████████████████████████████████

API Base URL: http://localhost:8000/api
Timeout: 5000ms

Verificando conectividad con el servidor...
✓ Servidor accesible

================================================================================
  TEST 1: [Nombre del Test]
================================================================================

→ REQUEST: POST http://localhost:8000/api/endpoint
  Body: { ... }

← RESPONSE: 201
  Data: { ... }

✓ Operación exitosa

... (más tests)

================================================================================
  RESUMEN FINAL
================================================================================

✓ Todos los tests se ejecutaron exitosamente

  Tests completados:
    ✓ TEST 1 - Descripción
    ✓ TEST 2 - Descripción
    ...
================================================================================
```

### Colores

- 🟢 **Verde**: Operaciones exitosas, validaciones correctas
- 🔴 **Rojo**: Errores, fallos de validación
- 🟡 **Amarillo**: Advertencias, estados inesperados
- 🔵 **Cyan**: Requests, información de contexto

---

## 🔧 Modificar Scripts

Todos los scripts tienen datos de prueba al inicio del archivo que pueden ser modificados:

```typescript
// ============================================================================
// DATOS DE PRUEBA
// ============================================================================

const timestamp = Date.now();
const randomDNI = String(20000000 + Math.floor(Math.random() * 20000000));

const personaData = {
  nombre: 'Juan Carlos',
  apellido: 'Pérez García',
  dni: randomDNI,
  email: `juan.perez.${timestamp}@example.com`,
  telefono: '+34 600 123 456',
  direccion: 'Calle Mayor 123, Madrid',
  fechaNacimiento: '1990-05-15T00:00:00.000Z'
};
```

---

## 📝 Notas Importantes

### Generación de Datos Únicos

Todos los scripts generan DNI y emails únicos automáticamente usando timestamps y números aleatorios para evitar conflictos en ejecuciones múltiples.

### Soft Delete vs Hard Delete

- **Soft Delete**: Marca registros como inactivos pero mantiene los datos (usado por defecto)
- **Hard Delete**: Elimina permanentemente los registros (usado raramente)

### Exit Codes

- `0`: Todas las operaciones exitosas
- `1`: Al menos una operación falló

### Timeouts

Todos los scripts tienen timeout de 5 segundos por request. Si el servidor tarda más, aumenta el valor de `TIMEOUT`.

---

## 🚀 Ejecutar Todos los Scripts

Puedes ejecutar todos los scripts secuencialmente:

```bash
npx tsx tests/manual/test-personas-crud-simple.ts && \
npx tsx tests/manual/test-personas-tipos.ts && \
npx tsx tests/manual/test-personas-contactos.ts && \
npx tsx tests/manual/test-relaciones-familiares.ts && \
npx tsx tests/manual/test-inscripciones-actividades.ts
```

---

## 📊 Cobertura de Testing

| Módulo | CRUD | Validaciones | Multi-entidad | Reglas de Negocio |
|--------|------|--------------|---------------|-------------------|
| **Personas** | ✅ | ✅ | ✅ | ✅ |
| **Tipos Persona** | ✅ | ✅ | ✅ | ✅ |
| **Contactos** | ✅ | ✅ | ✅ | ✅ |
| **Relaciones Familiares** | ✅ | ✅ | ✅ | ✅ |
| **Inscripciones** | ✅ | ✅ | ✅ | ✅ |

### Reglas de Negocio Validadas

1. ✅ NO_SOCIO asignado por defecto
2. ✅ Exclusión mutua SOCIO ↔ NO_SOCIO
3. ✅ Auto-assignment de numeroSocio, categoría, especialidad
4. ✅ Multi-tipo (SOCIO + DOCENTE, etc.)
5. ✅ Sincronización bidireccional de relaciones familiares
6. ✅ Validación de cupo en actividades
7. ✅ Prevención de inscripciones duplicadas
8. ✅ Soft delete mantiene integridad referencial

---

## 🐛 Troubleshooting

### Servidor no accesible

```
✗ Servidor no accesible
```

**Solución**: Verifica que el servidor esté corriendo con `npm run dev`

### Error de base de datos

```
✗ Error: Connection refused
```

**Solución**: Verifica que PostgreSQL esté corriendo y las credenciales en `.env` sean correctas

### DNI duplicado

```
✗ Ya existe una persona con DNI ...
```

**Solución**: Los scripts generan DNIs aleatorios, pero si ocurre, ejecuta el script nuevamente

### Actividad sin cupo

```
⚠ ACTIVIDAD LLENA - No hay cupos disponibles
```

**Solución**: Normal si la actividad tiene `capacidadMaxima` definido. El script valida correctamente esta situación.

---

## 📚 Recursos Adicionales

- **Documentación API**: Consulta `CLAUDE.md` en la raíz del proyecto
- **Schema Prisma**: `prisma/schema.prisma`
- **Seed Database**: `prisma/seed.ts`
- **Tests de Integración**: `tests/integration/`

---

## 🎯 Próximas Mejoras

Scripts planificados para futuras versiones:

- [ ] `test-actividades-crud.ts` - CRUD completo de actividades
- [ ] `test-recibos-cuotas.ts` - Gestión de recibos y cuotas
- [ ] `test-aulas-reservas.ts` - Gestión de aulas y reservas
- [ ] `test-docentes-actividades.ts` - Asignación de docentes a actividades
- [ ] `test-secciones-horarios.ts` - Gestión de secciones y horarios

---

**¿Encontraste un bug? ¿Tienes sugerencias?** Contacta al equipo de desarrollo o abre un issue en el repositorio.
