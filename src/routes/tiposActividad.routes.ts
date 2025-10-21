import { Router } from 'express';
import { TiposActividadController } from '@/controllers/tiposActividad.controller';
import { TiposActividadService } from '@/services/tiposActividad.service';
import { TiposActividadRepository } from '@/repositories/tiposActividad.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const repository = new TiposActividadRepository(prisma);
const service = new TiposActividadService(repository);
const controller = new TiposActividadController(service);

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
