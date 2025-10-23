import { Router } from 'express';
import { ParticipacionController } from '@/controllers/participacion.controller';
import { ParticipacionService } from '@/services/participacion.service';
import { ParticipacionRepository } from '@/repositories/participacion.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { ActividadRepository } from '@/repositories/actividad.repository';
import { AsistenciaRepository } from '@/repositories/asistencia.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const participacionRepository = new ParticipacionRepository(prisma);
const personaRepository = new PersonaRepository(prisma);
const actividadRepository = new ActividadRepository(prisma);
const asistenciaRepository = new AsistenciaRepository(prisma);
const participacionService = new ParticipacionService(
  participacionRepository,
  personaRepository,
  actividadRepository,
  asistenciaRepository
);
const participacionController = new ParticipacionController(participacionService);

// Rutas de información y utilidades (antes de las rutas con parámetros)
router.get('/activas', participacionController.getParticipacionesActivas.bind(participacionController));
router.get('/por-vencer', participacionController.getParticipacionesPorVencer.bind(participacionController));
router.get('/estadisticas', participacionController.getEstadisticas.bind(participacionController));
router.get('/dashboard', participacionController.getDashboard.bind(participacionController));
router.get('/reporte-inasistencias', participacionController.getReporteInasistencias.bind(participacionController));

// Operaciones especiales
router.post('/inscripcion-masiva', participacionController.inscripcionMasiva.bind(participacionController));
router.post('/inscripcion-multiple-personas', participacionController.inscripcionMultiplePersonas.bind(participacionController));
router.post('/verificar-cupos', participacionController.verificarCupos.bind(participacionController));

// CRUD básico
router.post('/', participacionController.createParticipacion.bind(participacionController));
router.get('/', participacionController.getParticipaciones.bind(participacionController));
router.get('/:id', participacionController.getParticipacionById.bind(participacionController));
router.put('/:id', participacionController.updateParticipacion.bind(participacionController));
router.delete('/:id', participacionController.deleteParticipacion.bind(participacionController));

// Operaciones específicas por ID
router.post('/:id/desinscribir', participacionController.desinscribir.bind(participacionController));
router.post('/:id/reactivar', participacionController.reactivarParticipacion.bind(participacionController));
router.post('/:id/transferir', participacionController.transferirParticipacion.bind(participacionController));

// Rutas por persona y actividad
router.get('/persona/:personaId', participacionController.getParticipacionesByPersona.bind(participacionController));
router.get('/actividad/:actividadId', participacionController.getParticipacionesByActividad.bind(participacionController));

export default router;