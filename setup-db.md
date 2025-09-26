# Configuración de Base de Datos PostgreSQL

## Estado Actual
- ✅ PostgreSQL 12.22 instalado y corriendo
- ✅ Cluster principal activo en puerto 5432
- ❌ Usuario `sigesda_user` no configurado
- ❌ Base de datos `asociacion_musical` no creada

## Pasos para Completar la Configuración

### 1. Crear Usuario y Base de Datos

Ejecuta los siguientes comandos en PostgreSQL:

```bash
# Conectar como usuario postgres
sudo -u postgres psql

# Dentro del shell de PostgreSQL:
CREATE USER sigesda_user WITH PASSWORD 'SiGesda2024!';
CREATE DATABASE asociacion_musical OWNER sigesda_user;
GRANT ALL PRIVILEGES ON DATABASE asociacion_musical TO sigesda_user;
\q
```

### 2. Actualizar Configuración de Conexión

Editar `.env` y usar:
```
DATABASE_URL="postgresql://sigesda_user:SiGesda2024!@localhost:5432/asociacion_musical?schema=public"
```

### 3. Ejecutar Migraciones

```bash
# Crear y aplicar migración inicial
npm run db:migrate

# Generar cliente Prisma
npm run db:generate

# Poblar base de datos con datos de prueba
npm run db:seed
```

### 4. Verificar Configuración

```bash
# Iniciar servidor de desarrollo
npm run dev

# Verificar health check
curl http://localhost:3001/health
```

## Comandos Útiles

```bash
# Ver tablas creadas
sudo -u postgres psql -d asociacion_musical -c "\dt"

# Abrir Prisma Studio (GUI para la base de datos)
npm run db:studio

# Ver logs del servidor
npm run dev | tail -f
```

## Estructura de la Base de Datos

La base de datos incluirá:
- **Personas** (con herencia TPH): socios, docentes, proveedores, no socios
- **Actividades**: coros, clases de canto, clases de instrumentos
- **Recibos**: cuotas, sueldos, deudas
- **Aulas** y **Reservas**
- **Configuración del sistema**

## Datos de Prueba

El seed script creará:
- 3 docentes
- 4 socios de diferentes categorías
- 1 no socio
- 1 proveedor
- 4 actividades (1 coro + 3 clases)
- 3 aulas
- Participaciones y relaciones familiares
- Configuración de montos de cuotas