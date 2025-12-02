import { Router } from 'express';
import { EquipamientoController } from '@/controllers/equipamiento.controller';
import { EquipamientoService } from '@/services/equipamiento.service';
import { EquipamientoRepository } from '@/repositories/equipamiento.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const equipamientoRepository = new EquipamientoRepository(prisma);
const equipamientoService = new EquipamientoService(equipamientoRepository);
const equipamientoController = new EquipamientoController(equipamientoService);

// CRUD básico
router.post('/', equipamientoController.createEquipamiento.bind(equipamientoController));
router.get('/', equipamientoController.getEquipamientos.bind(equipamientoController));
router.get('/:id', equipamientoController.getEquipamientoById.bind(equipamientoController));
router.put('/:id', equipamientoController.updateEquipamiento.bind(equipamientoController));
router.delete('/:id', equipamientoController.deleteEquipamiento.bind(equipamientoController));

// Rutas específicas por ID
router.post('/:id/reactivar', equipamientoController.reactivateEquipamiento.bind(equipamientoController));
router.get('/:id/estadisticas', equipamientoController.getEquipamientoStats.bind(equipamientoController));
router.get('/:id/disponibilidad', equipamientoController.getDisponibilidad.bind(equipamientoController));

export default router;
