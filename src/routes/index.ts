import { Router } from 'express';
import personaRoutes from './persona.routes';
import actividadRoutes from './actividad.routes';
import aulaRoutes from './aula.routes';
import configuracionRoutes from './configuracion.routes';
import participacionRoutes from './participacion.routes';
import familiarRoutes from './familiar.routes';
import reservaAulaRoutes from './reserva-aula.routes';
import reciboRoutes from './recibo.routes';
import cuotaRoutes from './cuota.routes';
import medioPagoRoutes from './medio-pago.routes';
import seccionRoutes from './seccion.routes';

const router = Router();

// Mount routes
router.use('/personas', personaRoutes);
router.use('/actividades', actividadRoutes);
router.use('/aulas', aulaRoutes);
router.use('/configuracion', configuracionRoutes);
router.use('/participacion', participacionRoutes);
router.use('/familiares', familiarRoutes);
router.use('/reservas', reservaAulaRoutes);
router.use('/recibos', reciboRoutes);
router.use('/cuotas', cuotaRoutes);
router.use('/medios-pago', medioPagoRoutes);
router.use('/secciones', seccionRoutes);

// Alias routes for convenience
router.use('/socios', personaRoutes); // Redirect to personas with tipo=SOCIO filter
router.use('/docentes', personaRoutes); // Redirect to personas with tipo=DOCENTE filter
router.use('/proveedores', personaRoutes); // Redirect to personas with tipo=PROVEEDOR filter

export default router;