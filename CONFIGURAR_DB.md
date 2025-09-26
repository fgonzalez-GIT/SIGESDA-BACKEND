# 🔧 Guía para Configurar PostgreSQL

## Problema Actual
No tengo permisos suficientes para ejecutar comandos `sudo` sin terminal interactivo. Necesitamos configurar PostgreSQL manualmente.

## Solución: Configurar PostgreSQL Manualmente

### Paso 1: Ejecutar comandos PostgreSQL
Abre una terminal nueva y ejecuta:

```bash
# Cambiar a usuario postgres
sudo -i -u postgres

# Una vez como postgres, ejecutar psql
psql

# Dentro del shell de PostgreSQL, ejecutar:
CREATE USER sigesda_user WITH PASSWORD 'SiGesda2024!';
CREATE DATABASE asociacion_musical OWNER sigesda_user;
GRANT ALL PRIVILEGES ON DATABASE asociacion_musical TO sigesda_user;

# Conectar a la nueva base de datos
\c asociacion_musical;

# Otorgar permisos en el esquema public
GRANT ALL ON SCHEMA public TO sigesda_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sigesda_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sigesda_user;

# Verificar que todo está correcto
\du sigesda_user;
\l asociacion_musical;

# Salir
\q
exit
```

### Paso 2: Verificar la configuración
```bash
# Probar la conexión con el nuevo usuario
psql -U sigesda_user -d asociacion_musical -h localhost
# (Te pedirá la contraseña: SiGesda2024!)
```

### Paso 3: Ejecutar migraciones
Una vez configurado PostgreSQL, volver al proyecto y ejecutar:

```bash
# En el directorio del proyecto
cd /home/francisco/PROYECTOS/SIGESDA/SIGESDA-BACKEND

# Crear migración inicial
npm run db:migrate

# Poblar con datos de prueba
npm run db:seed

# Iniciar servidor
npm run dev
```

## Alternativa: Usar otro método de conexión

Si tienes problemas con el usuario `sigesda_user`, puedes:

1. **Usar el usuario postgres directamente** (si tienes la contraseña):
   ```bash
   # Editar .env
   DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/asociacion_musical?schema=public"
   ```

2. **Usar autenticación peer** (sin contraseña):
   ```bash
   # Editar .env para usar el usuario del sistema
   DATABASE_URL="postgresql://francisco@localhost:5432/asociacion_musical?schema=public"
   # (Requiere crear un usuario PostgreSQL llamado 'francisco')
   ```

## Verificación Final

Una vez configurado, ejecutar:
```bash
curl http://localhost:3001/health
```

Debería devolver:
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "database": "connected"
  }
}
```

---

**¿Necesitas ayuda con algún paso específico?** Una vez que configures PostgreSQL, podremos continuar con Phase 2 del proyecto.