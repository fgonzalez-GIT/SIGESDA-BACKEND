import { Router } from 'express';
import personaRoutes from './persona.routes';
import personaTipoRoutes from './persona-tipo.routes';

/**
 * Router principal para el módulo de Personas v2
 * Integra todas las rutas relacionadas con personas, tipos y contactos
 */
const router = Router();

// Rutas de personas (CRUD base)
router.use('/personas', personaRoutes);

// Rutas de tipos y contactos (se montan en /api, no en /api/personas)
router.use('/', personaTipoRoutes);

export default router;
