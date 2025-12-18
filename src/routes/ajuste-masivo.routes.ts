import { Router } from 'express';
import { AjusteMasivoController } from '@/controllers/ajuste-masivo.controller';
import { AjusteMasivoService } from '@/services/ajuste-masivo.service';

const router = Router();

// Inicializar servicio y controlador
const ajusteMasivoService = new AjusteMasivoService();
const ajusteMasivoController = new AjusteMasivoController(ajusteMasivoService);

/**
 * @route GET /api/ajustes/masivo/health
 * @desc Health check del servicio de ajuste masivo
 * @access Public
 */
router.get('/masivo/health', ajusteMasivoController.healthCheck);

/**
 * @route POST /api/ajustes/masivo
 * @desc Aplica ajuste masivo a múltiples cuotas según filtros
 * @body {AjusteMasivoDto}
 * @access Private
 *
 * @example
 * {
 *   "filtros": {
 *     "mes": 12,
 *     "anio": 2025,
 *     "categoriaIds": [1, 2]
 *   },
 *   "tipoAjuste": "DESCUENTO_PORCENTAJE",
 *   "valor": 10,
 *   "motivo": "Promoción de fin de año",
 *   "modo": "PREVIEW"
 * }
 */
router.post('/masivo', ajusteMasivoController.aplicarAjusteMasivo);

/**
 * @route POST /api/ajustes/modificar-items
 * @desc Modifica múltiples ítems de cuotas en batch
 * @body {ModificarItemsMasivoDto}
 * @access Private
 *
 * @example
 * {
 *   "filtros": {
 *     "mes": 12,
 *     "anio": 2025,
 *     "conceptoContiene": "Guitarra"
 *   },
 *   "modificaciones": {
 *     "multiplicarMonto": 1.1
 *   },
 *   "motivo": "Ajuste inflación 10%",
 *   "modo": "PREVIEW"
 * }
 */
router.post('/modificar-items', ajusteMasivoController.modificarItemsMasivo);

/**
 * @route POST /api/ajustes/descuento-global
 * @desc Aplica descuento global a todas las cuotas de un período
 * @body {DescuentoGlobalDto}
 * @access Private
 *
 * @example
 * {
 *   "mes": 12,
 *   "anio": 2025,
 *   "tipoDescuento": "PORCENTAJE",
 *   "valor": 15,
 *   "motivo": "Descuento navideño",
 *   "modo": "PREVIEW"
 * }
 */
router.post('/descuento-global', ajusteMasivoController.aplicarDescuentoGlobal);

export default router;
