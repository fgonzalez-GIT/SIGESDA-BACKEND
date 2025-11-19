import { Router } from 'express';
import { EstadosActividadController } from '@/controllers/estadosActividad.controller';
import { EstadosActividadService } from '@/services/estadosActividad.service';
import { EstadosActividadRepository } from '@/repositories/estadosActividad.repository';
import { prisma } from '@/config/database';

const router = Router();

const repository = new EstadosActividadRepository(prisma);
const service = new EstadosActividadService(repository);
const controller = new EstadosActividadController(service);

router.patch('/reorder', controller.reorder.bind(controller));
router.post('/', controller.create.bind(controller));
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
