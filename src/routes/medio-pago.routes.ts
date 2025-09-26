import { Router } from 'express';
import { MedioPagoController } from '@/controllers/medio-pago.controller';
import { MedioPagoService } from '@/services/medio-pago.service';
import { MedioPagoRepository } from '@/repositories/medio-pago.repository';
import { ReciboRepository } from '@/repositories/recibo.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const medioPagoRepository = new MedioPagoRepository(prisma);
const reciboRepository = new ReciboRepository(prisma);
const medioPagoService = new MedioPagoService(medioPagoRepository, reciboRepository);
const medioPagoController = new MedioPagoController(medioPagoService);

// ===== HEALTH CHECK (debe ir primero) =====
// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Medios de Pago API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ===== RUTAS PRINCIPALES CRUD =====

// Crear medio de pago
router.post('/', medioPagoController.create.bind(medioPagoController));

// Obtener todos los medios de pago con filtros
router.get('/', medioPagoController.getAll.bind(medioPagoController));

// Obtener medio de pago por ID
router.get('/:id', medioPagoController.getById.bind(medioPagoController));

// Actualizar medio de pago
router.put('/:id', medioPagoController.update.bind(medioPagoController));

// Eliminar medio de pago
router.delete('/:id', medioPagoController.delete.bind(medioPagoController));

// ===== RUTAS DE CONSULTA ESPECIALIZADA =====

// Buscar medios de pago
router.get('/search/avanzada', medioPagoController.search.bind(medioPagoController));

// Obtener medios de pago por recibo
router.get('/recibo/:reciboId', medioPagoController.getByReciboId.bind(medioPagoController));

// Obtener medios de pago por tipo
router.get('/tipo/:tipo', medioPagoController.getByTipo.bind(medioPagoController));

// ===== RUTAS POR TIPO ESPECÍFICO =====

// Obtener pagos en efectivo
router.get('/efectivo/listado', medioPagoController.getEfectivo.bind(medioPagoController));

// Obtener cheques
router.get('/cheques/listado', medioPagoController.getCheques.bind(medioPagoController));

// Obtener transferencias
router.get('/transferencias/listado', medioPagoController.getTransferencias.bind(medioPagoController));

// Obtener tarjetas (débito y crédito)
router.get('/tarjetas/listado', medioPagoController.getTarjetas.bind(medioPagoController));

// ===== RUTAS DE VALIDACIÓN Y CONTROL =====

// Validar pago completo (POST con datos en body)
router.post('/validar/pago-completo', medioPagoController.validatePayment.bind(medioPagoController));

// Validar pago de recibo específico (GET con parámetros)
router.get('/validar/recibo/:reciboId', medioPagoController.validateReciboPayment.bind(medioPagoController));

// ===== RUTAS DE ESTADÍSTICAS Y REPORTES =====

// Dashboard principal
router.get('/dashboard/principal', medioPagoController.getDashboard.bind(medioPagoController));

// Estadísticas rápidas
router.get('/stats/rapidas', medioPagoController.getQuickStats.bind(medioPagoController));

// Estadísticas detalladas
router.get('/stats/detalladas', medioPagoController.getStatistics.bind(medioPagoController));

// Resumen por período
router.get('/resumen/periodo', medioPagoController.getResumenPeriodo.bind(medioPagoController));

// Conciliación bancaria
router.get('/conciliacion/bancaria', medioPagoController.getConciliacionBancaria.bind(medioPagoController));

// ===== RUTAS DE OPERACIONES MASIVAS =====

// Eliminar múltiples medios de pago
router.delete('/bulk/eliminar', medioPagoController.deleteBulk.bind(medioPagoController));

// ===== RUTAS DE ACCESO DIRECTO Y ALIASES =====

// Alias para obtener medios de pago del día actual
router.get('/hoy/listado', (req, res, next) => {
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);

  req.query.fechaDesde = inicioHoy.toISOString();
  req.query.fechaHasta = finHoy.toISOString();

  medioPagoController.getAll.bind(medioPagoController)(req, res, next);
});

// Alias para obtener medios de pago del mes actual
router.get('/mes-actual/listado', (req, res, next) => {
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);

  req.query.fechaDesde = inicioMes.toISOString();
  req.query.fechaHasta = finMes.toISOString();

  medioPagoController.getAll.bind(medioPagoController)(req, res, next);
});

// ===== RUTAS DE FILTROS RÁPIDOS =====

// Medios de pago de alto valor (más de $50,000)
router.get('/alto-valor/listado', (req, res, next) => {
  req.query.importeMinimo = '50000';
  medioPagoController.getAll.bind(medioPagoController)(req, res, next);
});

// Medios de pago recientes (últimos 7 días)
router.get('/recientes/listado', (req, res, next) => {
  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 7);
  const hoy = new Date();

  req.query.fechaDesde = hace7Dias.toISOString();
  req.query.fechaHasta = hoy.toISOString();

  medioPagoController.getAll.bind(medioPagoController)(req, res, next);
});

// ===== RUTAS DE UTILIDAD =====

export default router;