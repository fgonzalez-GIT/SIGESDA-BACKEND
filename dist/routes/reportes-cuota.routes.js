"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportes_cuota_controller_1 = require("@/controllers/reportes-cuota.controller");
const reportes_cuota_service_1 = require("@/services/reportes-cuota.service");
const router = (0, express_1.Router)();
const reportesService = new reportes_cuota_service_1.ReportesCuotaService();
const reportesController = new reportes_cuota_controller_1.ReportesCuotaController(reportesService);
router.get('/dashboard', reportesController.getDashboard.bind(reportesController));
router.get('/categoria', reportesController.getReportePorCategoria.bind(reportesController));
router.get('/descuentos', reportesController.getAnalisisDescuentos.bind(reportesController));
router.get('/exenciones', reportesController.getReporteExenciones.bind(reportesController));
router.get('/comparativo', reportesController.getReporteComparativo.bind(reportesController));
router.get('/recaudacion', reportesController.getEstadisticasRecaudacion.bind(reportesController));
router.post('/exportar', reportesController.exportarReporte.bind(reportesController));
exports.default = router;
//# sourceMappingURL=reportes-cuota.routes.js.map