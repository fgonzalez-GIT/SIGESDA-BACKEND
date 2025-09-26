import { Router } from 'express';
import { ConfiguracionController } from '@/controllers/configuracion.controller';
import { ConfiguracionService } from '@/services/configuracion.service';
import { ConfiguracionRepository } from '@/repositories/configuracion.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const configuracionRepository = new ConfiguracionRepository(prisma);
const configuracionService = new ConfiguracionService(configuracionRepository);
const configuracionController = new ConfiguracionController(configuracionService);

// Rutas de utilidades y operaciones especiales (antes de las rutas con parámetros)
router.post('/bulk-upsert', configuracionController.bulkUpsert.bind(configuracionController));
router.get('/export', configuracionController.exportarTodas.bind(configuracionController));
router.get('/estadisticas', configuracionController.contarPorTipo.bind(configuracionController));
router.get('/integridad', configuracionController.validarIntegridad.bind(configuracionController));
router.post('/inicializar', configuracionController.inicializarSistema.bind(configuracionController));
router.get('/search', configuracionController.buscarPorValor.bind(configuracionController));
router.get('/modificadas-recientemente', configuracionController.getConfiguracionesModificadasRecientemente.bind(configuracionController));

// CRUD básico
router.post('/', configuracionController.createConfiguracion.bind(configuracionController));
router.get('/', configuracionController.getConfiguraciones.bind(configuracionController));

// Rutas específicas por tipo y categoría
router.get('/tipo/:tipo', configuracionController.getConfiguracionesByTipo.bind(configuracionController));
router.get('/categoria/:categoria', configuracionController.getConfiguracionesByCategoria.bind(configuracionController));
router.get('/prefijo/:prefijo', configuracionController.getConfiguracionesPorPrefijo.bind(configuracionController));

// Rutas para obtener/establecer valores tipados
router.get('/valor/:clave/:tipo', configuracionController.getValorTipado.bind(configuracionController));
router.put('/valor/:clave/:tipo', configuracionController.setValorTipado.bind(configuracionController));

// Rutas por ID
router.get('/id/:id', configuracionController.getConfiguracionById.bind(configuracionController));
router.put('/id/:id', configuracionController.updateConfiguracion.bind(configuracionController));
router.delete('/id/:id', configuracionController.deleteConfiguracion.bind(configuracionController));

// Rutas por clave (más específicas, van al final)
router.get('/clave/:clave', configuracionController.getConfiguracionByClave.bind(configuracionController));
router.put('/clave/:clave', configuracionController.updateConfiguracionByClave.bind(configuracionController));
router.delete('/clave/:clave', configuracionController.deleteConfiguracionByClave.bind(configuracionController));
router.post('/clave/:clave', configuracionController.upsertConfiguracion.bind(configuracionController));

export default router;