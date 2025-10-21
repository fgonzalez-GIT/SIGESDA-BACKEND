import { Router } from 'express';
import { CategoriasActividadController } from '@/controllers/categoriasActividad.controller';
import { CategoriasActividadService } from '@/services/categoriasActividad.service';
import { CategoriasActividadRepository } from '@/repositories/categoriasActividad.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const repository = new CategoriasActividadRepository(prisma);
const service = new CategoriasActividadService(repository);
const controller = new CategoriasActividadController(service);

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
