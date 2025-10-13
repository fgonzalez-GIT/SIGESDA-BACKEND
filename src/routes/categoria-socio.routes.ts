import { Router } from 'express';
import { CategoriaSocioController } from '@/controllers/categoria-socio.controller';
import { CategoriaSocioService } from '@/services/categoria-socio.service';
import { CategoriaSocioRepository } from '@/repositories/categoria-socio.repository';
import DatabaseService from '@/config/database';

const prisma = DatabaseService.getInstance();
const repository = new CategoriaSocioRepository(prisma);
const service = new CategoriaSocioService(repository);
const controller = new CategoriaSocioController(service);

export const categoriaSocioRouter = Router();

// GET /api/categorias-socios - Listar todas las categorías
categoriaSocioRouter.get('/', (req, res) => controller.getCategorias(req, res));

// GET /api/categorias-socios/:id - Obtener categoría por ID
categoriaSocioRouter.get('/:id', (req, res) => controller.getCategoriaById(req, res));

// GET /api/categorias-socios/codigo/:codigo - Obtener categoría por código
categoriaSocioRouter.get('/codigo/:codigo', (req, res) => controller.getCategoriaByCodigo(req, res));

// GET /api/categorias-socios/:id/stats - Obtener estadísticas de una categoría
categoriaSocioRouter.get('/:id/stats', (req, res) => controller.getStats(req, res));

// POST /api/categorias-socios - Crear nueva categoría
categoriaSocioRouter.post('/', (req, res) => controller.createCategoria(req, res));

// PUT /api/categorias-socios/:id - Actualizar categoría
categoriaSocioRouter.put('/:id', (req, res) => controller.updateCategoria(req, res));

// PATCH /api/categorias-socios/:id/toggle - Activar/Desactivar categoría
categoriaSocioRouter.patch('/:id/toggle', (req, res) => controller.toggleActive(req, res));

// POST /api/categorias-socios/reorder - Reordenar categorías
categoriaSocioRouter.post('/reorder', (req, res) => controller.reorder(req, res));

// DELETE /api/categorias-socios/:id - Eliminar categoría
categoriaSocioRouter.delete('/:id', (req, res) => controller.deleteCategoria(req, res));
