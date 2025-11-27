import { Router } from 'express';
import { EstadosAulaController } from '@/controllers/estados-aula.controller';
import { EstadosAulaService } from '@/services/estados-aula.service';
import { EstadosAulaRepository } from '@/repositories/estados-aula.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const repository = new EstadosAulaRepository(prisma);
const service = new EstadosAulaService(repository);
const controller = new EstadosAulaController(service);

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
