import { Router } from 'express';
import { RolesDocentesController } from '@/controllers/rolesDocentes.controller';
import { RolesDocentesService } from '@/services/rolesDocentes.service';
import { RolesDocentesRepository } from '@/repositories/rolesDocentes.repository';
import { prisma } from '@/config/database';

const router = Router();

const repository = new RolesDocentesRepository(prisma);
const service = new RolesDocentesService(repository);
const controller = new RolesDocentesController(service);

router.patch('/reorder', controller.reorder.bind(controller));
router.post('/', controller.create.bind(controller));
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
