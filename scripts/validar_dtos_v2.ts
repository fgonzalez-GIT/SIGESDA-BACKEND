/**
 * Script de Validación de DTOs V2
 *
 * Este script valida los nuevos DTOs creados para el modelo rediseñado
 * de actividades, probando casos válidos e inválidos.
 */

import {
  createActividadSchema,
  updateActividadSchema,
  queryActividadesSchema,
  duplicarActividadSchema,
  cambiarEstadoActividadSchema
} from '../src/dto/actividad-v2.dto';

import {
  createHorarioActividadSchema,
  updateHorarioActividadSchema,
  verificarConflictoHorarioSchema
} from '../src/dto/horario-actividad.dto';

import {
  createDocenteActividadSchema,
  updateDocenteActividadSchema,
  asignarMultiplesDocentesSchema
} from '../src/dto/docente-actividad.dto';

import {
  createParticipacionActividadSchema,
  updateParticipacionActividadSchema,
  inscribirMultiplesAlumnosSchema
} from '../src/dto/participacion-actividad.dto';

import {
  createReservaAulaActividadSchema,
  verificarDisponibilidadAulaSchema
} from '../src/dto/reserva-aula-actividad.dto';

import {
  createTipoActividadSchema,
  createCategoriaActividadSchema,
  createEstadoActividadSchema,
  createRolDocenteSchema
} from '../src/dto/catalogos-actividades.dto';

// ============================================================================
// UTILIDADES
// ============================================================================

let testsPasados = 0;
let testsFallados = 0;

function testValidacion(nombre: string, schema: any, data: any, debeSerValido: boolean = true) {
  try {
    const resultado = schema.parse(data);
    if (debeSerValido) {
      console.log(`✅ ${nombre}: VÁLIDO`);
      testsPasados++;
      return resultado;
    } else {
      console.log(`❌ ${nombre}: DEBERÍA SER INVÁLIDO pero pasó`);
      testsFallados++;
      return null;
    }
  } catch (error: any) {
    if (!debeSerValido) {
      console.log(`✅ ${nombre}: INVÁLIDO (como se esperaba)`);
      console.log(`   Razón: ${error.errors[0]?.message || 'Error de validación'}`);
      testsPasados++;
      return null;
    } else {
      console.log(`❌ ${nombre}: FALLÓ INESPERADAMENTE`);
      console.log(`   Error: ${error.errors[0]?.message || 'Error desconocido'}`);
      testsFallados++;
      return null;
    }
  }
}

// ============================================================================
// TESTS: CATÁLOGOS
// ============================================================================

console.log('\n========================================');
console.log('VALIDACIÓN DE DTOs - CATÁLOGOS');
console.log('========================================\n');

// Tipo de Actividad válido
testValidacion('Crear Tipo de Actividad - Válido', createTipoActividadSchema, {
  codigo: 'CORO',
  nombre: 'Coro',
  descripcion: 'Actividades de coro grupal',
  activo: true,
  orden: 1
});

// Tipo de Actividad inválido (código con minúsculas)
testValidacion('Crear Tipo de Actividad - Código inválido', createTipoActividadSchema, {
  codigo: 'coro',
  nombre: 'Coro'
}, false);

// Categoría de Actividad válida
testValidacion('Crear Categoría - Válida', createCategoriaActividadSchema, {
  codigo: 'CORO_ADULTOS',
  nombre: 'Coro Adultos',
  descripcion: 'Coro para adultos mayores de 18 años',
  activo: true,
  orden: 1
});

// Estado de Actividad válido
testValidacion('Crear Estado - Válido', createEstadoActividadSchema, {
  codigo: 'ACTIVA',
  nombre: 'Activa',
  descripcion: 'Actividad en curso',
  activo: true,
  orden: 1
});

// Rol Docente válido
testValidacion('Crear Rol Docente - Válido', createRolDocenteSchema, {
  codigo: 'TITULAR',
  nombre: 'Titular',
  descripcion: 'Docente titular de la actividad',
  activo: true,
  orden: 1
});

// ============================================================================
// TESTS: ACTIVIDADES
// ============================================================================

console.log('\n========================================');
console.log('VALIDACIÓN DE DTOs - ACTIVIDADES');
console.log('========================================\n');

// Actividad válida completa
testValidacion('Crear Actividad - Válida completa', createActividadSchema, {
  codigoActividad: 'CORO-ADU-2025-A',
  nombre: 'Coro Adultos 2025',
  tipoActividadId: 1,
  categoriaId: 1,
  estadoId: 1,
  descripcion: 'Coro para adultos con experiencia previa',
  fechaDesde: '2025-01-01T00:00:00.000Z',
  fechaHasta: '2025-12-31T23:59:59.000Z',
  cupoMaximo: 40,
  costo: 0,
  observaciones: 'Requiere audición previa',
  horarios: [
    {
      diaSemanaId: 1, // LUNES
      horaInicio: '18:00',
      horaFin: '20:00',
      activo: true
    },
    {
      diaSemanaId: 3, // MIERCOLES
      horaInicio: '18:00',
      horaFin: '20:00',
      activo: true
    }
  ],
  docentes: [
    {
      docenteId: 'clw123456789abcdef',
      rolDocenteId: 1, // TITULAR
      observaciones: 'Docente principal'
    }
  ]
});

// Actividad con fechas incoherentes
testValidacion('Crear Actividad - Fechas inválidas', createActividadSchema, {
  codigoActividad: 'PIANO-2025-A',
  nombre: 'Piano Inicial',
  tipoActividadId: 3,
  categoriaId: 2,
  estadoId: 1,
  fechaDesde: '2025-12-31T00:00:00.000Z',
  fechaHasta: '2025-01-01T00:00:00.000Z', // Fecha hasta menor que desde
  costo: 5000
}, false);

// Actividad con código inválido
testValidacion('Crear Actividad - Código inválido', createActividadSchema, {
  codigoActividad: 'coro-adu-2025-a', // Minúsculas
  nombre: 'Coro Adultos 2025',
  tipoActividadId: 1,
  categoriaId: 1,
  estadoId: 1,
  fechaDesde: '2025-01-01T00:00:00.000Z',
  costo: 0
}, false);

// Actualizar actividad - válido
testValidacion('Actualizar Actividad - Válido', updateActividadSchema, {
  nombre: 'Coro Adultos 2025 - Actualizado',
  costo: 1000,
  cupoMaximo: 45
});

// Query actividades - válido
const queryResult = testValidacion('Query Actividades - Válido', queryActividadesSchema, {
  tipoActividadId: '1',
  estadoId: '1',
  conCupo: 'true',
  incluirRelaciones: 'true',
  page: '1',
  limit: '10',
  orderBy: 'nombre',
  orderDir: 'asc'
});

if (queryResult) {
  console.log('   Resultado parseado:', JSON.stringify(queryResult, null, 2));
}

// Duplicar actividad - válido
testValidacion('Duplicar Actividad - Válido', duplicarActividadSchema, {
  nuevoCodigoActividad: 'CORO-ADU-2026-A',
  nuevoNombre: 'Coro Adultos 2026',
  nuevaFechaDesde: '2026-01-01T00:00:00.000Z',
  nuevaFechaHasta: '2026-12-31T23:59:59.000Z',
  copiarHorarios: true,
  copiarDocentes: true,
  copiarReservasAulas: false
});

// Cambiar estado - válido
testValidacion('Cambiar Estado - Válido', cambiarEstadoActividadSchema, {
  nuevoEstadoId: 2,
  observaciones: 'Actividad finalizada por fin de ciclo'
});

// ============================================================================
// TESTS: HORARIOS
// ============================================================================

console.log('\n========================================');
console.log('VALIDACIÓN DE DTOs - HORARIOS');
console.log('========================================\n');

// Horario válido
testValidacion('Crear Horario - Válido', createHorarioActividadSchema, {
  actividadId: 1,
  diaSemanaId: 1,
  horaInicio: '18:00',
  horaFin: '20:00',
  activo: true
});

// Horario con hora fin menor que hora inicio
testValidacion('Crear Horario - Horas inválidas', createHorarioActividadSchema, {
  actividadId: 1,
  diaSemanaId: 1,
  horaInicio: '20:00',
  horaFin: '18:00', // Menor que inicio
  activo: true
}, false);

// Horario con día inválido
testValidacion('Crear Horario - Día inválido', createHorarioActividadSchema, {
  actividadId: 1,
  diaSemanaId: 8, // No existe
  horaInicio: '18:00',
  horaFin: '20:00',
  activo: true
}, false);

// Verificar conflicto - válido
testValidacion('Verificar Conflicto - Válido', verificarConflictoHorarioSchema, {
  actividadId: 1,
  diaSemanaId: 1,
  horaInicio: '18:00',
  horaFin: '20:00',
  aulaId: 'clw123456789abcdef',
  docenteId: 'clw987654321fedcba'
});

// ============================================================================
// TESTS: DOCENTES
// ============================================================================

console.log('\n========================================');
console.log('VALIDACIÓN DE DTOs - DOCENTES');
console.log('========================================\n');

// Docente válido
testValidacion('Asignar Docente - Válido', createDocenteActividadSchema, {
  actividadId: 1,
  docenteId: 'clw123456789abcdef',
  rolDocenteId: 1,
  fechaAsignacion: '2025-01-01T00:00:00.000Z',
  activo: true,
  observaciones: 'Docente titular'
});

// Docente con fechas incoherentes
testValidacion('Asignar Docente - Fechas inválidas', createDocenteActividadSchema, {
  actividadId: 1,
  docenteId: 'clw123456789abcdef',
  rolDocenteId: 1,
  fechaAsignacion: '2025-12-31T00:00:00.000Z',
  fechaDesasignacion: '2025-01-01T00:00:00.000Z', // Menor que asignación
  activo: false
}, false);

// Asignar múltiples docentes - válido
testValidacion('Asignar Múltiples Docentes - Válido', asignarMultiplesDocentesSchema, {
  actividadId: 1,
  docentes: [
    {
      docenteId: 'clw123456789abcdef',
      rolDocenteId: 1,
      observaciones: 'Titular'
    },
    {
      docenteId: 'clw987654321fedcba',
      rolDocenteId: 2,
      observaciones: 'Suplente'
    }
  ]
});

// ============================================================================
// TESTS: PARTICIPACIONES
// ============================================================================

console.log('\n========================================');
console.log('VALIDACIÓN DE DTOs - PARTICIPACIONES');
console.log('========================================\n');

// Participación válida
testValidacion('Crear Participación - Válida', createParticipacionActividadSchema, {
  personaId: 'clw123456789abcdef',
  actividadId: 1,
  fechaInicio: '2025-01-01T00:00:00.000Z',
  fechaFin: '2025-12-31T23:59:59.000Z',
  precioEspecial: 800,
  activo: true,
  observaciones: 'Descuento por hermano'
});

// Participación con precio negativo
testValidacion('Crear Participación - Precio negativo', createParticipacionActividadSchema, {
  personaId: 'clw123456789abcdef',
  actividadId: 1,
  fechaInicio: '2025-01-01T00:00:00.000Z',
  precioEspecial: -100,
  activo: true
}, false);

// Inscribir múltiples alumnos - válido
testValidacion('Inscribir Múltiples Alumnos - Válido', inscribirMultiplesAlumnosSchema, {
  actividadId: 1,
  alumnos: [
    {
      personaId: 'clw123456789abcdef',
      fechaInicio: '2025-01-01T00:00:00.000Z',
      precioEspecial: 800
    },
    {
      personaId: 'clw987654321fedcba',
      fechaInicio: '2025-01-01T00:00:00.000Z',
      precioEspecial: null
    }
  ]
});

// ============================================================================
// TESTS: RESERVAS DE AULAS
// ============================================================================

console.log('\n========================================');
console.log('VALIDACIÓN DE DTOs - RESERVAS DE AULAS');
console.log('========================================\n');

// Reserva válida
testValidacion('Crear Reserva Aula - Válida', createReservaAulaActividadSchema, {
  horarioId: 1,
  aulaId: 'clw123456789abcdef',
  fechaVigenciaDesde: '2025-01-01T00:00:00.000Z',
  fechaVigenciaHasta: '2025-12-31T23:59:59.000Z',
  observaciones: 'Aula principal'
});

// Verificar disponibilidad - válido
testValidacion('Verificar Disponibilidad Aula - Válido', verificarDisponibilidadAulaSchema, {
  aulaId: 'clw123456789abcdef',
  diaSemanaId: 1,
  horaInicio: '18:00',
  horaFin: '20:00',
  fechaVigenciaDesde: '2025-01-01T00:00:00.000Z',
  fechaVigenciaHasta: '2025-12-31T23:59:59.000Z'
});

// ============================================================================
// RESUMEN
// ============================================================================

console.log('\n========================================');
console.log('RESUMEN DE VALIDACIÓN');
console.log('========================================\n');

const total = testsPasados + testsFallados;
const porcentaje = ((testsPasados / total) * 100).toFixed(2);

console.log(`Tests ejecutados: ${total}`);
console.log(`Tests pasados: ${testsPasados} (${porcentaje}%)`);
console.log(`Tests fallados: ${testsFallados}`);

if (testsFallados === 0) {
  console.log('\n✅ TODOS LOS TESTS PASARON EXITOSAMENTE\n');
  process.exit(0);
} else {
  console.log('\n❌ ALGUNOS TESTS FALLARON\n');
  process.exit(1);
}
