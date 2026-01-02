import { Router } from 'express';
import { CatalogoAdminController } from '@/controllers/catalogo-admin.controller';
import { CatalogoService } from '@/services/catalogo.service';
import { CatalogoRepository } from '@/repositories/catalogo.repository';
import { TipoContactoController } from '@/controllers/tipo-contacto.controller';
import { TipoContactoService } from '@/services/tipo-contacto.service';
import { prisma } from '@/config/database';

// IMPORTANTE: Descomentar cuando se implemente autenticación
// import { authMiddleware, adminMiddleware } from '@/middleware/auth.middleware';

const router = Router();

// Initialize dependencies
const catalogoRepository = new CatalogoRepository(prisma);
const catalogoService = new CatalogoService(catalogoRepository);
const catalogoAdminController = new CatalogoAdminController(catalogoService);

// Initialize TipoContacto dependencies
const tipoContactoService = new TipoContactoService(prisma);
const tipoContactoController = new TipoContactoController(tipoContactoService);

// ======================================================================
// MIDDLEWARE DE AUTENTICACIÓN Y AUTORIZACIÓN
// ======================================================================

// IMPORTANTE: Descomentar estas líneas cuando se implemente autenticación
// router.use(authMiddleware);  // Verificar que el usuario está autenticado
// router.use(adminMiddleware);  // Verificar que el usuario tiene rol ADMIN

// ======================================================================
// RUTAS DE GESTIÓN DE TIPOS DE PERSONA
// ======================================================================

// Crear nuevo tipo de persona
router.post(
  '/tipos-persona',
  catalogoAdminController.createTipoPersona.bind(catalogoAdminController)
);

// Listar todos los tipos con estadísticas
router.get(
  '/tipos-persona',
  catalogoAdminController.getAllTiposPersonaWithStats.bind(catalogoAdminController)
);

// Obtener un tipo específico
router.get(
  '/tipos-persona/:id',
  catalogoAdminController.getTipoPersonaById.bind(catalogoAdminController)
);

// Actualizar un tipo
router.put(
  '/tipos-persona/:id',
  catalogoAdminController.updateTipoPersona.bind(catalogoAdminController)
);

// Activar/Desactivar un tipo
router.patch(
  '/tipos-persona/:id/toggle',
  catalogoAdminController.toggleActivoTipoPersona.bind(catalogoAdminController)
);

// Eliminar un tipo
router.delete(
  '/tipos-persona/:id',
  catalogoAdminController.deleteTipoPersona.bind(catalogoAdminController)
);

// ======================================================================
// RUTAS DE GESTIÓN DE ESPECIALIDADES DOCENTES
// ======================================================================

// Crear nueva especialidad
router.post(
  '/especialidades-docentes',
  catalogoAdminController.createEspecialidad.bind(catalogoAdminController)
);

// Listar todas las especialidades con estadísticas
router.get(
  '/especialidades-docentes',
  catalogoAdminController.getAllEspecialidadesWithStats.bind(catalogoAdminController)
);

// Obtener una especialidad específica
router.get(
  '/especialidades-docentes/:id',
  catalogoAdminController.getEspecialidadById.bind(catalogoAdminController)
);

// Actualizar una especialidad
router.put(
  '/especialidades-docentes/:id',
  catalogoAdminController.updateEspecialidad.bind(catalogoAdminController)
);

// Activar/Desactivar una especialidad
router.patch(
  '/especialidades-docentes/:id/toggle',
  catalogoAdminController.toggleActivoEspecialidad.bind(catalogoAdminController)
);

// Eliminar una especialidad
router.delete(
  '/especialidades-docentes/:id',
  catalogoAdminController.deleteEspecialidad.bind(catalogoAdminController)
);

// ======================================================================
// RUTAS DE GESTIÓN DE TIPOS DE CONTACTO
// ======================================================================

// Obtener estadísticas de uso (debe ir antes de /:id)
router.get(
  '/tipos-contacto/estadisticas/uso',
  tipoContactoController.getEstadisticasUso.bind(tipoContactoController)
);

// Crear nuevo tipo de contacto
router.post(
  '/tipos-contacto',
  tipoContactoController.create.bind(tipoContactoController)
);

// Listar todos los tipos de contacto
router.get(
  '/tipos-contacto',
  tipoContactoController.findAll.bind(tipoContactoController)
);

// Obtener un tipo de contacto específico
router.get(
  '/tipos-contacto/:id',
  tipoContactoController.findById.bind(tipoContactoController)
);

// Actualizar un tipo de contacto
router.put(
  '/tipos-contacto/:id',
  tipoContactoController.update.bind(tipoContactoController)
);

// Activar un tipo de contacto
router.post(
  '/tipos-contacto/:id/activar',
  tipoContactoController.activate.bind(tipoContactoController)
);

// Desactivar un tipo de contacto (soft delete)
router.post(
  '/tipos-contacto/:id/desactivar',
  tipoContactoController.deactivate.bind(tipoContactoController)
);

// Eliminar un tipo de contacto (hard delete)
router.delete(
  '/tipos-contacto/:id',
  tipoContactoController.delete.bind(tipoContactoController)
);

export default router;
