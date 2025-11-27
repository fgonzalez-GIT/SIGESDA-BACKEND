import { Router } from 'express';
import { CategoriasEquipamientoController } from '@/controllers/categorias-equipamiento.controller';
import { CategoriasEquipamientoService } from '@/services/categorias-equipamiento.service';
import { CategoriasEquipamientoRepository } from '@/repositories/categorias-equipamiento.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const repository = new CategoriasEquipamientoRepository(prisma);
const service = new CategoriasEquipamientoService(repository);
const controller = new CategoriasEquipamientoController(service);

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
