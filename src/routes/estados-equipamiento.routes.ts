import { Router } from 'express';
import { EstadosEquipamientoController } from '@/controllers/estados-equipamiento.controller';
import { EstadosEquipamientoService } from '@/services/estados-equipamiento.service';
import { EstadosEquipamientoRepository } from '@/repositories/estados-equipamiento.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const repository = new EstadosEquipamientoRepository(prisma);
const service = new EstadosEquipamientoService(repository);
const controller = new EstadosEquipamientoController(service);

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
