import { Router } from 'express';
import { PersonaController } from '@/controllers/persona.controller.new';
import { PersonaService } from '@/services/persona.service.new';
import { PersonaRepository } from '@/repositories/persona.repository.new';
import { PersonaTipoRepository } from '@/repositories/persona-tipo.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const personaRepository = new PersonaRepository(prisma);
const personaTipoRepository = new PersonaTipoRepository(prisma);
const personaService = new PersonaService(personaRepository, personaTipoRepository);
const personaController = new PersonaController(personaService);

// ======================================================================
// RUTAS DE BÚSQUEDA Y FILTROS (antes de rutas con parámetros)
// ======================================================================

// Búsqueda por texto
router.get('/search', personaController.searchPersonas.bind(personaController));

// Listas por tipo específico
router.get('/socios', personaController.getSocios.bind(personaController));
router.get('/docentes', personaController.getDocentes.bind(personaController));
router.get('/proveedores', personaController.getProveedores.bind(personaController));

// Verificar DNI
router.get('/dni/:dni/check', personaController.checkDni.bind(personaController));

// ======================================================================
// CRUD BÁSICO
// ======================================================================

// Crear persona
router.post('/', personaController.createPersona.bind(personaController));

// Listar personas con filtros
router.get('/', personaController.getPersonas.bind(personaController));

// Obtener persona por ID
router.get('/:id', personaController.getPersonaById.bind(personaController));

// Actualizar datos base de persona
router.put('/:id', personaController.updatePersona.bind(personaController));

// Eliminar persona (soft/hard delete)
router.delete('/:id', personaController.deletePersona.bind(personaController));

// ======================================================================
// RUTAS ESPECIALES
// ======================================================================

// Reactivar persona inactiva
router.post('/:id/reactivate', personaController.reactivatePersona.bind(personaController));

// Obtener estado de persona
router.get('/:id/estado', personaController.getEstadoPersona.bind(personaController));

// Verificar si tiene tipo activo
router.get('/:id/tipos/:tipoCodigo/check', personaController.checkTipoActivo.bind(personaController));

export default router;
