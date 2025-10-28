import { Router } from 'express';
import { CatalogoAdminController } from '@/controllers/catalogo-admin.controller';
import { CatalogoService } from '@/services/catalogo.service';
import { CatalogoRepository } from '@/repositories/catalogo.repository';
import { prisma } from '@/config/database';

// IMPORTANTE: Descomentar cuando se implemente autenticación
// import { authMiddleware, adminMiddleware } from '@/middleware/auth.middleware';

const router = Router();

// Initialize dependencies
const catalogoRepository = new CatalogoRepository(prisma);
const catalogoService = new CatalogoService(catalogoRepository);
const catalogoAdminController = new CatalogoAdminController(catalogoService);

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

export default router;
