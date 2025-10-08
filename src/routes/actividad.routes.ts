import { Router } from 'express';
import { ActividadController } from '@/controllers/actividad.controller';
import { ActividadService } from '@/services/actividad.service';
import { ActividadRepository } from '@/repositories/actividad.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const actividadRepository = new ActividadRepository(prisma);
const personaRepository = new PersonaRepository(prisma);
const actividadService = new ActividadService(actividadRepository, personaRepository);
const actividadController = new ActividadController(actividadService);

// Rutas de información y búsqueda (antes de las rutas con parámetros)
router.get('/search', actividadController.searchActividades.bind(actividadController));
router.get('/coros', actividadController.getCoros.bind(actividadController));
router.get('/clases-instrumento', actividadController.getClasesInstrumento.bind(actividadController));
router.get('/clases-canto', actividadController.getClasesCanto.bind(actividadController));
router.get('/docentes-disponibles', actividadController.getDocentesDisponibles.bind(actividadController));

// Rutas para consultas de horarios (antes de las rutas con :id)
router.get('/horarios/semana', actividadController.getHorarioSemanal.bind(actividadController));
router.get('/horarios/dia/:dia', actividadController.getActividadesPorDia.bind(actividadController));
router.post('/horarios/verificar-conflicto', actividadController.verificarConflictosHorario.bind(actividadController));
router.post('/horarios/verificar-aula', actividadController.verificarDisponibilidadAula.bind(actividadController));
router.post('/horarios/verificar-docente', actividadController.verificarDisponibilidadDocente.bind(actividadController));
router.get('/horarios/docente/:docenteId/carga', actividadController.getCargaHorariaDocente.bind(actividadController));

// CRUD básico
router.post('/', actividadController.createActividad.bind(actividadController));
router.get('/', actividadController.getActividades.bind(actividadController));
router.get('/:id', actividadController.getActividadById.bind(actividadController));
router.put('/:id', actividadController.updateActividad.bind(actividadController));
router.delete('/:id', actividadController.deleteActividad.bind(actividadController));

// Rutas específicas por ID
router.get('/:id/participantes', actividadController.getParticipantes.bind(actividadController));
router.get('/:id/estadisticas', actividadController.getEstadisticas.bind(actividadController));

// Gestión de docentes
router.post('/:id/docentes', actividadController.asignarDocente.bind(actividadController));
router.delete('/:id/docentes/:docenteId', actividadController.desasignarDocente.bind(actividadController));

// Gestión individual de horarios
router.post('/:id/horarios', actividadController.agregarHorario.bind(actividadController));
router.put('/:id/horarios/:horarioId', actividadController.actualizarHorario.bind(actividadController));
router.delete('/:id/horarios/:horarioId', actividadController.eliminarHorario.bind(actividadController));

export default router;