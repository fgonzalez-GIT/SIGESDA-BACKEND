import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';

export const prisma = new PrismaClient();

/**
 * ============================================================================
 * TEST UTILITIES - Funciones helper para tests
 * ============================================================================
 */

/**
 * Crear instancia de supertest conectada a la app
 */
export const createTestApp = () => {
  return request(app);
};

/**
 * Limpiar todas las tablas de la base de datos
 * Orden inverso para respetar foreign keys
 */
export async function cleanDatabase() {
  await prisma.medioPago.deleteMany({});
  await prisma.cuota.deleteMany({});
  await prisma.recibo.deleteMany({});
  await prisma.participaciones_secciones.deleteMany({});
  await prisma.participacion_actividades.deleteMany({});
  await prisma.docentes_actividades.deleteMany({});
  await prisma.reservas_aulas_secciones.deleteMany({});
  await prisma.reserva_aulas.deleteMany({});
  await prisma.horarios_secciones.deleteMany({});
  await prisma.horarios_actividades.deleteMany({});
  await prisma.secciones_actividades.deleteMany({});
  await prisma.actividades.deleteMany({});
  await prisma.comisionDirectiva.deleteMany({});
  await prisma.familiar.deleteMany({});
  await prisma.contactoPersona.deleteMany({});
  await prisma.personaTipo.deleteMany({});
  await prisma.persona.deleteMany({});
}

/**
 * Limpiar solo catálogos
 */
export async function cleanCatalogos() {
  await prisma.configuracionSistema.deleteMany({});
  await prisma.especialidadDocente.deleteMany({});
  await prisma.tipoPersonaCatalogo.deleteMany({});
  await prisma.categoriaSocio.deleteMany({});
  await prisma.tipos_persona.deleteMany({});
  await prisma.roles_docentes.deleteMany({});
  await prisma.dias_semana.deleteMany({});
  await prisma.estados_actividades.deleteMany({});
  await prisma.categorias_actividades.deleteMany({});
  await prisma.tipos_actividades.deleteMany({});
}

/**
 * Seed mínimo de catálogos necesarios para tests
 */
export async function seedMinimalCatalogos() {
  // Tipos de actividades
  await prisma.tipos_actividades.createMany({
    data: [
      { codigo: 'CORO', nombre: 'Coro', activo: true, orden: 1 },
      { codigo: 'CLASE_INDIVIDUAL', nombre: 'Clase Individual', activo: true, orden: 2 }
    ]
  });

  // Categorías de socio
  await prisma.categoriaSocio.createMany({
    data: [
      { codigo: 'ACTIVO', nombre: 'Activo', montoCuota: 5000, descuento: 0, activa: true, orden: 1 },
      { codigo: 'JUBILADO', nombre: 'Jubilado', montoCuota: 5000, descuento: 30, activa: true, orden: 2 }
    ]
  });

  // Tipos de persona (V2)
  await prisma.tipoPersonaCatalogo.createMany({
    data: [
      { codigo: 'SOCIO', nombre: 'Socio', activo: true, orden: 1, requiresCategoria: true },
      { codigo: 'NO_SOCIO', nombre: 'No Socio', activo: true, orden: 2 },
      { codigo: 'DOCENTE', nombre: 'Docente', activo: true, orden: 3, requiresEspecialidad: true },
      { codigo: 'PROVEEDOR', nombre: 'Proveedor', activo: true, orden: 4, requiresCuit: true }
    ]
  });

  // Especialidades docentes
  await prisma.especialidadDocente.createMany({
    data: [
      { codigo: 'CANTO', nombre: 'Canto', activo: true, orden: 1 },
      { codigo: 'PIANO', nombre: 'Piano', activo: true, orden: 2 },
      { codigo: 'GUITARRA', nombre: 'Guitarra', activo: true, orden: 3 }
    ]
  });

  // Roles docentes
  await prisma.roles_docentes.createMany({
    data: [
      { codigo: 'TITULAR', nombre: 'Titular', activo: true, orden: 1 },
      { codigo: 'AUXILIAR', nombre: 'Auxiliar', activo: true, orden: 2 }
    ]
  });

  // Días de la semana
  await prisma.dias_semana.createMany({
    data: [
      { codigo: 'LUNES', nombre: 'Lunes', orden: 1 },
      { codigo: 'MARTES', nombre: 'Martes', orden: 2 },
      { codigo: 'MIERCOLES', nombre: 'Miércoles', orden: 3 },
      { codigo: 'JUEVES', nombre: 'Jueves', orden: 4 },
      { codigo: 'VIERNES', nombre: 'Viernes', orden: 5 }
    ]
  });
}

/**
 * Reset completo: limpia y crea seed mínimo
 */
export async function resetDatabase() {
  await cleanDatabase();
  await cleanCatalogos();
  await seedMinimalCatalogos();
}

/**
 * Desconectar Prisma client
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

/**
 * Generar DNI único aleatorio
 */
export function generateUniqueDNI(): string {
  const min = 20000000;
  const max = 45000000;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

/**
 * Generar email único
 */
export function generateUniqueEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}.${timestamp}.${random}@test.com`;
}

/**
 * Generar CUIT único
 */
export function generateUniqueCUIT(): string {
  const base = Math.floor(Math.random() * 100000000);
  return `20${base.toString().padStart(8, '0')}3`;
}

/**
 * Generar número de socio único
 */
export function generateNumeroSocio(): number {
  return Math.floor(Math.random() * 10000) + 1000;
}

/**
 * Esperar X milisegundos
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Assertion helper: verificar que respuesta tiene estructura esperada
 */
export function expectSuccessResponse(response: any, expectedStatus: number = 200) {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toBeDefined();
}

/**
 * Assertion helper: verificar error con código esperado
 */
export function expectErrorResponse(response: any, expectedStatus: number, expectedMessage?: string) {
  expect(response.status).toBe(expectedStatus);
  expect(response.body.error || response.body.message).toBeDefined();

  if (expectedMessage) {
    const errorMsg = response.body.error || response.body.message;
    expect(errorMsg.toLowerCase()).toContain(expectedMessage.toLowerCase());
  }
}

/**
 * Assertion helper: verificar paginación
 */
export function expectPaginatedResponse(response: any) {
  expect(response.body).toHaveProperty('data');
  expect(response.body).toHaveProperty('meta');
  expect(response.body.meta).toHaveProperty('total');
  expect(response.body.meta).toHaveProperty('page');
  expect(response.body.meta).toHaveProperty('limit');
  expect(Array.isArray(response.body.data)).toBe(true);
}

/**
 * Obtener IDs de catálogos para usar en tests
 */
export async function getCatalogoIds() {
  const [
    categoriaSocioActivo,
    categoriaSocioJubilado,
    tipoPersonaSocio,
    tipoPersonaDocente,
    tipoPersonaProveedor,
    especialidadCanto,
    especialidadPiano,
    rolDocente
  ] = await Promise.all([
    prisma.categoriaSocio.findFirst({ where: { codigo: 'ACTIVO' } }),
    prisma.categoriaSocio.findFirst({ where: { codigo: 'JUBILADO' } }),
    prisma.tipoPersonaCatalogo.findFirst({ where: { codigo: 'SOCIO' } }),
    prisma.tipoPersonaCatalogo.findFirst({ where: { codigo: 'DOCENTE' } }),
    prisma.tipoPersonaCatalogo.findFirst({ where: { codigo: 'PROVEEDOR' } }),
    prisma.especialidadDocente.findFirst({ where: { codigo: 'CANTO' } }),
    prisma.especialidadDocente.findFirst({ where: { codigo: 'PIANO' } }),
    prisma.roles_docentes.findFirst({ where: { codigo: 'TITULAR' } })
  ]);

  return {
    categoriaSocioActivoId: categoriaSocioActivo?.id,
    categoriaSocioJubiladoId: categoriaSocioJubilado?.id,
    tipoPersonaSocioId: tipoPersonaSocio?.id,
    tipoPersonaDocenteId: tipoPersonaDocente?.id,
    tipoPersonaProveedorId: tipoPersonaProveedor?.id,
    especialidadCantoId: especialidadCanto?.id,
    especialidadPianoId: especialidadPiano?.id,
    rolDocenteId: rolDocente?.id
  };
}

/**
 * Logging helper para debugging de tests
 */
export function logTestInfo(testName: string, data?: any) {
  if (process.env.DEBUG_TESTS === 'true') {
    console.log(`\n[TEST] ${testName}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

/**
 * Exports por defecto
 */
export default {
  prisma,
  createTestApp,
  cleanDatabase,
  cleanCatalogos,
  seedMinimalCatalogos,
  resetDatabase,
  disconnectPrisma,
  generateUniqueDNI,
  generateUniqueEmail,
  generateUniqueCUIT,
  generateNumeroSocio,
  sleep,
  expectSuccessResponse,
  expectErrorResponse,
  expectPaginatedResponse,
  getCatalogoIds,
  logTestInfo
};
