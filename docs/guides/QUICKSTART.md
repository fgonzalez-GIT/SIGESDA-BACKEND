# Guía de Inicio Rápido - SIGESDA Backend

**Versión:** 1.0
**Fecha:** 2025-12-17
**Autor:** SIGESDA Development Team

---

## Introducción

Esta guía te ayudará a comenzar rápidamente con el sistema de gestión de cuotas de SIGESDA Backend. En 15 minutos tendrás el servidor corriendo y podrás generar tus primeras cuotas.

---

## Requisitos Previos

- **Node.js**: v20+
- **PostgreSQL**: 16+
- **npm**: 9+
- **Git**: Para clonar el repositorio

---

## Paso 1: Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd SIGESDA-BACKEND

# Instalar dependencias
npm install

# Generar Prisma Client
npm run db:generate
```

---

## Paso 2: Configuración de Base de Datos

1. **Crear base de datos PostgreSQL:**
   ```sql
   CREATE DATABASE sigesda;
   ```

2. **Configurar archivo `.env`:**
   ```env
   # Base de datos
   DATABASE_URL="postgresql://user:password@localhost:5432/sigesda?schema=public"

   # Servidor
   PORT=8000
   NODE_ENV=development

   # Paginación
   DEFAULT_PAGE_SIZE=20
   MAX_PAGE_SIZE=100

   # Logging
   LOG_LEVEL=info
   ```

3. **Ejecutar migraciones:**
   ```bash
   npm run db:migrate
   ```

4. **Ejecutar seeders (datos iniciales):**
   ```bash
   npm run db:seed
   npx tsx prisma/seed-items-catalogos.ts
   ```

---

## Paso 3: Iniciar el Servidor

```bash
# Modo desarrollo (con hot-reload)
npm run dev

# El servidor estará disponible en:
# http://localhost:8000
```

**Verificar que el servidor está corriendo:**
```bash
curl http://localhost:8000/health

# Respuesta esperada:
# {
#   "status": "ok",
#   "timestamp": "2025-12-17T...",
#   "database": "connected"
# }
```

---

## Paso 4: Verificar Swagger Docs

Abre en tu navegador:
```
http://localhost:8000/api-docs
```

Aquí encontrarás la documentación interactiva de todos los endpoints disponibles (70+ endpoints).

---

## Paso 5: Crear tu Primer Socio

**Endpoint:** `POST /api/personas`

**Ejemplo usando curl:**
```bash
curl -X POST http://localhost:8000/api/personas \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "fechaNacimiento": "1990-05-15",
    "email": "juan.perez@email.com",
    "telefono": "1234567890",
    "direccion": "Calle Falsa 123",
    "tipos": [
      {
        "tipoPersonaCodigo": "SOCIO",
        "categoriaSocioCodigo": "ADULTO_GENERAL",
        "activo": true
      }
    ]
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "numeroSocio": 1,
    "categoria": "ADULTO_GENERAL"
  }
}
```

---

## Paso 6: Generar Cuotas del Mes

**Endpoint:** `POST /api/cuotas/generar`

**Ejemplo:**
```bash
curl -X POST http://localhost:8000/api/cuotas/generar \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 12,
    "anio": 2025,
    "aplicarDescuentos": true
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "generated": 1,
    "errors": [],
    "cuotas": [
      {
        "id": 1,
        "mes": 12,
        "anio": 2025,
        "categoria": "ADULTO_GENERAL",
        "montoTotal": 10000,
        "recibo": {
          "numero": "00001-2025",
          "estado": "PENDIENTE"
        }
      }
    ]
  }
}
```

---

## Paso 7: Consultar Dashboard del Mes

**Endpoint:** `GET /api/reportes/cuotas/dashboard`

**Ejemplo:**
```bash
curl "http://localhost:8000/api/reportes/cuotas/dashboard?mes=12&anio=2025"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalCuotas": 1,
    "cuotasPagadas": 0,
    "cuotasPendientes": 1,
    "cuotasVencidas": 0,
    "montoTotal": 10000,
    "montoPagado": 0,
    "montoPendiente": 10000,
    "porcentajeCobranza": 0
  }
}
```

---

## Endpoints Principales

### Personas/Socios
- `GET /api/personas` - Listar personas
- `POST /api/personas` - Crear persona
- `GET /api/personas/:id` - Obtener persona
- `PUT /api/personas/:id` - Actualizar persona
- `DELETE /api/personas/:id` - Eliminar persona (soft delete)

### Cuotas
- `POST /api/cuotas/generar` - Generar cuotas del mes
- `GET /api/cuotas` - Listar cuotas
- `GET /api/cuotas/:id` - Obtener cuota
- `POST /api/cuotas/:id/recalcular` - Recalcular cuota

### Ajustes Manuales
- `POST /api/ajustes` - Crear ajuste manual
- `GET /api/ajustes` - Listar ajustes
- `PUT /api/ajustes/:id` - Actualizar ajuste
- `DELETE /api/ajustes/:id` - Eliminar ajuste

### Reportes
- `GET /api/reportes/cuotas/dashboard` - Dashboard del mes
- `GET /api/reportes/cuotas/por-categoria` - Reporte por categoría
- `GET /api/reportes/cuotas/morosidad` - Reporte de morosidad

---

## Herramientas de Desarrollo

### Prisma Studio (UI para la DB)
```bash
npm run db:studio

# Abre http://localhost:5555
```

### Ver logs del servidor
Los logs se muestran en la consola con formato estructurado:
- `[INFO]` - Información general
- `[WARN]` - Advertencias
- `[ERROR]` - Errores
- `[REQUEST]` - Requests HTTP

---

## Comandos Útiles

```bash
# Ver estado de migraciones
npx prisma migrate status

# Resetear base de datos (CUIDADO: borra todo)
npx prisma migrate reset

# Ejecutar tests
npm test

# Ejecutar tests E2E FASE 7
NODE_ENV=test npx tsx tests/fase7-e2e-complete-flows.ts

# Compilar para producción
npm run build

# Iniciar en producción
npm start
```

---

## Troubleshooting

### Error: "Error al conectar a la base de datos"
- Verificar que PostgreSQL esté corriendo
- Verificar credenciales en `.env`
- Verificar que la base de datos `sigesda` exista

### Error: "Puerto 8000 ya está en uso"
- Cambiar el puerto en `.env`
- O matar el proceso: `lsof -ti:8000 | xargs kill -9`

### Error: "Prisma Client no generado"
- Ejecutar: `npm run db:generate`

### Error en migraciones
- Verificar estado: `npx prisma migrate status`
- Resolver migración fallida: `npx prisma migrate resolve --rolled-back <migration-name>`

---

## Próximos Pasos

Una vez que tengas el servidor funcionando:

1. **Lee las guías específicas:**
   - `GENERACION_CUOTAS.md` - Proceso completo de generación
   - `AJUSTES_EXENCIONES.md` - Ajustes manuales y exenciones
   - `REGLAS_DESCUENTO.md` - Motor de reglas de descuento
   - `REPORTES.md` - Reportes y estadísticas

2. **Explora la documentación Swagger:**
   - http://localhost:8000/api-docs

3. **Revisa la colección Postman:**
   - Importar `POSTMAN_COLLECTION.json` en Postman

4. **Ejecuta los tests:**
   - `NODE_ENV=test npx tsx tests/fase7-e2e-complete-flows.ts`

---

## Recursos Adicionales

- **Documentación técnica:** `docs/FASE2_DISEÑO_ITEMS.md`
- **Análisis de refactoring:** `docs/REFACTORING_ANALYSIS.md`
- **Checklist de progreso:** `PROGRESS_CHECKLIST.md`
- **Código de ejemplo:** `tests/*.http`

---

## Soporte

Para reportar problemas o sugerencias:
- Crear issue en GitHub
- Contactar al equipo de desarrollo

---

**¡Listo!** Ya tienes el sistema funcionando. Comienza a explorar los endpoints y generar tus primeras cuotas.
