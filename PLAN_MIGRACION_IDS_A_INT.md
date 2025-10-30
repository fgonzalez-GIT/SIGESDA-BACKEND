# Plan de Migración: IDs String → Int Autoincremental

## Fecha: 2025-10-29

## Objetivo
Migrar todos los IDs del sistema de String (UUID) a Int autoincremental (SERIAL en PostgreSQL).

## Estado Actual

### Modelos con ID String (Requieren Migración): 17
1. actividades
2. Aula
3. CategoriaSocio
4. ComisionDirectiva
5. ConfiguracionSistema
6. Cuota
7. Familiar
8. horarios_actividades
9. MedioPago
10. Persona
11. Recibo
12. horarios_secciones
13. participacion_actividades
14. participaciones_secciones
15. reserva_aulas
16. reservas_aulas_secciones
17. secciones_actividades

### Modelos con ID Int (Ya Correctos): 6
- tipos_actividades ✅
- categorias_actividades ✅
- estados_actividades ✅
- dias_semana ✅
- roles_docentes ✅
- tipos_persona ✅

## Orden de Migración (Por Dependencias)

### Nivel 1 - Tablas sin dependencias o solo con FKs a tablas ya Int
1. **ConfiguracionSistema** - Sin FKs
2. **Aula** - Sin FKs
3. **CategoriaSocio** - Sin FKs

### Nivel 2 - Tablas que dependen de Nivel 1
4. **Persona** - Depende de: CategoriaSocio
5. **actividades** - Depende de: tipos_actividades (ya Int), categorias_actividades (ya Int)
6. **secciones_actividades** - Depende de: actividades, tipos_actividades

### Nivel 3 - Tablas que dependen de Persona
7. **ComisionDirectiva** - Depende de: Persona
8. **Familiar** - Depende de: Persona (doble FK)
9. **Recibo** - Depende de: Persona (emisor/receptor)

### Nivel 4 - Tablas de relaciones
10. **participacion_actividades** - Depende de: Persona, actividades
11. **participaciones_secciones** - Depende de: Persona, secciones_actividades
12. **reserva_aulas** - Depende de: Persona, Aula, actividades
13. **reservas_aulas_secciones** - Depende de: secciones_actividades, Aula

### Nivel 5 - Tablas de horarios y relaciones finales
14. **horarios_actividades** - Depende de: actividades
15. **horarios_secciones** - Depende de: secciones_actividades
16. **Cuota** - Depende de: CategoriaSocio, Persona (socioId)
17. **MedioPago** - Depende de: Recibo

## Estrategia de Migración

### Fase 1: Preparación
- [x] Analizar todas las tablas y dependencias
- [ ] Crear backup completo de la base de datos
- [ ] Documentar datos existentes (cantidad de registros por tabla)

### Fase 2: Migración del Schema
- [ ] Actualizar prisma/schema.prisma con todos los IDs a Int
- [ ] Actualizar todos los campos FK relacionados

### Fase 3: Migración de Datos
- [ ] Crear script SQL de migración que:
  1. Crea tablas temporales con estructura nueva
  2. Crea mapeo de IDs antiguos → nuevos
  3. Migra datos respetando relaciones
  4. Valida integridad referencial
  5. Reemplaza tablas antiguas con nuevas

### Fase 4: Actualización de Código
- [ ] Remover todas las referencias a UUID
- [ ] Actualizar repositorios (remover uuidv4())
- [ ] Actualizar DTOs (cambiar validaciones de String a Int)
- [ ] Actualizar servicios y controladores

### Fase 5: Pruebas
- [ ] Probar CRUD de cada entidad
- [ ] Verificar integridad referencial
- [ ] Probar endpoints principales

## Riesgos y Consideraciones

### ⚠️ Riesgos Altos
1. **Pérdida de datos** si la migración falla
2. **Referencias rotas** si no se mantiene el mapeo correcto
3. **Downtime** durante la migración
4. **Datos huérfanos** si hay inconsistencias previas

### 🛡️ Mitigaciones
1. **Backup completo** antes de iniciar
2. **Script de rollback** para revertir cambios
3. **Migración en ambiente de desarrollo primero**
4. **Validaciones exhaustivas en cada paso**
5. **Mantener tablas de mapeo** (old_id → new_id)

## Complejidad por Tabla

### Alta Complejidad (Múltiples FKs)
- **Persona**: 8 relaciones diferentes
- **actividades**: 6 relaciones
- **secciones_actividades**: 5 relaciones

### Media Complejidad (2-3 FKs)
- **Recibo**: 3 FKs (emisor, receptor, medioPago)
- **Familiar**: 2 FKs a Persona (socio, familiar)
- **Cuota**: 2 FKs (categoria, socio)

### Baja Complejidad (0-1 FK)
- **Aula**: Sin FKs
- **CategoriaSocio**: Sin FKs
- **ConfiguracionSistema**: Sin FKs

## Estimación de Tiempo

- **Fase 1 (Preparación)**: 1 hora
- **Fase 2 (Schema)**: 2 horas
- **Fase 3 (Migración SQL)**: 4-6 horas
- **Fase 4 (Código)**: 3-4 horas
- **Fase 5 (Pruebas)**: 2-3 horas

**Total estimado**: 12-16 horas

## Datos a Preservar

Al momento de la migración, necesitamos mapear:
- IDs de registros existentes
- Todas las relaciones FK
- Secuencias autoincrementales (empezar después del último ID)

## Script de Validación Pre-Migración

```sql
-- Verificar cantidad de registros
SELECT 'personas' as tabla, COUNT(*) as registros FROM personas
UNION ALL
SELECT 'actividades', COUNT(*) FROM actividades
UNION ALL
SELECT 'recibos', COUNT(*) FROM recibos;

-- Verificar integridad referencial actual
-- (agregar queries específicas según necesidad)
```

## Próximos Pasos Inmediatos

1. Crear backup de la base de datos
2. Actualizar el schema de Prisma completo
3. Generar script de migración SQL
4. Probar en ambiente local primero

## Notas Importantes

- ⚠️ **NO ejecutar en producción sin pruebas exhaustivas**
- 📝 Mantener documentación de cada paso
- 🔄 Tener plan de rollback listo
- ✅ Validar después de cada fase

---

**Estado**: Planificación completa ✅
**Siguiente paso**: Crear backup y comenzar Fase 2
