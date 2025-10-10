import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { SeccionController } from '@/controllers/seccion.controller';

const prisma = new PrismaClient();
const controller = new SeccionController(prisma);

const router = Router();

// ============================================================================
// CRUD DE SECCIONES
// ============================================================================

/**
 * @route   POST /api/secciones
 * @desc    Crear nueva sección
 * @access  Public
 */
router.post('/', controller.createSeccion);

/**
 * @route   GET /api/secciones
 * @desc    Listar secciones con filtros y paginación
 * @access  Public
 * @query   actividadId, activa, search, page, limit
 */
router.get('/', controller.listSecciones);

/**
 * @route   GET /api/secciones/horario-semanal
 * @desc    Obtener horario semanal de todas las secciones
 * @access  Public
 */
router.get('/horario-semanal', controller.getHorarioSemanal);

/**
 * @route   GET /api/secciones/ocupacion
 * @desc    Obtener ocupación global de secciones
 * @access  Public
 */
router.get('/ocupacion', controller.getOcupacionSecciones);

/**
 * @route   POST /api/secciones/verificar-conflictos
 * @desc    Verificar conflictos de horarios de docente/aula
 * @access  Public
 */
router.post('/verificar-conflictos', controller.verificarConflictos);

/**
 * @route   GET /api/secciones/:id
 * @desc    Obtener sección por ID
 * @access  Public
 * @query   detallada (true/false)
 */
router.get('/:id', controller.getSeccionById);

/**
 * @route   PUT /api/secciones/:id
 * @desc    Actualizar sección
 * @access  Public
 */
router.put('/:id', controller.updateSeccion);

/**
 * @route   DELETE /api/secciones/:id
 * @desc    Eliminar sección
 * @access  Public
 */
router.delete('/:id', controller.deleteSeccion);

/**
 * @route   GET /api/secciones/:id/estadisticas
 * @desc    Obtener estadísticas de una sección
 * @access  Public
 */
router.get('/:id/estadisticas', controller.getEstadisticas);

// ============================================================================
// GESTIÓN DE HORARIOS
// ============================================================================

/**
 * @route   POST /api/secciones/:id/horarios
 * @desc    Agregar horario a sección
 * @access  Public
 */
router.post('/:id/horarios', controller.addHorario);

/**
 * @route   PUT /api/secciones/horarios/:horarioId
 * @desc    Actualizar horario
 * @access  Public
 */
router.put('/horarios/:horarioId', controller.updateHorario);

/**
 * @route   DELETE /api/secciones/horarios/:horarioId
 * @desc    Eliminar horario
 * @access  Public
 */
router.delete('/horarios/:horarioId', controller.deleteHorario);

// ============================================================================
// GESTIÓN DE DOCENTES
// ============================================================================

/**
 * @route   POST /api/secciones/:id/docentes
 * @desc    Asignar docente a sección
 * @access  Public
 */
router.post('/:id/docentes', controller.addDocente);

/**
 * @route   DELETE /api/secciones/:id/docentes/:docenteId
 * @desc    Remover docente de sección
 * @access  Public
 */
router.delete('/:id/docentes/:docenteId', controller.removeDocente);

// ============================================================================
// GESTIÓN DE PARTICIPACIONES
// ============================================================================

/**
 * @route   POST /api/secciones/:id/participantes
 * @desc    Inscribir participante en sección
 * @access  Public
 */
router.post('/:id/participantes', controller.inscribirParticipante);

/**
 * @route   GET /api/secciones/:id/participantes
 * @desc    Listar participantes de una sección
 * @access  Public
 * @query   activas (true/false)
 */
router.get('/:id/participantes', controller.listarParticipantes);

/**
 * @route   PUT /api/secciones/participaciones/:participacionId
 * @desc    Actualizar participación
 * @access  Public
 */
router.put('/participaciones/:participacionId', controller.updateParticipacion);

/**
 * @route   POST /api/secciones/participaciones/:participacionId/baja
 * @desc    Dar de baja participación
 * @access  Public
 */
router.post('/participaciones/:participacionId/baja', controller.bajaParticipacion);

// ============================================================================
// GESTIÓN DE RESERVAS DE AULAS
// ============================================================================

/**
 * @route   POST /api/secciones/:id/reservas-aulas
 * @desc    Crear reserva de aula para sección
 * @access  Public
 */
router.post('/:id/reservas-aulas', controller.createReservaAula);

/**
 * @route   PUT /api/secciones/reservas-aulas/:reservaId
 * @desc    Actualizar reserva de aula
 * @access  Public
 */
router.put('/reservas-aulas/:reservaId', controller.updateReservaAula);

/**
 * @route   DELETE /api/secciones/reservas-aulas/:reservaId
 * @desc    Eliminar reserva de aula
 * @access  Public
 */
router.delete('/reservas-aulas/:reservaId', controller.deleteReservaAula);

export default router;
