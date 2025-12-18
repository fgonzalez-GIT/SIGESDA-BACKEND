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
import estadoReservaRoutes from './estado-reserva.routes';
import reciboRoutes from './recibo.routes';
import cuotaRoutes from './cuota.routes';
import medioPagoRoutes from './medio-pago.routes';
import { categoriaSocioRouter } from './categoria-socio.routes';
import tiposActividadRoutes from './tiposActividad.routes';
import categoriasActividadRoutes from './categoriasActividad.routes';
import estadosActividadRoutes from './estadosActividad.routes';
import diasSemanaRoutes from './diasSemana.routes';
import rolesDocentesRoutes from './rolesDocentes.routes';
import categoriasEquipamientoRoutes from './categorias-equipamiento.routes';
import tiposAulaRoutes from './tipos-aula.routes';
import estadosAulaRoutes from './estados-aula.routes';
import estadosEquipamientoRoutes from './estados-equipamiento.routes';
import actividadAulaRoutes from './actividad-aula.routes';
import catalogoAdminRoutes from './catalogo-admin.routes';
import tipoContactoRoutes from './tipo-contacto.routes';
import categoriaItemRoutes from './categoria-item.routes';
import tipoItemCuotaRoutes from './tipo-item-cuota.routes';
import itemCuotaRoutes from './item-cuota.routes';
import ajusteCuotaRoutes from './ajuste-cuota.routes';
import historialCuotaRoutes from './historial-cuota.routes';
import exencionCuotaRoutes from './exencion-cuota.routes';
import reportesCuotaRoutes from './reportes-cuota.routes';
import simuladorCuotaRoutes from './simulador-cuota.routes';
import ajusteMasivoRoutes from './ajuste-masivo.routes';
import rollbackCuotaRoutes from './rollback-cuota.routes';
import previewCuotaRoutes from './preview-cuota.routes';
import cuotaBatchRoutes from './cuota-batch.routes';

const router = Router();

// Mount routes
// IMPORTANTE: Rutas más específicas PRIMERO (antes de /actividades)

// Catálogos centralizados (nueva arquitectura - recomendado)
router.use('/catalogos/tipos-actividades', tiposActividadRoutes);
router.use('/catalogos/categorias-actividades', categoriasActividadRoutes);
router.use('/catalogos/estados-actividades', estadosActividadRoutes);
router.use('/catalogos/estados-reservas', estadoReservaRoutes);
router.use('/catalogos/dias-semana', diasSemanaRoutes);
router.use('/catalogos/roles-docentes', rolesDocentesRoutes);
router.use('/catalogos/categorias-equipamiento', categoriasEquipamientoRoutes);
router.use('/catalogos/estados-equipamientos', estadosEquipamientoRoutes);
router.use('/catalogos/tipos-aulas', tiposAulaRoutes);
router.use('/catalogos/estados-aulas', estadosAulaRoutes);
router.use('/catalogos/tipos-contacto', tipoContactoRoutes);
router.use('/catalogos/categorias-items', categoriaItemRoutes);
router.use('/catalogos/tipos-items-cuota', tipoItemCuotaRoutes);

// Admin catalog routes (protected, requires admin role when auth is enabled)
router.use('/admin/catalogos', catalogoAdminRoutes);

// Backward compatibility (rutas antiguas)
router.use('/actividades/tipos-actividad', tiposActividadRoutes);
router.use('/actividades/categorias-actividad', categoriasActividadRoutes);

// Rutas generales
router.use('/personas', personaRoutes);
router.use('/', personaTipoRoutes); // Rutas de persona-tipo (incluye personas/:id/tipos y catalogos)
router.use('/', actividadAulaRoutes); // Rutas con paths completos (/actividades-aulas, /actividades/:id/aulas, /aulas/:id/actividades)
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
router.use('/items-cuota', itemCuotaRoutes); // Rutas para operaciones individuales de ítems
router.use('/ajustes-cuota', ajusteCuotaRoutes); // FASE 4: Ajustes manuales a cuotas
router.use('/ajustes', ajusteMasivoRoutes); // FASE 5: Ajustes masivos de cuotas
router.use('/exenciones-cuota', exencionCuotaRoutes); // FASE 4: Exenciones temporales
router.use('/historial-cuota', historialCuotaRoutes); // FASE 4: Historial de cambios en cuotas
router.use('/reportes/cuotas', reportesCuotaRoutes); // FASE 4: Reportes y estadísticas de cuotas
router.use('/simulador/cuotas', simuladorCuotaRoutes); // FASE 5: Simulador de impacto de cuotas
router.use('/rollback/cuotas', rollbackCuotaRoutes); // FASE 5: Rollback de generación de cuotas
router.use('/preview/cuotas', previewCuotaRoutes); // FASE 5: Preview detallado de cuotas para UI
router.use('/cuotas/batch', cuotaBatchRoutes); // FASE 6: Operaciones batch optimizadas (30x más rápido)
router.use('/medios-pago', medioPagoRoutes);
router.use('/categorias-socios', categoriaSocioRouter);

// Alias routes for convenience
router.use('/socios', personaRoutes); // Redirect to personas with tipo=SOCIO filter
router.use('/docentes', personaRoutes); // Redirect to personas with tipo=DOCENTE filter
router.use('/proveedores', personaRoutes); // Redirect to personas with tipo=PROVEEDOR filter

export default router;