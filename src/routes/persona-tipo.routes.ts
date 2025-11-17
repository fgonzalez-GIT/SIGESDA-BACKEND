import { Router } from 'express';
import { PersonaTipoController } from '@/controllers/persona-tipo.controller';
import { PersonaTipoService } from '@/services/persona-tipo.service';
import { PersonaTipoRepository } from '@/repositories/persona-tipo.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const personaTipoRepository = new PersonaTipoRepository(prisma);
const personaRepository = new PersonaRepository(prisma);
const personaTipoService = new PersonaTipoService(personaTipoRepository, personaRepository);
const personaTipoController = new PersonaTipoController(personaTipoService);

// ======================================================================
// RUTAS DE GESTIÓN DE TIPOS
// ======================================================================

// Asignar tipo a persona
router.post(
  '/personas/:personaId/tipos',
  personaTipoController.asignarTipo.bind(personaTipoController)
);

// Obtener tipos de una persona
router.get(
  '/personas/:personaId/tipos',
  personaTipoController.getTiposByPersona.bind(personaTipoController)
);

// Actualizar datos de un tipo
router.put(
  '/personas/:personaId/tipos/:tipoId',
  personaTipoController.updateTipo.bind(personaTipoController)
);

// Desasignar tipo (soft delete)
router.delete(
  '/personas/:personaId/tipos/:tipoPersonaId',
  personaTipoController.desasignarTipo.bind(personaTipoController)
);

// Eliminar tipo permanentemente (hard delete)
router.delete(
  '/personas/:personaId/tipos/:tipoPersonaId/hard',
  personaTipoController.eliminarTipo.bind(personaTipoController)
);

// ======================================================================
// RUTAS DE GESTIÓN DE CONTACTOS
// ======================================================================

// Agregar contacto a persona
router.post(
  '/personas/:personaId/contactos',
  personaTipoController.agregarContacto.bind(personaTipoController)
);

// Obtener contactos de una persona
router.get(
  '/personas/:personaId/contactos',
  personaTipoController.getContactosByPersona.bind(personaTipoController)
);

// Actualizar contacto
router.put(
  '/personas/:personaId/contactos/:contactoId',
  personaTipoController.updateContacto.bind(personaTipoController)
);

// Eliminar contacto
router.delete(
  '/personas/:personaId/contactos/:contactoId',
  personaTipoController.eliminarContacto.bind(personaTipoController)
);

// ======================================================================
// RUTAS DE CATÁLOGOS
// ======================================================================

// Catálogo de tipos de persona
router.get(
  '/catalogos/tipos-persona',
  personaTipoController.getTiposPersona.bind(personaTipoController)
);

router.get(
  '/catalogos/tipos-persona/:codigo',
  personaTipoController.getTipoPersonaByCodigo.bind(personaTipoController)
);

// Catálogo de especialidades de docentes
router.get(
  '/catalogos/especialidades-docentes',
  personaTipoController.getEspecialidadesDocentes.bind(personaTipoController)
);

router.get(
  '/catalogos/especialidades-docentes/:codigo',
  personaTipoController.getEspecialidadByCodigo.bind(personaTipoController)
);

// Catálogo de razones sociales
router.get(
  '/catalogos/razones-sociales',
  personaTipoController.getRazonesSociales.bind(personaTipoController)
);

router.get(
  '/catalogos/razones-sociales/:codigo',
  personaTipoController.getRazonSocialByCodigo.bind(personaTipoController)
);

export default router;
