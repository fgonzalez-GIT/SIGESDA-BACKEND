// @ts-nocheck
import { Router } from 'express';
import { ActividadAulaController } from '@/controllers/actividad-aula.controller';

const router = Router();
const actividadAulaController = new ActividadAulaController();

// ============================================================================
// RUTAS PRINCIPALES - ACTIVIDADES-AULAS
// ============================================================================

/**
 * @route GET /api/actividades-aulas
 * @desc Lista todas las asignaciones con filtros
 * @query actividadId, aulaId, activa, incluirRelaciones, page, limit
 */
router.get(
  '/',
  actividadAulaController.findAll.bind(actividadAulaController)
);

/**
 * @route GET /api/actividades-aulas/:id
 * @desc Obtiene una asignación por ID
 * @param id - ID de la asignación
 */
router.get(
  '/:id',
  actividadAulaController.findById.bind(actividadAulaController)
);

/**
 * @route PUT /api/actividades-aulas/:id
 * @desc Actualiza una asignación
 * @param id - ID de la asignación
 * @body prioridad, fechaDesasignacion, activa, observaciones
 */
router.put(
  '/:id',
  actividadAulaController.update.bind(actividadAulaController)
);

/**
 * @route DELETE /api/actividades-aulas/:id
 * @desc Elimina permanentemente una asignación
 * @param id - ID de la asignación
 */
router.delete(
  '/:id',
  actividadAulaController.delete.bind(actividadAulaController)
);

/**
 * @route POST /api/actividades-aulas/:id/desasignar
 * @desc Desasigna un aula de una actividad (soft delete)
 * @param id - ID de la asignación
 * @body fechaDesasignacion, observaciones
 */
router.post(
  '/:id/desasignar',
  actividadAulaController.desasignarAula.bind(actividadAulaController)
);

/**
 * @route POST /api/actividades-aulas/:id/reactivar
 * @desc Reactiva una asignación desactivada
 * @param id - ID de la asignación
 */
router.post(
  '/:id/reactivar',
  actividadAulaController.reactivarAsignacion.bind(actividadAulaController)
);

// ============================================================================
// RUTAS ESPECÍFICAS DE ACTIVIDADES
// ============================================================================

/**
 * @route POST /api/actividades/:actividadId/aulas
 * @desc Asigna un aula a una actividad
 * @param actividadId - ID de la actividad
 * @body aulaId, fechaAsignacion, prioridad, observaciones
 */
router.post(
  '/actividades/:actividadId/aulas',
  actividadAulaController.asignarAula.bind(actividadAulaController)
);

/**
 * @route GET /api/actividades/:actividadId/aulas
 * @desc Obtiene todas las aulas de una actividad
 * @param actividadId - ID de la actividad
 * @query soloActivas - boolean (default: true)
 */
router.get(
  '/actividades/:actividadId/aulas',
  actividadAulaController.getAulasByActividad.bind(actividadAulaController)
);

/**
 * @route POST /api/actividades/:actividadId/aulas/verificar-disponibilidad
 * @desc Verifica disponibilidad de un aula para una actividad
 * @param actividadId - ID de la actividad
 * @body aulaId, excluirAsignacionId
 */
router.post(
  '/actividades/:actividadId/aulas/verificar-disponibilidad',
  actividadAulaController.verificarDisponibilidad.bind(actividadAulaController)
);

/**
 * @route GET /api/actividades/:actividadId/aulas/sugerencias
 * @desc Sugiere aulas disponibles para una actividad
 * @param actividadId - ID de la actividad
 * @query capacidadMinima, tipoAulaId
 */
router.get(
  '/actividades/:actividadId/aulas/sugerencias',
  actividadAulaController.sugerirAulas.bind(actividadAulaController)
);

/**
 * @route POST /api/actividades/:actividadId/aulas/multiple
 * @desc Asigna múltiples aulas a una actividad
 * @param actividadId - ID de la actividad
 * @body aulas: [{ aulaId, prioridad, observaciones }]
 */
router.post(
  '/actividades/:actividadId/aulas/multiple',
  actividadAulaController.asignarMultiplesAulas.bind(actividadAulaController)
);

/**
 * @route PUT /api/actividades/:actividadId/aulas/:aulaId/cambiar
 * @desc Cambia el aula de una actividad
 * @param actividadId - ID de la actividad
 * @param aulaId - ID del aula actual
 * @body nuevaAulaId, observaciones
 */
router.put(
  '/actividades/:actividadId/aulas/:aulaId/cambiar',
  actividadAulaController.cambiarAula.bind(actividadAulaController)
);

// ============================================================================
// RUTAS ESPECÍFICAS DE AULAS
// ============================================================================

/**
 * @route GET /api/aulas/:aulaId/actividades
 * @desc Obtiene todas las actividades de un aula
 * @param aulaId - ID del aula
 * @query soloActivas - boolean (default: true)
 */
router.get(
  '/aulas/:aulaId/actividades',
  actividadAulaController.getActividadesByAula.bind(actividadAulaController)
);

/**
 * @route GET /api/aulas/:aulaId/ocupacion
 * @desc Obtiene resumen de ocupación de un aula
 * @param aulaId - ID del aula
 */
router.get(
  '/aulas/:aulaId/ocupacion',
  actividadAulaController.getOcupacionAula.bind(actividadAulaController)
);

export default router;
