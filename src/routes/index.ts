import { Router } from 'express';
import personaRoutes from './persona.routes';
import actividadRoutes from './actividad.routes';
import aulaRoutes from './aula.routes';
import configuracionRoutes from './configuracion.routes';
import participacionRoutes from './participacion.routes';

const router = Router();

// Mount routes
router.use('/personas', personaRoutes);
router.use('/actividades', actividadRoutes);
router.use('/aulas', aulaRoutes);
router.use('/configuracion', configuracionRoutes);
router.use('/participacion', participacionRoutes);

// Alias routes for convenience
router.use('/socios', personaRoutes); // Redirect to personas with tipo=SOCIO filter
router.use('/docentes', personaRoutes); // Redirect to personas with tipo=DOCENTE filter
router.use('/proveedores', personaRoutes); // Redirect to personas with tipo=PROVEEDOR filter

export default router;