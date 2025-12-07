import { Router } from 'express';
import { PersonaTipoController } from '@/controllers/persona-tipo.controller';
import { ContactoPersonaController } from '@/controllers/contacto-persona.controller';
import { PersonaTipoService } from '@/services/persona-tipo.service';
import { ContactoService } from '@/services/contacto.service';
import { PersonaTipoRepository } from '@/repositories/persona-tipo.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies - Tipos de Persona
const personaTipoRepository = new PersonaTipoRepository(prisma);
const personaRepository = new PersonaRepository(prisma);
const personaTipoService = new PersonaTipoService(personaTipoRepository, personaRepository);
const personaTipoController = new PersonaTipoController(personaTipoService);

// Initialize dependencies - Contactos de Persona
const contactoService = new ContactoService(prisma);
const contactoPersonaController = new ContactoPersonaController(contactoService);

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
  contactoPersonaController.agregarContacto.bind(contactoPersonaController)
);

// Obtener contactos de una persona
router.get(
  '/personas/:personaId/contactos',
  contactoPersonaController.getContactosByPersona.bind(contactoPersonaController)
);

// Obtener un contacto específico
router.get(
  '/personas/:personaId/contactos/:contactoId',
  contactoPersonaController.getContactoById.bind(contactoPersonaController)
);

// Actualizar contacto
router.put(
  '/personas/:personaId/contactos/:contactoId',
  contactoPersonaController.updateContacto.bind(contactoPersonaController)
);

// Eliminar contacto (soft delete)
router.delete(
  '/personas/:personaId/contactos/:contactoId',
  contactoPersonaController.eliminarContacto.bind(contactoPersonaController)
);

// Eliminar contacto permanentemente (hard delete)
router.delete(
  '/personas/:personaId/contactos/:contactoId/permanente',
  contactoPersonaController.eliminarContactoPermanente.bind(contactoPersonaController)
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
