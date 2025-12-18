import { Router } from 'express';
import { PreviewCuotaController } from '@/controllers/preview-cuota.controller';
import { PreviewCuotaService } from '@/services/preview-cuota.service';

const router = Router();

// Inicializar servicio y controlador
const previewService = new PreviewCuotaService();
const previewController = new PreviewCuotaController(previewService);

/**
 * @route GET /api/preview/cuotas/health
 * @desc Health check del servicio de preview
 * @access Public
 */
router.get('/health', previewController.healthCheck);

/**
 * @route POST /api/preview/cuotas
 * @desc Genera preview detallado de una cuota (existente o simulada)
 * @body {PreviewCuotaDto}
 * @access Private
 *
 * @example Preview de cuota existente:
 * {
 *   "cuotaId": 123,
 *   "incluirDetalleItems": true,
 *   "incluirExplicacionDescuentos": true,
 *   "incluirHistorialCambios": false,
 *   "formato": "COMPLETO"
 * }
 *
 * @example Preview de cuota simulada:
 * {
 *   "socioId": 45,
 *   "mes": 12,
 *   "anio": 2025,
 *   "categoriaId": 1,
 *   "formato": "COMPLETO"
 * }
 */
router.post('/', previewController.previewCuota);

/**
 * @route POST /api/preview/cuotas/socio
 * @desc Genera preview de múltiples cuotas de un socio
 * @body {PreviewCuotasSocioDto}
 * @access Private
 *
 * @example Preview de rango de cuotas:
 * {
 *   "socioId": 45,
 *   "mesDesde": 1,
 *   "anioDesde": 2025,
 *   "mesHasta": 12,
 *   "anioHasta": 2025,
 *   "incluirPagadas": false,
 *   "incluirAnuladas": false,
 *   "formato": "RESUMIDO"
 * }
 *
 * @example Preview de un solo mes:
 * {
 *   "socioId": 45,
 *   "mesDesde": 12,
 *   "anioDesde": 2025,
 *   "formato": "SIMPLE"
 * }
 */
router.post('/socio', previewController.previewCuotasSocio);

/**
 * @route POST /api/preview/cuotas/comparar
 * @desc Compara cuota antes/después de aplicar cambios propuestos
 * @body {CompararCuotaDto}
 * @access Private
 *
 * @example Comparación con descuento:
 * {
 *   "cuotaId": 123,
 *   "cambiosPropuestos": {
 *     "nuevoDescuento": 15
 *   }
 * }
 *
 * @example Comparación con ajustes y exenciones:
 * {
 *   "cuotaId": 123,
 *   "cambiosPropuestos": {
 *     "nuevoDescuento": 10,
 *     "nuevosAjustes": [
 *       {
 *         "tipoItemCuotaId": 2,
 *         "monto": -500,
 *         "motivo": "Descuento por buen pago"
 *       }
 *     ],
 *     "nuevasExenciones": [
 *       {
 *         "tipoItemCuotaId": 3,
 *         "porcentaje": 50,
 *         "motivo": "Exención temporal"
 *       }
 *     ]
 *   }
 * }
 */
router.post('/comparar', previewController.compararCuota);

export default router;
