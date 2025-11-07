import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';

const execAsync = promisify(exec);

/**
 * ============================================================================
 * GLOBAL SETUP - JEST
 * ============================================================================
 * Este archivo se ejecuta UNA VEZ antes de todos los tests
 * Inicializa la base de datos de testing
 * ============================================================================
 */

export default async function globalSetup() {
  console.log('\n🚀 Iniciando setup global de tests...\n');

  // Cargar variables de entorno
  dotenv.config();

  try {
    // Verificar que estamos en entorno de testing
    if (process.env.NODE_ENV !== 'test' && !process.env.DATABASE_URL?.includes('test')) {
      console.warn('⚠️  WARNING: Parece que no estás en entorno de testing!');
      console.warn('   DATABASE_URL:', process.env.DATABASE_URL);
      console.warn('   NODE_ENV:', process.env.NODE_ENV);
    }

    // Reset de base de datos (migración + seed)
    console.log('📦 Reseteando base de datos de testing...');
    await execAsync('npx prisma migrate reset --force --skip-seed');

    console.log('🌱 Ejecutando seed de datos de prueba...');
    await execAsync('npx prisma db seed');

    console.log('✅ Setup global completado\n');
  } catch (error) {
    console.error('❌ Error en setup global:', error);
    throw error;
  }
}
