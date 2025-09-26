const { Client } = require('pg');
require('dotenv').config();

async function checkDatabase() {
  console.log('🔍 Verificando configuración de base de datos...\n');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL no encontrada en .env');
    return;
  }

  console.log('📋 URL de conexión:', connectionString.replace(/:[^:@]*@/, ':****@'));

  const client = new Client({
    connectionString
  });

  try {
    // Intentar conectar
    console.log('🔌 Intentando conectar...');
    await client.connect();
    console.log('✅ Conexión exitosa!');

    // Verificar versión de PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('🐘 Versión PostgreSQL:', versionResult.rows[0].version);

    // Verificar base de datos actual
    const dbResult = await client.query('SELECT current_database()');
    console.log('🗄️ Base de datos actual:', dbResult.rows[0].current_database);

    // Verificar usuario actual
    const userResult = await client.query('SELECT current_user');
    console.log('👤 Usuario actual:', userResult.rows[0].current_user);

    // Verificar esquemas disponibles
    const schemaResult = await client.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
    `);
    console.log('📂 Esquemas disponibles:', schemaResult.rows.map(r => r.schema_name).join(', '));

    // Verificar si existen tablas (después de migración)
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);

    if (tablesResult.rows.length > 0) {
      console.log('📋 Tablas existentes:', tablesResult.rows.map(r => r.table_name).join(', '));

      // Contar registros en tabla personas si existe
      const personasExists = tablesResult.rows.find(r => r.table_name === 'personas');
      if (personasExists) {
        const countResult = await client.query('SELECT COUNT(*) FROM personas');
        console.log('👥 Registros en tabla personas:', countResult.rows[0].count);
      }
    } else {
      console.log('📋 No hay tablas creadas aún (ejecutar: npm run db:migrate)');
    }

    console.log('\n✅ Verificación completada exitosamente!');
    console.log('🚀 La base de datos está lista para usar.');

  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Verificar que PostgreSQL esté ejecutándose: systemctl status postgresql');
      console.log('   2. Verificar el puerto (default: 5432)');
      console.log('   3. Verificar la configuración de firewall');
    } else if (error.code === '28P01') {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Verificar usuario y contraseña en DATABASE_URL');
      console.log('   2. Crear usuario: CREATE USER sigesda_user WITH PASSWORD \'SiGesda2024!\';');
    } else if (error.code === '3D000') {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Crear base de datos: CREATE DATABASE asociacion_musical;');
      console.log('   2. Verificar el nombre de la base de datos en DATABASE_URL');
    }
  } finally {
    await client.end();
  }
}

checkDatabase();