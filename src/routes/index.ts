import { Router } from 'express';
import personaRoutes from './persona.routes';
import personaTipoRoutes from './persona-tipo.routes';
import actividadRoutes from './actividad.routes';
import aulaRoutes from './aula.routes';
import equipamientoRoutes from './equipamiento.routes';
import configuracionRoutes from './configuracion.routes';
import participacionRoutes from './participacion.routes';
import asistenciaRoutes from './asistencia.routes';
import familiarRoutes from './familiar.routes';
import reservaAulaRoutes from './reserva-aula.routes';
import reciboRoutes from './recibo.routes';
import cuotaRoutes from './cuota.routes';
import medioPagoRoutes from './medio-pago.routes';
import { categoriaSocioRouter } from './categoria-socio.routes';
import tiposActividadRoutes from './tiposActividad.routes';
import categoriasActividadRoutes from './categoriasActividad.routes';
import estadosActividadRoutes from './estadosActividad.routes';
import diasSemanaRoutes from './diasSemana.routes';
import rolesDocentesRoutes from './rolesDocentes.routes';

const router = Router();

// Mount routes
// IMPORTANTE: Rutas más específicas PRIMERO (antes de /actividades)

// Catálogos centralizados (nueva arquitectura - recomendado)
router.use('/catalogos/tipos-actividades', tiposActividadRoutes);
router.use('/catalogos/categorias-actividades', categoriasActividadRoutes);
router.use('/catalogos/estados-actividades', estadosActividadRoutes);
router.use('/catalogos/dias-semana', diasSemanaRoutes);
router.use('/catalogos/roles-docentes', rolesDocentesRoutes);

// Backward compatibility (rutas antiguas)
router.use('/actividades/tipos-actividad', tiposActividadRoutes);
router.use('/actividades/categorias-actividad', categoriasActividadRoutes);

// Rutas generales
router.use('/personas', personaRoutes);
router.use('/', personaTipoRoutes); // Rutas de persona-tipo (incluye personas/:id/tipos y catalogos)
router.use('/actividades', actividadRoutes);
router.use('/aulas', aulaRoutes);
router.use('/equipamientos', equipamientoRoutes);
router.use('/configuracion', configuracionRoutes);
router.use('/participacion', participacionRoutes);
router.use('/asistencias', asistenciaRoutes);
router.use('/familiares', familiarRoutes);
router.use('/reservas', reservaAulaRoutes);
router.use('/recibos', reciboRoutes);
router.use('/cuotas', cuotaRoutes);
router.use('/medios-pago', medioPagoRoutes);
router.use('/categorias-socios', categoriaSocioRouter);

// Alias routes for convenience
router.use('/socios', personaRoutes); // Redirect to personas with tipo=SOCIO filter
router.use('/docentes', personaRoutes); // Redirect to personas with tipo=DOCENTE filter
router.use('/proveedores', personaRoutes); // Redirect to personas with tipo=PROVEEDOR filter

export default router;