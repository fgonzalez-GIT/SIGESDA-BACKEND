import { Router } from 'express';
import { AsistenciaController } from '@/controllers/asistencia.controller';
import { AsistenciaService } from '@/services/asistencia.service';
import { AsistenciaRepository } from '@/repositories/asistencia.repository';
import { ParticipacionRepository } from '@/repositories/participacion.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const asistenciaRepository = new AsistenciaRepository(prisma);
const participacionRepository = new ParticipacionRepository(prisma);
const asistenciaService = new AsistenciaService(
  asistenciaRepository,
  participacionRepository
);
const asistenciaController = new AsistenciaController(asistenciaService);

// Rutas de reportes y utilidades (antes de las rutas con parámetros)
router.get('/dashboard', asistenciaController.getDashboard.bind(asistenciaController));
router.get('/reporte', asistenciaController.getReporteAsistencias.bind(asistenciaController));
router.get('/alertas', asistenciaController.getAlertasInasistencias.bind(asistenciaController));
router.get('/estadisticas', asistenciaController.getEstadisticasGenerales.bind(asistenciaController));

// Operaciones especiales
router.post('/registro-masivo', asistenciaController.registroMasivo.bind(asistenciaController));
router.post('/corregir', asistenciaController.corregirAsistencia.bind(asistenciaController));

// Rutas por recurso relacionado
router.get('/participacion/:participacionId', asistenciaController.getAsistenciasByParticipacion.bind(asistenciaController));
router.get('/actividad/:actividadId', asistenciaController.getAsistenciasByActividad.bind(asistenciaController));
router.get('/persona/:personaId', asistenciaController.getAsistenciasByPersona.bind(asistenciaController));

// Rutas de resumen
router.get('/resumen/persona/:personaId', asistenciaController.getResumenPersona.bind(asistenciaController));
router.get('/resumen/actividad/:actividadId', asistenciaController.getResumenActividad.bind(asistenciaController));

// Rutas de tasa de asistencia
router.get('/tasa/:participacionId', asistenciaController.getTasaAsistencia.bind(asistenciaController));

// CRUD básico
router.post('/', asistenciaController.createAsistencia.bind(asistenciaController));
router.get('/', asistenciaController.getAsistencias.bind(asistenciaController));
router.get('/:id', asistenciaController.getAsistenciaById.bind(asistenciaController));
router.patch('/:id', asistenciaController.updateAsistencia.bind(asistenciaController));
router.delete('/:id', asistenciaController.deleteAsistencia.bind(asistenciaController));

export default router;
