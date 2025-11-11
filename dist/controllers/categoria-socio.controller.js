"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriaSocioController = void 0;
const categoria_socio_dto_1 = require("@/dto/categoria-socio.dto");
const zod_1 = require("zod");
class CategoriaSocioController {
    constructor(service) {
        this.service = service;
    }
    async getCategorias(req, res) {
        try {
            const query = categoria_socio_dto_1.categoriaSocioQuerySchema.parse(req.query);
            const categorias = await this.service.getCategorias(query);
            res.status(200).json({
                success: true,
                data: categorias,
                total: categorias.length
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validación fallida',
                    details: error.errors
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Error al obtener categorías'
                });
            }
        }
    }
    async getCategoriaById(req, res) {
        try {
            const { id } = req.params;
            const categoria = await this.service.getCategoriaById(id);
            res.status(200).json({
                success: true,
                data: categoria
            });
        }
        catch (error) {
            res.status(404).json({
                success: false,
                error: error instanceof Error ? error.message : 'Categoría no encontrada'
            });
        }
    }
    async getCategoriaByCodigo(req, res) {
        try {
            const { codigo } = req.params;
            const categoria = await this.service.getCategoriaByCodigo(codigo);
            res.status(200).json({
                success: true,
                data: categoria
            });
        }
        catch (error) {
            res.status(404).json({
                success: false,
                error: error instanceof Error ? error.message : 'Categoría no encontrada'
            });
        }
    }
    async createCategoria(req, res) {
        try {
            const validated = categoria_socio_dto_1.createCategoriaSocioSchema.parse(req.body);
            const categoria = await this.service.createCategoria(validated);
            res.status(201).json({
                success: true,
                data: categoria,
                message: 'Categoría creada exitosamente'
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validación fallida',
                    details: error.errors
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Error al crear categoría'
                });
            }
        }
    }
    async updateCategoria(req, res) {
        try {
            const { id } = req.params;
            const validated = categoria_socio_dto_1.updateCategoriaSocioSchema.parse(req.body);
            const categoria = await this.service.updateCategoria(id, validated);
            res.status(200).json({
                success: true,
                data: categoria,
                message: 'Categoría actualizada exitosamente'
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validación fallida',
                    details: error.errors
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Error al actualizar categoría'
                });
            }
        }
    }
    async deleteCategoria(req, res) {
        try {
            const { id } = req.params;
            await this.service.deleteCategoria(id);
            res.status(200).json({
                success: true,
                message: 'Categoría eliminada exitosamente'
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error al eliminar categoría'
            });
        }
    }
    async getStats(req, res) {
        try {
            const { id } = req.params;
            const result = await this.service.getStats(id);
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            res.status(404).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error al obtener estadísticas'
            });
        }
    }
    async toggleActive(req, res) {
        try {
            const { id } = req.params;
            const categoria = await this.service.toggleActive(id);
            res.status(200).json({
                success: true,
                data: categoria,
                message: `Categoría ${categoria.activa ? 'activada' : 'desactivada'} exitosamente`
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error al cambiar estado de categoría'
            });
        }
    }
    async reorder(req, res) {
        try {
            const { categoriaIds } = req.body;
            if (!Array.isArray(categoriaIds) || categoriaIds.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'Se requiere un array de IDs de categorías'
                });
                return;
            }
            await this.service.reorder(categoriaIds);
            res.status(200).json({
                success: true,
                message: 'Orden de categorías actualizado exitosamente'
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error al reordenar categorías'
            });
        }
    }
}
exports.CategoriaSocioController = CategoriaSocioController;
//# sourceMappingURL=categoria-socio.controller.js.map