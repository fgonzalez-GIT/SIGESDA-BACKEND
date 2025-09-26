import { Router } from 'express';
import { ReciboController } from '@/controllers/recibo.controller';
import { ReciboService } from '@/services/recibo.service';
import { ReciboRepository } from '@/repositories/recibo.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const reciboRepository = new ReciboRepository(prisma);
const personaRepository = new PersonaRepository(prisma);
const reciboService = new ReciboService(reciboRepository, personaRepository);
const reciboController = new ReciboController(reciboService);

// Basic CRUD Routes
router.post('/', reciboController.createRecibo.bind(reciboController));
router.get('/', reciboController.getRecibos.bind(reciboController));
router.get('/:id', reciboController.getReciboById.bind(reciboController));
router.put('/:id', reciboController.updateRecibo.bind(reciboController));
router.delete('/:id', reciboController.deleteRecibo.bind(reciboController));

// Specialized query routes (before parameterized routes)
router.get('/search/avanzada', reciboController.searchRecibos.bind(reciboController));
router.get('/stats/resumen', reciboController.getStatistics.bind(reciboController));
router.get('/dashboard/principal', reciboController.getDashboard.bind(reciboController));
router.get('/vencidos/listado', reciboController.getVencidos.bind(reciboController));
router.get('/pendientes/listado', reciboController.getPendientes.bind(reciboController));
router.get('/financial/summary', reciboController.getFinancialSummary.bind(reciboController));
router.get('/transitions/valid', reciboController.getValidStateTransitions.bind(reciboController));

// State management
router.put('/:id/estado', reciboController.changeEstado.bind(reciboController));
router.post('/vencidos/process', reciboController.processVencidos.bind(reciboController));

// Bulk operations
router.post('/bulk/create', reciboController.createBulkRecibos.bind(reciboController));
router.delete('/bulk/delete', reciboController.deleteBulkRecibos.bind(reciboController));
router.put('/bulk/estados', reciboController.updateBulkEstados.bind(reciboController));

// Lookup routes
router.get('/numero/:numero', reciboController.getReciboByNumero.bind(reciboController));
router.get('/persona/:personaId', reciboController.getRecibosByPersona.bind(reciboController));

// Filter routes by type and state
router.get('/tipo/:tipo', reciboController.getRecibosPorTipo.bind(reciboController));
router.get('/estado/:estado', reciboController.getRecibosPorEstado.bind(reciboController));

export default router;