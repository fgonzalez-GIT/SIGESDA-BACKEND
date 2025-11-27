import { Router } from 'express';
import { TiposAulaController } from '@/controllers/tipos-aula.controller';
import { TiposAulaService } from '@/services/tipos-aula.service';
import { TiposAulaRepository } from '@/repositories/tipos-aula.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const repository = new TiposAulaRepository(prisma);
const service = new TiposAulaService(repository);
const controller = new TiposAulaController(service);

// IMPORTANTE: Rutas específicas ANTES de rutas con parámetros

// Reorder (antes de /:id)
router.patch('/reorder', controller.reorder.bind(controller));

// CRUD básico
router.post('/', controller.create.bind(controller));
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
