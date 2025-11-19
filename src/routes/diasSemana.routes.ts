import { Router } from 'express';
import { DiasSemanaController } from '@/controllers/diasSemana.controller';
import { DiasSemanaService } from '@/services/diasSemana.service';
import { DiasSemanaRepository } from '@/repositories/diasSemana.repository';
import { prisma } from '@/config/database';

const router = Router();

const repository = new DiasSemanaRepository(prisma);
const service = new DiasSemanaService(repository);
const controller = new DiasSemanaController(service);

// Solo lectura - no se crean, actualizan ni eliminan días
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));

export default router;
