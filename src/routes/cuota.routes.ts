import { Router } from 'express';
import { CuotaController } from '@/controllers/cuota.controller';
import { CuotaService } from '@/services/cuota.service';
import { CuotaRepository } from '@/repositories/cuota.repository';
import { ReciboRepository } from '@/repositories/recibo.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { ConfiguracionRepository } from '@/repositories/configuracion.repository';
import { ItemCuotaController } from '@/controllers/item-cuota.controller';
import { ItemCuotaService } from '@/services/item-cuota.service';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies - Cuota
const cuotaRepository = new CuotaRepository(prisma);
const reciboRepository = new ReciboRepository(prisma);
const personaRepository = new PersonaRepository(prisma);
const configuracionRepository = new ConfiguracionRepository(prisma);
const cuotaService = new CuotaService(cuotaRepository, reciboRepository, personaRepository, configuracionRepository);
const cuotaController = new CuotaController(cuotaService);

// Initialize dependencies - ItemCuota
const itemCuotaService = new ItemCuotaService();
const itemCuotaController = new ItemCuotaController(itemCuotaService);

// Basic CRUD Routes
router.post('/', cuotaController.createCuota.bind(cuotaController));
router.get('/', cuotaController.getCuotas.bind(cuotaController));
router.get('/:id', cuotaController.getCuotaById.bind(cuotaController));
router.put('/:id', cuotaController.updateCuota.bind(cuotaController));
router.delete('/:id', cuotaController.deleteCuota.bind(cuotaController));

// Specialized query routes (before parameterized routes)
router.get('/search/avanzada', cuotaController.searchCuotas.bind(cuotaController));
router.get('/stats/resumen', cuotaController.getStatistics.bind(cuotaController));
router.get('/dashboard/principal', cuotaController.getDashboard.bind(cuotaController));
router.get('/pendientes/listado', cuotaController.getPendientes.bind(cuotaController));
router.get('/vencidas/listado', cuotaController.getVencidas.bind(cuotaController));
router.get('/periodos/disponibles', cuotaController.getPeriodosDisponibles.bind(cuotaController));

// Generation and calculation routes
router.post('/generar/masiva', cuotaController.generarCuotas.bind(cuotaController));
// NUEVO: Generación V2 con sistema de ítems + motor de reglas de descuentos (FASE 2 + FASE 3)
router.post('/generar-v2', cuotaController.generarCuotasConItems.bind(cuotaController));
router.post('/calcular/monto', cuotaController.calcularMontoCuota.bind(cuotaController));
router.post('/recalcular/periodo', cuotaController.recalcularCuotas.bind(cuotaController));

// FASE 4 - Task 4.3: Recálculo y Regeneración de Cuotas
router.post('/regenerar', cuotaController.regenerarCuotasDelPeriodo.bind(cuotaController));
router.post('/preview-recalculo', cuotaController.previewRecalculoCuotas.bind(cuotaController));
router.post('/:id/recalcular', cuotaController.recalcularCuotaById.bind(cuotaController));
router.get('/:id/comparar', cuotaController.compararCuotaConRecalculo.bind(cuotaController));

// Bulk operations
router.delete('/bulk/eliminar', cuotaController.deleteBulkCuotas.bind(cuotaController));

// Report routes
router.get('/reporte/:mes/:anio', cuotaController.generarReporte.bind(cuotaController));
router.get('/resumen/:mes/:anio', cuotaController.getResumenMensual.bind(cuotaController));

// Validation routes
router.get('/validar/:mes/:anio/generacion', cuotaController.validarGeneracionCuotas.bind(cuotaController));

// Lookup routes by different criteria
router.get('/recibo/:reciboId', cuotaController.getCuotaByReciboId.bind(cuotaController));
router.get('/socio/:socioId', cuotaController.getCuotasBySocio.bind(cuotaController));
router.get('/periodo/:mes/:anio', cuotaController.getCuotasPorPeriodo.bind(cuotaController));

// ========================================
// ITEMS DE CUOTA SUB-ROUTES
// ========================================

// Items routes for specific cuota
router.get('/:cuotaId/items', itemCuotaController.getItemsByCuotaId.bind(itemCuotaController));
router.get('/:cuotaId/items/desglose', itemCuotaController.getDesgloseByCuotaId.bind(itemCuotaController));
router.get('/:cuotaId/items/segmentados', itemCuotaController.getItemsSegmentados.bind(itemCuotaController));
router.post('/:cuotaId/items', itemCuotaController.addManualItem.bind(itemCuotaController));
router.post('/:cuotaId/items/regenerar', itemCuotaController.regenerarItems.bind(itemCuotaController));
router.post('/:cuotaId/items/descuento-global', itemCuotaController.aplicarDescuentoGlobal.bind(itemCuotaController));

export default router;