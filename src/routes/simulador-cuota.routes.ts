import { Router } from 'express';
import { SimuladorCuotaController } from '@/controllers/simulador-cuota.controller';
import { CuotaService } from '@/services/cuota.service';
import { CuotaRepository } from '@/repositories/cuota.repository';
import { ReciboRepository } from '@/repositories/recibo.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { ConfiguracionRepository } from '@/repositories/configuracion.repository';
import { MotorReglasDescuentos } from '@/services/motor-reglas-descuentos.service';
import { AjusteCuotaService } from '@/services/ajuste-cuota.service';
import { AjusteCuotaRepository } from '@/repositories/ajuste-cuota.repository';
import { ExencionCuotaService } from '@/services/exencion-cuota.service';
import { ExencionCuotaRepository } from '@/repositories/exencion-cuota.repository';
import { prisma } from '@/config/database';

const router = Router();

// Inicializar repositorios
const cuotaRepository = new CuotaRepository();
const reciboRepository = new ReciboRepository();
const personaRepository = new PersonaRepository();
const configuracionRepository = new ConfiguracionRepository();
const ajusteCuotaRepository = new AjusteCuotaRepository();
const exencionCuotaRepository = new ExencionCuotaRepository();

// Inicializar servicios
const motorReglasDescuentos = new MotorReglasDescuentos(prisma);
const ajusteService = new AjusteCuotaService(ajusteCuotaRepository);
const exencionService = new ExencionCuotaService(exencionCuotaRepository);

const cuotaService = new CuotaService(
  cuotaRepository,
  reciboRepository,
  personaRepository,
  configuracionRepository,
  ajusteService,
  exencionService
);

// Inicializar controlador
const simuladorController = new SimuladorCuotaController(
  cuotaService,
  motorReglasDescuentos,
  ajusteService,
  exencionService
);

/**
 * @route GET /api/simulador/cuotas/health
 * @desc Health check del simulador
 * @access Public
 */
router.get('/health', simuladorController.healthCheck);

/**
 * @route POST /api/simulador/cuotas/generacion
 * @desc Simula generación de cuotas sin persistir en BD
 * @body {SimularGeneracionDto}
 * @access Private
 */
router.post('/generacion', simuladorController.simularGeneracion);

/**
 * @route POST /api/simulador/cuotas/reglas
 * @desc Simula impacto de cambios en reglas de descuento
 * @body {SimularReglaDescuentoDto}
 * @access Private
 */
router.post('/reglas', simuladorController.simularReglaDescuento);

/**
 * @route POST /api/simulador/cuotas/escenarios
 * @desc Compara múltiples escenarios de generación
 * @body {CompararEscenariosDto}
 * @access Private
 */
router.post('/escenarios', simuladorController.compararEscenarios);

/**
 * @route POST /api/simulador/cuotas/impacto-masivo
 * @desc Simula impacto masivo de cambios en configuración
 * @body {SimularImpactoMasivoDto}
 * @access Private
 */
router.post('/impacto-masivo', simuladorController.simularImpactoMasivo);

export default router;
