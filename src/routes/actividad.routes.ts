import { Router } from 'express';
import { ActividadController } from '@/controllers/actividad.controller';
import { ActividadService } from '@/services/actividad.service';
import { ActividadRepository } from '@/repositories/actividad.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const actividadRepository = new ActividadRepository(prisma);
const actividadService = new ActividadService(actividadRepository, prisma);
const actividadController = new ActividadController(actividadService);

// ==================== CATÁLOGOS ====================
// IMPORTANTE: Estas rutas deben ir ANTES de las rutas con :id para evitar conflictos

router.get('/catalogos/todos', actividadController.getCatalogos.bind(actividadController));
router.get('/catalogos/tipos', actividadController.getTiposActividades.bind(actividadController));
router.get('/catalogos/categorias', actividadController.getCategoriasActividades.bind(actividadController));
router.get('/catalogos/estados', actividadController.getEstadosActividades.bind(actividadController));
router.get('/catalogos/dias-semana', actividadController.getDiasSemana.bind(actividadController));
router.get('/catalogos/roles-docentes', actividadController.getRolesDocentes.bind(actividadController));

// ==================== DOCENTES DISPONIBLES ====================

router.get('/docentes/disponibles', actividadController.getDocentesDisponibles.bind(actividadController));

// ==================== REPORTES Y CONSULTAS ESPECIALES ====================

router.get('/reportes/por-tipo', actividadController.getResumenPorTipo.bind(actividadController));
router.get('/reportes/horario-semanal', actividadController.getHorarioSemanal.bind(actividadController));

// ==================== BÚSQUEDA POR CÓDIGO ====================

router.get('/codigo/:codigo', actividadController.getActividadByCodigo.bind(actividadController));

// ==================== GESTIÓN DE HORARIOS (INDEPENDIENTES) ====================

router.patch('/horarios/:horarioId', actividadController.actualizarHorario.bind(actividadController));
router.put('/horarios/:horarioId', actividadController.actualizarHorario.bind(actividadController)); // Alias para PATCH
router.delete('/horarios/:horarioId', actividadController.eliminarHorario.bind(actividadController));

// ==================== CRUD PRINCIPAL ====================

// Crear actividad
router.post('/', actividadController.createActividad.bind(actividadController));

// Listar actividades (con filtros y paginación)
router.get('/', actividadController.getActividades.bind(actividadController));

// Obtener actividad por ID
router.get('/:id', actividadController.getActividadById.bind(actividadController));

// Actualizar actividad (soporta PATCH y PUT)
router.patch('/:id', actividadController.updateActividad.bind(actividadController));
router.put('/:id', actividadController.updateActividad.bind(actividadController));

// Eliminar actividad
router.delete('/:id', actividadController.deleteActividad.bind(actividadController));

// ==================== GESTIÓN DE ESTADO ====================

router.patch('/:id/estado', actividadController.cambiarEstado.bind(actividadController));

// ==================== DUPLICAR ACTIVIDAD ====================

router.post('/:id/duplicar', actividadController.duplicarActividad.bind(actividadController));

// ==================== HORARIOS DE ACTIVIDAD ====================

router.get('/:id/horarios', actividadController.getHorariosByActividad.bind(actividadController));
router.post('/:id/horarios', actividadController.agregarHorario.bind(actividadController));

// ==================== DOCENTES DE ACTIVIDAD ====================

router.get('/:id/docentes', actividadController.getDocentesByActividad.bind(actividadController));
router.post('/:id/docentes', actividadController.asignarDocente.bind(actividadController));
router.delete('/:id/docentes/:docenteId/rol/:rolDocenteId', actividadController.desasignarDocente.bind(actividadController));
router.delete('/docentes/:asignacionId', actividadController.desasignarDocenteById.bind(actividadController));

// ==================== PARTICIPANTES DE ACTIVIDAD ====================

router.get('/:id/participantes', actividadController.getParticipantes.bind(actividadController));
router.post('/:id/participantes', actividadController.addParticipante.bind(actividadController));
router.delete('/:id/participantes/:participanteId', actividadController.deleteParticipante.bind(actividadController));

// ==================== ESTADÍSTICAS DE ACTIVIDAD ====================

router.get('/:id/estadisticas', actividadController.getEstadisticas.bind(actividadController));

export default router;
