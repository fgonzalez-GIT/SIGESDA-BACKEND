import { Router } from 'express';
import { AulaController } from '@/controllers/aula.controller';
import { AulaService } from '@/services/aula.service';
import { AulaRepository } from '@/repositories/aula.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const aulaRepository = new AulaRepository(prisma);
const aulaService = new AulaService(aulaRepository);
const aulaController = new AulaController(aulaService);

// Rutas de información y búsqueda (antes de las rutas con parámetros)
router.get('/search', aulaController.searchAulas.bind(aulaController));
router.get('/disponibles', aulaController.getAulasDisponibles.bind(aulaController));
router.get('/menor-uso', aulaController.getAulasConMenorUso.bind(aulaController));
router.get('/con-equipamiento', aulaController.getAulasConEquipamiento.bind(aulaController));
router.get('/por-capacidad', aulaController.getAulasPorCapacidad.bind(aulaController));

// CRUD básico
router.post('/', aulaController.createAula.bind(aulaController));
router.get('/', aulaController.getAulas.bind(aulaController));
router.get('/:id', aulaController.getAulaById.bind(aulaController));
router.put('/:id', aulaController.updateAula.bind(aulaController));
router.delete('/:id', aulaController.deleteAula.bind(aulaController));

// Rutas específicas por ID
router.post('/:id/verificar-disponibilidad', aulaController.verificarDisponibilidad.bind(aulaController));
router.get('/:id/estadisticas', aulaController.getEstadisticas.bind(aulaController));
router.get('/:id/reservas', aulaController.getReservasDelAula.bind(aulaController));

export default router;