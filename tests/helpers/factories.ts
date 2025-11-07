/**
 * ============================================================================
 * FACTORIES - Builders para crear datos de test dinámicamente
 * ============================================================================
 * Funciones para crear objetos con datos aleatorios pero válidos
 * ============================================================================
 */

import { prisma } from './testUtils';
import {
  generateUniqueDNI,
  generateUniqueEmail,
  generateUniqueCUIT,
  generateNumeroSocio
} from './testUtils';
import { TipoParentesco, TipoContacto, MedioPagoTipo, TipoRecibo, EstadoRecibo } from '@prisma/client';

/**
 * PERSONA FACTORY
 */
export async function createPersona(overrides: any = {}) {
  const defaultData = {
    nombre: 'Test',
    apellido: 'User',
    dni: generateUniqueDNI(),
    email: generateUniqueEmail(),
    telefono: '1234567890',
    direccion: 'Calle Test 123',
    fechaNacimiento: new Date('1990-01-01')
  };

  return await prisma.persona.create({
    data: { ...defaultData, ...overrides }
  });
}

/**
 * PERSONA CON TIPO - SOCIO
 */
export async function createSocio(categoriaId: number, overrides: any = {}) {
  // Crear persona base
  const persona = await createPersona(overrides.personaData || {});

  // Obtener tipo SOCIO
  const tipoSocio = await prisma.tipoPersonaCatalogo.findFirst({
    where: { codigo: 'SOCIO' }
  });

  if (!tipoSocio) {
    throw new Error('Tipo SOCIO no encontrado en catálogos');
  }

  // Asignar tipo
  const personaTipo = await prisma.personaTipo.create({
    data: {
      personaId: persona.id,
      tipoPersonaId: tipoSocio.id,
      categoriaId,
      numeroSocio: overrides.numeroSocio || generateNumeroSocio(),
      fechaIngreso: overrides.fechaIngreso || new Date(),
      activo: true
    }
  });

  return { persona, personaTipo };
}

/**
 * PERSONA CON TIPO - DOCENTE
 */
export async function createDocente(especialidadId: number, overrides: any = {}) {
  const persona = await createPersona(overrides.personaData || {});

  const tipoDocente = await prisma.tipoPersonaCatalogo.findFirst({
    where: { codigo: 'DOCENTE' }
  });

  if (!tipoDocente) {
    throw new Error('Tipo DOCENTE no encontrado en catálogos');
  }

  const personaTipo = await prisma.personaTipo.create({
    data: {
      personaId: persona.id,
      tipoPersonaId: tipoDocente.id,
      especialidadId,
      honorariosPorHora: overrides.honorariosPorHora || 3500.00,
      activo: true
    }
  });

  return { persona, personaTipo };
}

/**
 * PERSONA CON TIPO - PROVEEDOR
 */
export async function createProveedor(overrides: any = {}) {
  const persona = await createPersona(overrides.personaData || {});

  const tipoProveedor = await prisma.tipoPersonaCatalogo.findFirst({
    where: { codigo: 'PROVEEDOR' }
  });

  if (!tipoProveedor) {
    throw new Error('Tipo PROVEEDOR no encontrado en catálogos');
  }

  const personaTipo = await prisma.personaTipo.create({
    data: {
      personaId: persona.id,
      tipoPersonaId: tipoProveedor.id,
      cuit: overrides.cuit || generateUniqueCUIT(),
      razonSocial: overrides.razonSocial || 'Empresa Test SRL',
      activo: true
    }
  });

  return { persona, personaTipo };
}

/**
 * CONTACTO FACTORY
 */
export async function createContacto(personaId: number, overrides: any = {}) {
  const defaultData = {
    personaId,
    tipoContacto: TipoContacto.EMAIL,
    valor: generateUniqueEmail(),
    principal: false,
    activo: true
  };

  return await prisma.contactoPersona.create({
    data: { ...defaultData, ...overrides }
  });
}

/**
 * FAMILIAR FACTORY
 */
export async function createFamiliar(socioId: number, familiarId: number, overrides: any = {}) {
  const defaultData = {
    socioId,
    familiarId,
    parentesco: TipoParentesco.HIJO,
    activo: true
  };

  return await prisma.familiar.create({
    data: { ...defaultData, ...overrides }
  });
}

/**
 * ACTIVIDAD FACTORY
 */
export async function createActividad(overrides: any = {}) {
  const defaultData = {
    nombre: `Actividad Test ${Date.now()}`,
    tipo: 'CORO' as any,
    descripcion: 'Actividad de prueba',
    precio: 2000.00,
    duracion: 60,
    capacidadMaxima: 20,
    activa: true
  };

  return await prisma.actividades.create({
    data: { ...defaultData, ...overrides }
  });
}

/**
 * SECCIÓN FACTORY
 */
export async function createSeccion(actividadId: number, overrides: any = {}) {
  const defaultData = {
    actividadId,
    nombre: `Sección ${Date.now()}`,
    codigo: `SEC-${Date.now()}`,
    capacidadMaxima: 20,
    activa: true,
    updatedAt: new Date()
  };

  return await prisma.secciones_actividades.create({
    data: { ...defaultData, ...overrides }
  });
}

/**
 * AULA FACTORY
 */
export async function createAula(overrides: any = {}) {
  const defaultData = {
    nombre: `Aula Test ${Date.now()}`,
    capacidad: 30,
    ubicacion: 'Test',
    activa: true
  };

  return await prisma.aula.create({
    data: { ...defaultData, ...overrides }
  });
}

/**
 * RECIBO FACTORY
 */
export async function createRecibo(receptorId: number, overrides: any = {}) {
  const defaultData = {
    numero: `TEST-${Date.now()}`,
    tipo: TipoRecibo.CUOTA,
    importe: 5000.00,
    fecha: new Date(),
    fechaVencimiento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    estado: EstadoRecibo.PENDIENTE,
    concepto: 'Recibo de prueba',
    receptorId
  };

  return await prisma.recibo.create({
    data: { ...defaultData, ...overrides }
  });
}

/**
 * CUOTA FACTORY
 */
export async function createCuota(reciboId: number, categoriaId: number, overrides: any = {}) {
  const now = new Date();
  const defaultData = {
    reciboId,
    categoriaId,
    mes: now.getMonth() + 1,
    anio: now.getFullYear(),
    montoBase: 5000.00,
    montoActividades: 0.00,
    montoTotal: 5000.00
  };

  return await prisma.cuota.create({
    data: { ...defaultData, ...overrides }
  });
}

/**
 * MEDIO DE PAGO FACTORY
 */
export async function createMedioPago(reciboId: number, overrides: any = {}) {
  const defaultData = {
    reciboId,
    tipo: MedioPagoTipo.EFECTIVO,
    importe: 5000.00,
    fecha: new Date(),
    observaciones: 'Pago de prueba'
  };

  return await prisma.medioPago.create({
    data: { ...defaultData, ...overrides }
  });
}

/**
 * PARTICIPACIÓN FACTORY
 */
export async function createParticipacion(personaId: number, seccionId: number, overrides: any = {}) {
  const defaultData = {
    personaId,
    seccionId,
    fechaInicio: new Date(),
    activa: true,
    updatedAt: new Date()
  };

  return await prisma.participaciones_secciones.create({
    data: { ...defaultData, ...overrides }
  });
}

/**
 * CATEGORÍA SOCIO FACTORY
 */
export async function createCategoriaSocio(overrides: any = {}) {
  const defaultData = {
    codigo: `CAT-${Date.now()}`,
    nombre: `Categoría ${Date.now()}`,
    montoCuota: 5000.00,
    descuento: 0.00,
    activa: true,
    orden: 99
  };

  return await prisma.categoriaSocio.create({
    data: { ...defaultData, ...overrides }
  });
}

/**
 * BATCH FACTORIES - Crear múltiples registros
 */

export async function createMultiplePersonas(count: number, overrides: any = {}) {
  const personas = [];
  for (let i = 0; i < count; i++) {
    personas.push(await createPersona({
      ...overrides,
      nombre: `Test${i}`,
      apellido: `User${i}`
    }));
  }
  return personas;
}

export async function createMultipleSocios(count: number, categoriaId: number, overrides: any = {}) {
  const socios = [];
  for (let i = 0; i < count; i++) {
    socios.push(await createSocio(categoriaId, {
      ...overrides,
      personaData: {
        ...overrides.personaData,
        nombre: `Socio${i}`,
        apellido: `Test${i}`
      }
    }));
  }
  return socios;
}

/**
 * CLEANUP HELPERS - Útiles para limpiar después de tests
 */
export async function deletePersona(id: number) {
  await prisma.persona.delete({ where: { id } });
}

export async function deleteActividad(id: number) {
  await prisma.actividades.delete({ where: { id } });
}

export async function deleteRecibo(id: number) {
  await prisma.recibo.delete({ where: { id } });
}

/**
 * Export de todas las factories
 */
export default {
  createPersona,
  createSocio,
  createDocente,
  createProveedor,
  createContacto,
  createFamiliar,
  createActividad,
  createSeccion,
  createAula,
  createRecibo,
  createCuota,
  createMedioPago,
  createParticipacion,
  createCategoriaSocio,
  createMultiplePersonas,
  createMultipleSocios,
  deletePersona,
  deleteActividad,
  deleteRecibo
};
