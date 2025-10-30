# Estado de Migración: IDs String → Int

## Fecha: 2025-10-29

## ✅ Completado

### 1. Análisis y Planificación
- ✅ Identificadas 17 tablas con ID String que requieren migración
- ✅ Identificadas 6 tablas con ID Int ya correctos
- ✅ Documentado el orden de dependencias entre tablas
- ✅ Creado plan de migración detallado (`PLAN_MIGRACION_IDS_A_INT.md`)

### 2. Actualización del Schema
- ✅ Creado script automatizado (`scripts/migrate-ids-to-int.js`)
- ✅ Actualizado `prisma/schema.prisma` completamente:
  - **16 PKs migradas** de String a Int autoincrement
  - **21 FKs actualizadas** de String a Int
  - **Total: 37 cambios exitosos**
- ✅ Schema validado con `npx prisma validate` ✓
- ✅ Backup creado: `prisma/schema.prisma.backup-*`

### 3. Actualización de Código
- ✅ Removida dependencia de `uuid` en `persona.repository.ts`
- ✅ Eliminado uso de `uuidv4()` para generación de IDs
- ✅ Actualizado manejo de `categoriaId` a Int
- ✅ Generado nuevo Prisma Client con tipos actualizados

### 4. Documentación
- ✅ Creado script SQL de limpieza (`prisma/migrations/manual/migrate_string_to_int_ids.sql`)
- ✅ Documentado todo el proceso y cambios realizados

## ⚠️ Pendiente

### 5. Aplicación de Migración
- ⏸️ **BLOQUEADO**: Existe una migración antigua (`20251027185921_persona_multiples_tipos`) que tiene conflicto
- ⏸️ La BD actual tiene IDs String, el schema nuevo espera IDs Int
- ⏸️ No se puede aplicar `prisma migrate reset` sin perder datos

## 🎯 Próximos Pasos para Completar la Migración

### Opción 1: Reset Completo (DESARROLLO)
**Recomendado para ambiente de desarrollo sin datos importantes**

```bash
# 1. Hacer backup de datos si es necesario
npx prisma db pull --print > backup-schema.sql

# 2. Eliminar carpeta de migraciones
rm -rf prisma/migrations

# 3. Resetear BD completamente
npx prisma migrate reset --force --skip-seed

# 4. Crear nueva migración inicial
npx prisma migrate dev --name init_with_int_ids

# 5. Verificar que todo funciona
npm run dev
```

### Opción 2: Migración con Preservación de Datos (PRODUCCIÓN)
**Para cuando haya datos importantes que preservar**

1. **Crear tablas temporales** con estructura nueva (Int IDs)
2. **Crear tablas de mapeo**: `old_id (String) → new_id (Int)`
3. **Migrar datos** tabla por tabla respetando dependencias
4. **Validar integridad** referencial
5. **Hacer switch atómico** entre tablas antiguas y nuevas
6. **Rollback disponible** en caso de problemas

Ver script detallado en: `scripts/migrate-with-data-preservation.sql` (pendiente crear)

## 📊 Resumen de Cambios en Schema

### Tablas Migradas (16):
```
✅ actividades            String → Int @default(autoincrement())
✅ Aula                   String → Int @default(autoincrement())
✅ CategoriaSocio         String → Int @default(autoincrement())
✅ ComisionDirectiva      String → Int @default(autoincrement())
✅ ConfiguracionSistema   String → Int @default(autoincrement())
✅ Cuota                  String → Int @default(autoincrement())
✅ Familiar               String → Int @default(autoincrement())
✅ horarios_actividades   String → Int @default(autoincrement())
✅ MedioPago              String → Int @default(autoincrement())
✅ Persona                String → Int @default(autoincrement())
✅ Recibo                 String → Int @default(autoincrement())
✅ horarios_secciones     String → Int @default(autoincrement())
✅ participacion_actividades        String → Int @default(autoincrement())
✅ participaciones_secciones        String → Int @default(autoincrement())
✅ reserva_aulas          String → Int @default(autoincrement())
✅ reservas_aulas_secciones         String → Int @default(autoincrement())
✅ secciones_actividades  String → Int @default(autoincrement())
```

### Foreign Keys Actualizadas (21):
```
✅ ComisionDirectiva.socioId         String → Int
✅ Familiar.socioId                  String → Int
✅ Familiar.familiarId               String → Int
✅ Recibo.emisorId                   String → Int
✅ Recibo.receptorId                 String → Int
✅ participacion_actividades.personaId     String → Int
✅ participacion_actividades.actividadId   String → Int
✅ participaciones_secciones.personaId     String → Int
✅ participaciones_secciones.seccionId     String → Int
✅ reserva_aulas.docenteId           String → Int
✅ reserva_aulas.aulaId              String → Int
✅ reserva_aulas.actividadId         String → Int
✅ reservas_aulas_secciones.seccionId      String → Int
✅ reservas_aulas_secciones.aulaId         String → Int
✅ horarios_actividades.actividadId        String → Int
✅ horarios_secciones.seccionId      String → Int
✅ Cuota.reciboId                    String → Int
✅ Cuota.categoriaId                 String → Int
✅ MedioPago.reciboId                String → Int
✅ Persona.categoriaId               String → Int
✅ secciones_actividades.actividadId       String → Int
```

## 🔧 Archivos Modificados

### Schema
- `prisma/schema.prisma` - Actualizado completamente ✅

### Scripts
- `scripts/migrate-ids-to-int.js` - Script automatizado ✅
- `prisma/migrations/manual/migrate_string_to_int_ids.sql` - Script SQL ✅

### Repositorios
- `src/repositories/persona.repository.ts` - Removido UUID ✅

### Backups
- `prisma/schema.prisma.backup-20251029-*` - Backup del schema original ✅

## ⚠️ Advertencias Importantes

1. **NO ejecutar en producción** sin pruebas exhaustivas
2. **Hacer backup completo** antes de aplicar migraciones
3. **Tener plan de rollback** listo
4. **La migración ES DESTRUCTIVA** en su forma actual (elimina datos)
5. **Probar primero en desarrollo** con reset completo

## 🎬 Para Aplicar la Migración Ahora

Si estás en **desarrollo** y quieres aplicar los cambios **AHORA**:

```bash
# ⚠️ ESTO ELIMINARÁ TODOS LOS DATOS

# 1. Detener el servidor
# Ctrl+C o:
lsof -ti:8000 | xargs kill -9

# 2. Eliminar migraciones antiguas
rm -rf prisma/migrations

# 3. Reset completo de BD
npx prisma migrate reset --force --skip-seed

# 4. Crear migración inicial con IDs Int
npx prisma migrate dev --name init_with_int_ids

# 5. Regenerar Prisma Client
npx prisma generate

# 6. Reiniciar servidor
npm run dev

# 7. Poblar datos de catálogos
npm run seed  # o el script que corresponda
```

## 📈 Beneficios de la Migración

Una vez completada:
- ✅ IDs autoincrementales más eficientes
- ✅ Menor uso de espacio en BD (Int vs String)
- ✅ Mejor rendimiento en JOINs e índices
- ✅ Secuencias automáticas de PostgreSQL
- ✅ Simplificación del código (no más UUID)
- ✅ Consistencia en todo el sistema

## 📝 Notas

- El schema actual es **válido** según Prisma
- El código está **actualizado** para usar Int
- Solo falta **aplicar la migración** a la BD
- Se recomienda hacerlo en una sesión dedicada
- Considerar si hay datos a preservar

---

**Estado**: ✅ Preparación completa | ⏸️ Aplicación pendiente
**Siguiente**: Decidir estrategia (Reset vs Preservación de datos)
