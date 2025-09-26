import { Router } from 'express';
import { PersonaController } from '@/controllers/persona.controller';
import { PersonaService } from '@/services/persona.service';
import { PersonaRepository } from '@/repositories/persona.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const personaRepository = new PersonaRepository(prisma);
const personaService = new PersonaService(personaRepository);
const personaController = new PersonaController(personaService);

// CRUD Routes
router.post('/', personaController.createPersona.bind(personaController));
router.get('/', personaController.getPersonas.bind(personaController));
router.get('/search', personaController.searchPersonas.bind(personaController));
router.get('/socios', personaController.getSocios.bind(personaController));
router.get('/docentes', personaController.getDocentes.bind(personaController));
router.get('/proveedores', personaController.getProveedores.bind(personaController));
router.get('/:id', personaController.getPersonaById.bind(personaController));
router.put('/:id', personaController.updatePersona.bind(personaController));
router.delete('/:id', personaController.deletePersona.bind(personaController));

export default router;