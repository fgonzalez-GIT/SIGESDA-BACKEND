import { Router } from 'express';
import { ReservaAulaController } from '@/controllers/reserva-aula.controller';
import { ReservaAulaService } from '@/services/reserva-aula.service';
import { ReservaAulaRepository } from '@/repositories/reserva-aula.repository';
import { AulaRepository } from '@/repositories/aula.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { ActividadRepository } from '@/repositories/actividad.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const reservaAulaRepository = new ReservaAulaRepository(prisma);
const aulaRepository = new AulaRepository(prisma);
const personaRepository = new PersonaRepository(prisma);
const actividadRepository = new ActividadRepository(prisma);
const reservaAulaService = new ReservaAulaService(
  reservaAulaRepository,
  aulaRepository,
  personaRepository,
  actividadRepository
);
const reservaAulaController = new ReservaAulaController(reservaAulaService);

// Basic CRUD Routes
router.post('/', reservaAulaController.createReserva.bind(reservaAulaController));
router.get('/', reservaAulaController.getReservas.bind(reservaAulaController));
router.get('/:id', reservaAulaController.getReservaById.bind(reservaAulaController));
router.put('/:id', reservaAulaController.updateReserva.bind(reservaAulaController));
router.delete('/:id', reservaAulaController.deleteReserva.bind(reservaAulaController));

// Specialized query routes (before parameterized routes)
router.get('/search/avanzada', reservaAulaController.searchReservas.bind(reservaAulaController));
router.get('/stats/reservas', reservaAulaController.getStatistics.bind(reservaAulaController));
router.get('/dashboard/resumen', reservaAulaController.getDashboard.bind(reservaAulaController));
router.get('/upcoming/proximas', reservaAulaController.getUpcomingReservations.bind(reservaAulaController));
router.get('/current/actuales', reservaAulaController.getCurrentReservations.bind(reservaAulaController));
router.get('/availability/check', reservaAulaController.checkAvailability.bind(reservaAulaController));

// Conflict detection
router.post('/conflicts/detect', reservaAulaController.detectConflicts.bind(reservaAulaController));

// Bulk operations
router.post('/bulk/create', reservaAulaController.createBulkReservas.bind(reservaAulaController));
router.delete('/bulk/delete', reservaAulaController.deleteBulkReservas.bind(reservaAulaController));

// Recurring reservations
router.post('/recurring/create', reservaAulaController.createRecurringReserva.bind(reservaAulaController));

// Entity-specific routes
router.get('/aula/:aulaId', reservaAulaController.getReservasByAula.bind(reservaAulaController));
router.get('/docente/:docenteId', reservaAulaController.getReservasByDocente.bind(reservaAulaController));
router.get('/actividad/:actividadId', reservaAulaController.getReservasByActividad.bind(reservaAulaController));

export default router;