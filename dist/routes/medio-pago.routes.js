"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const medio_pago_controller_1 = require("@/controllers/medio-pago.controller");
const medio_pago_service_1 = require("@/services/medio-pago.service");
const medio_pago_repository_1 = require("@/repositories/medio-pago.repository");
const recibo_repository_1 = require("@/repositories/recibo.repository");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
const medioPagoRepository = new medio_pago_repository_1.MedioPagoRepository(database_1.prisma);
const reciboRepository = new recibo_repository_1.ReciboRepository(database_1.prisma);
const medioPagoService = new medio_pago_service_1.MedioPagoService(medioPagoRepository, reciboRepository);
const medioPagoController = new medio_pago_controller_1.MedioPagoController(medioPagoService);
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Medios de Pago API is healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
router.post('/', medioPagoController.create.bind(medioPagoController));
router.get('/', medioPagoController.getAll.bind(medioPagoController));
router.get('/:id', medioPagoController.getById.bind(medioPagoController));
router.put('/:id', medioPagoController.update.bind(medioPagoController));
router.delete('/:id', medioPagoController.delete.bind(medioPagoController));
router.get('/search/avanzada', medioPagoController.search.bind(medioPagoController));
router.get('/recibo/:reciboId', medioPagoController.getByReciboId.bind(medioPagoController));
router.get('/tipo/:tipo', medioPagoController.getByTipo.bind(medioPagoController));
router.get('/efectivo/listado', medioPagoController.getEfectivo.bind(medioPagoController));
router.get('/cheques/listado', medioPagoController.getCheques.bind(medioPagoController));
router.get('/transferencias/listado', medioPagoController.getTransferencias.bind(medioPagoController));
router.get('/tarjetas/listado', medioPagoController.getTarjetas.bind(medioPagoController));
router.post('/validar/pago-completo', medioPagoController.validatePayment.bind(medioPagoController));
router.get('/validar/recibo/:reciboId', medioPagoController.validateReciboPayment.bind(medioPagoController));
router.get('/dashboard/principal', medioPagoController.getDashboard.bind(medioPagoController));
router.get('/stats/rapidas', medioPagoController.getQuickStats.bind(medioPagoController));
router.get('/stats/detalladas', medioPagoController.getStatistics.bind(medioPagoController));
router.get('/resumen/periodo', medioPagoController.getResumenPeriodo.bind(medioPagoController));
router.get('/conciliacion/bancaria', medioPagoController.getConciliacionBancaria.bind(medioPagoController));
router.delete('/bulk/eliminar', medioPagoController.deleteBulk.bind(medioPagoController));
router.get('/hoy/listado', (req, res, next) => {
    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);
    req.query.fechaDesde = inicioHoy.toISOString();
    req.query.fechaHasta = finHoy.toISOString();
    medioPagoController.getAll.bind(medioPagoController)(req, res, next);
});
router.get('/mes-actual/listado', (req, res, next) => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);
    req.query.fechaDesde = inicioMes.toISOString();
    req.query.fechaHasta = finMes.toISOString();
    medioPagoController.getAll.bind(medioPagoController)(req, res, next);
});
router.get('/alto-valor/listado', (req, res, next) => {
    req.query.importeMinimo = '50000';
    medioPagoController.getAll.bind(medioPagoController)(req, res, next);
});
router.get('/recientes/listado', (req, res, next) => {
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    const hoy = new Date();
    req.query.fechaDesde = hace7Dias.toISOString();
    req.query.fechaHasta = hoy.toISOString();
    medioPagoController.getAll.bind(medioPagoController)(req, res, next);
});
exports.default = router;
//# sourceMappingURL=medio-pago.routes.js.map