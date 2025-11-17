/**
 * ============================================================================
 * TEST CRUD ACTIVIDADES - COMPATIBILIDAD CON ARQUITECTURA PERSONA_TIPO V2
 * ============================================================================
 *
 * Este test valida:
 * 1. Creación de actividades con horarios y docentes
 * 2. Asignación de docentes (validando tipo DOCENTE activo)
 * 3. Obtención de docentes disponibles usando persona_tipo
 * 4. Gestión de participantes con validación de cupo
 * 5. Actualización y eliminación de actividades
 *
 * ARQUITECTURA VALIDADA:
 * - Docentes almacenados en persona_tipo (no en persona.tipo legacy)
 * - Validación de tipo DOCENTE activo antes de asignación
 * - Especialidad en persona_tipo.especialidadId
 * - HonorariosPorHora en persona_tipo.honorariosPorHora
 */

import axios, { AxiosError } from 'axios';

const BASE_URL = 'http://localhost:8000/api';
const ACTIVIDADES_URL = `${BASE_URL}/actividades`;
const PERSONAS_URL = `${BASE_URL}/personas`;

// ============================================================================
// UTILIDADES
// ============================================================================

interface TestResult {
  passed: number;
  failed: number;
  errors: string[];
}

const result: TestResult = {
  passed: 0,
  failed: 0,
  errors: []
};

function log(message: string, color: 'green' | 'red' | 'yellow' | 'blue' | 'cyan' = 'blue') {
  const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80) + '\n');
}

function logSuccess(message: string) {
  result.passed++;
  log(`✓ ${message}`, 'green');
}

function logError(message: string, error?: any) {
  result.failed++;
  const errorMsg = `✗ ${message}`;
  log(errorMsg, 'red');
  result.errors.push(errorMsg);

  if (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('  Status:', axiosError.response?.status);
      console.error('  Data:', JSON.stringify(axiosError.response?.data, null, 2));
    } else {
      console.error('  Error:', error.message || error);
    }
  }
}

function logInfo(message: string) {
  log(`  ℹ ${message}`, 'yellow');
}

// ============================================================================
// VARIABLES GLOBALES
// ============================================================================

let actividadCreada: any = null;
let docenteDisponible: any = null;
let socioParaInscribir: any = null;
let personaSinTipoDocente: any = null;

// ============================================================================
// TESTS
// ============================================================================

async function test1_obtenerDocentesDisponibles() {
  logSection('TEST 1: Obtener Docentes Disponibles (persona_tipo V2)');

  try {
    const response = await axios.get(`${ACTIVIDADES_URL}/docentes/disponibles`);

    if (response.status === 200 && response.data.success) {
      const docentes = response.data.data;

      logInfo(`Encontrados ${docentes.length} docentes disponibles`);

      if (docentes.length === 0) {
        logError('No se encontraron docentes. Verifica el seed.');
        return;
      }

      // Validar estructura de respuesta (compatible con persona_tipo)
      const primerDocente = docentes[0];

      if (!primerDocente.id || !primerDocente.nombre || !primerDocente.apellido) {
        logError('Estructura de docente inválida');
        return;
      }

      logSuccess(`Docentes disponibles obtenidos correctamente`);
      logInfo(`Ejemplo: ${primerDocente.nombre} ${primerDocente.apellido} - Especialidad: ${primerDocente.especialidad || 'N/A'}`);

      // Guardar primer docente para tests posteriores
      docenteDisponible = primerDocente;

    } else {
      logError('Respuesta inválida del servidor');
    }
  } catch (error) {
    logError('Error al obtener docentes disponibles', error);
  }
}

async function test2_crearActividadConDocente() {
  logSection('TEST 2: Crear Actividad con Docente Asignado');

  if (!docenteDisponible) {
    logError('No hay docente disponible del test anterior');
    return;
  }

  try {
    // Primero, obtener catálogos necesarios
    const catalogosResponse = await axios.get(`${ACTIVIDADES_URL}/catalogos/todos`);
    const catalogos = catalogosResponse.data.data;

    const tipoActividadId = catalogos.tipos[0]?.id;
    const categoriaId = catalogos.categorias[0]?.id;
    const estadoId = catalogos.estados.find((e: any) => e.codigo === 'ACTIVA')?.id || 2;
    const diaSemanaId = catalogos.diasSemana.find((d: any) => d.codigo === 'LUNES')?.id || 1;
    const rolDocenteId = catalogos.rolesDocentes.find((r: any) => r.codigo === 'TITULAR')?.id || 1;

    if (!tipoActividadId || !categoriaId || !estadoId) {
      logError('No se pudieron obtener IDs de catálogos');
      return;
    }

    const nuevaActividad = {
      codigoActividad: 'TEST-ACT-001',
      nombre: 'Actividad de Prueba CRUD',
      tipoActividadId,
      categoriaId,
      estadoId,
      descripcion: 'Actividad creada por test automático',
      fechaDesde: new Date().toISOString(),
      cupoMaximo: 10,
      costo: 1500.00,
      horarios: [
        {
          diaSemanaId,
          horaInicio: '10:00',
          horaFin: '12:00',
          activo: true
        }
      ],
      docentes: [
        {
          docenteId: docenteDisponible.id,
          rolDocenteId,
          observaciones: 'Docente titular asignado en creación'
        }
      ]
    };

    const response = await axios.post(ACTIVIDADES_URL, nuevaActividad);

    if (response.status === 201 && response.data.success) {
      actividadCreada = response.data.data;

      logSuccess('Actividad creada exitosamente');
      logInfo(`ID: ${actividadCreada.id}`);
      logInfo(`Nombre: ${actividadCreada.nombre}`);
      logInfo(`Horarios: ${actividadCreada.horarios_actividades?.length || 0}`);
      logInfo(`Docentes: ${actividadCreada.docentes_actividades?.length || 0}`);

    } else {
      logError('Error al crear actividad');
    }
  } catch (error) {
    logError('Error al crear actividad con docente', error);
  }
}

async function test3_validarAsignacionDocenteInvalido() {
  logSection('TEST 3: Validar Rechazo de Asignación con Persona sin Tipo DOCENTE');

  if (!actividadCreada) {
    logError('No hay actividad creada del test anterior');
    return;
  }

  try {
    // Crear una persona que NO sea DOCENTE
    const personaSinDocente = {
      nombre: 'Pedro',
      apellido: 'SinTipoDocente',
      dni: '99999999',
      email: 'pedro.sinDocente@test.com',
      tiposCodigos: ['NO_SOCIO']
    };

    const responsePersona = await axios.post(PERSONAS_URL, personaSinDocente);
    personaSinTipoDocente = responsePersona.data.data;

    logInfo(`Persona creada: ${personaSinTipoDocente.nombre} ${personaSinTipoDocente.apellido} (ID: ${personaSinTipoDocente.id})`);

    // Obtener rol docente
    const catalogosResponse = await axios.get(`${ACTIVIDADES_URL}/catalogos/todos`);
    const rolDocenteId = catalogosResponse.data.data.rolesDocentes[0]?.id || 1;

    // Intentar asignar persona sin tipo DOCENTE
    try {
      await axios.post(`${ACTIVIDADES_URL}/${actividadCreada.id}/docentes`, {
        docenteId: personaSinTipoDocente.id,
        rolDocenteId,
        observaciones: 'Intento de asignación inválida'
      });

      // Si llega aquí, el test FALLÓ (debería haber rechazado)
      logError('El sistema permitió asignar una persona sin tipo DOCENTE (DEBERÍA RECHAZAR)');

    } catch (errorAsignacion) {
      // Este error es ESPERADO
      if (axios.isAxiosError(errorAsignacion)) {
        const status = errorAsignacion.response?.status;
        const message = errorAsignacion.response?.data?.error;

        if (status === 400 && message?.includes('tipo DOCENTE')) {
          logSuccess('Sistema rechazó correctamente persona sin tipo DOCENTE');
          logInfo(`Mensaje: ${message}`);
        } else {
          logError('Error inesperado al rechazar asignación', errorAsignacion);
        }
      }
    }

  } catch (error) {
    logError('Error al validar asignación de docente inválido', error);
  }
}

async function test4_agregarParticipante() {
  logSection('TEST 4: Agregar Participante a Actividad');

  if (!actividadCreada) {
    logError('No hay actividad creada del test anterior');
    return;
  }

  try {
    // Crear un socio para inscribir
    const nuevoSocio = {
      nombre: 'María',
      apellido: 'ParticipanteTest',
      dni: '88888888',
      email: 'maria.test@test.com',
      tiposCodigos: ['SOCIO'],
      datosEspecificos: {
        categoriaId: 1
      }
    };

    const responseSocio = await axios.post(PERSONAS_URL, nuevoSocio);
    socioParaInscribir = responseSocio.data.data;

    logInfo(`Socio creado: ${socioParaInscribir.nombre} ${socioParaInscribir.apellido}`);

    // Inscribir en actividad
    const responseInscripcion = await axios.post(
      `${ACTIVIDADES_URL}/${actividadCreada.id}/participantes`,
      {
        persona_id: socioParaInscribir.id,
        fecha_inicio: new Date().toISOString(),
        observaciones: 'Inscripción de prueba'
      }
    );

    if (responseInscripcion.status === 201 && responseInscripcion.data.success) {
      logSuccess('Participante agregado exitosamente');
      logInfo(`Participante: ${socioParaInscribir.nombre} ${socioParaInscribir.apellido}`);
    } else {
      logError('Error al agregar participante');
    }

  } catch (error) {
    logError('Error al agregar participante', error);
  }
}

async function test5_validarCupoMaximo() {
  logSection('TEST 5: Validar Capacidad Máxima de Actividad');

  if (!actividadCreada) {
    logError('No hay actividad creada del test anterior');
    return;
  }

  try {
    // Obtener estadísticas de la actividad
    const responseStats = await axios.get(`${ACTIVIDADES_URL}/${actividadCreada.id}/estadisticas`);
    const stats = responseStats.data.data;

    logInfo(`Capacidad: ${stats.totalParticipantes} / ${stats.cupoMaximo}`);
    logInfo(`Cupo disponible: ${stats.cupoDisponible}`);
    logInfo(`Porcentaje ocupación: ${stats.porcentajeOcupacion}%`);

    if (stats.cupoMaximo !== null && stats.totalParticipantes <= stats.cupoMaximo) {
      logSuccess('Validación de cupo funcionando correctamente');
    } else {
      logError('Problema con validación de cupo');
    }

  } catch (error) {
    logError('Error al validar cupo máximo', error);
  }
}

async function test6_listarActividades() {
  logSection('TEST 6: Listar Actividades con Filtros');

  try {
    // Listar todas las actividades
    const response = await axios.get(ACTIVIDADES_URL, {
      params: {
        page: 1,
        limit: 10,
        incluirRelaciones: true
      }
    });

    if (response.status === 200 && response.data.success) {
      const actividades = response.data.data.data;
      const total = response.data.data.total;

      logSuccess(`Actividades listadas: ${total} total`);
      logInfo(`Página actual: ${actividades.length} actividades`);

      if (actividades.length > 0) {
        const primera = actividades[0];
        logInfo(`Ejemplo: ${primera.nombre} - Tipo: ${primera.tipo || 'N/A'}`);
      }
    } else {
      logError('Error al listar actividades');
    }

  } catch (error) {
    logError('Error al listar actividades', error);
  }
}

async function test7_obtenerActividadDetalle() {
  logSection('TEST 7: Obtener Detalle de Actividad');

  if (!actividadCreada) {
    logError('No hay actividad creada del test anterior');
    return;
  }

  try {
    const response = await axios.get(`${ACTIVIDADES_URL}/${actividadCreada.id}`);

    if (response.status === 200 && response.data.success) {
      const actividad = response.data.data;

      logSuccess('Detalle de actividad obtenido');
      logInfo(`Nombre: ${actividad.nombre}`);
      logInfo(`Horarios: ${actividad.horarios_actividades?.length || 0}`);
      logInfo(`Docentes: ${actividad.docentes_actividades?.length || 0}`);
      logInfo(`Participantes: ${actividad.participacion_actividades?.length || 0}`);
    } else {
      logError('Error al obtener detalle');
    }

  } catch (error) {
    logError('Error al obtener detalle de actividad', error);
  }
}

async function test8_actualizarActividad() {
  logSection('TEST 8: Actualizar Actividad');

  if (!actividadCreada) {
    logError('No hay actividad creada del test anterior');
    return;
  }

  try {
    const datosActualizacion = {
      nombre: 'Actividad de Prueba CRUD - ACTUALIZADA',
      descripcion: 'Descripción actualizada por test',
      costo: 2000.00
    };

    const response = await axios.patch(
      `${ACTIVIDADES_URL}/${actividadCreada.id}`,
      datosActualizacion
    );

    if (response.status === 200 && response.data.success) {
      const actualizada = response.data.data;

      logSuccess('Actividad actualizada exitosamente');
      logInfo(`Nuevo nombre: ${actualizada.nombre}`);
      logInfo(`Nuevo costo: ${actualizada.precio || actualizada.costo}`);
    } else {
      logError('Error al actualizar actividad');
    }

  } catch (error) {
    logError('Error al actualizar actividad', error);
  }
}

async function test9_eliminarActividad() {
  logSection('TEST 9: Eliminar Actividad (con participantes activos)');

  if (!actividadCreada) {
    logError('No hay actividad creada del test anterior');
    return;
  }

  try {
    // Primero intentar eliminar CON participantes (debe fallar)
    try {
      await axios.delete(`${ACTIVIDADES_URL}/${actividadCreada.id}`);
      logError('Sistema permitió eliminar actividad con participantes (DEBERÍA RECHAZAR)');
    } catch (errorEliminacion) {
      if (axios.isAxiosError(errorEliminacion)) {
        const status = errorEliminacion.response?.status;
        const message = errorEliminacion.response?.data?.error;

        if (status === 400 && message?.includes('participantes')) {
          logSuccess('Sistema rechazó correctamente eliminación con participantes');
          logInfo(`Mensaje: ${message}`);
        } else {
          logError('Error inesperado al intentar eliminar', errorEliminacion);
        }
      }
    }

    // Ahora eliminar el participante primero
    if (socioParaInscribir) {
      const participantes = await axios.get(`${ACTIVIDADES_URL}/${actividadCreada.id}/participantes`);
      const participanteAEliminar = participantes.data.data.find(
        (p: any) => p.personaId === socioParaInscribir.id
      );

      if (participanteAEliminar) {
        await axios.delete(
          `${ACTIVIDADES_URL}/${actividadCreada.id}/participantes/${participanteAEliminar.id}`
        );
        logInfo('Participante eliminado');
      }
    }

    // Ahora intentar eliminar la actividad sin participantes
    const responseEliminar = await axios.delete(`${ACTIVIDADES_URL}/${actividadCreada.id}`);

    if (responseEliminar.status === 200 && responseEliminar.data.success) {
      logSuccess('Actividad eliminada exitosamente');
    } else {
      logError('Error al eliminar actividad');
    }

  } catch (error) {
    logError('Error en prueba de eliminación', error);
  }
}

// ============================================================================
// EJECUTAR TESTS
// ============================================================================

async function runAllTests() {
  log('\n🧪 INICIANDO TESTS CRUD ACTIVIDADES - ARQUITECTURA PERSONA_TIPO V2\n', 'cyan');

  await test1_obtenerDocentesDisponibles();
  await test2_crearActividadConDocente();
  await test3_validarAsignacionDocenteInvalido();
  await test4_agregarParticipante();
  await test5_validarCupoMaximo();
  await test6_listarActividades();
  await test7_obtenerActividadDetalle();
  await test8_actualizarActividad();
  await test9_eliminarActividad();

  // RESUMEN
  logSection('RESUMEN DE TESTS');
  log(`✓ Tests pasados: ${result.passed}`, result.passed > 0 ? 'green' : 'yellow');
  log(`✗ Tests fallidos: ${result.failed}`, result.failed > 0 ? 'red' : 'green');

  if (result.errors.length > 0) {
    log('\nErrores encontrados:', 'red');
    result.errors.forEach(err => log(`  - ${err}`, 'red'));
  }

  const exitCode = result.failed > 0 ? 1 : 0;
  process.exit(exitCode);
}

// Ejecutar
runAllTests();
