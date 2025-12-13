"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoItemCuotaService = void 0;
const tipo_item_cuota_repository_1 = require("@/repositories/tipo-item-cuota.repository");
const categoria_item_repository_1 = require("@/repositories/categoria-item.repository");
const error_middleware_1 = require("@/middleware/error.middleware");
class TipoItemCuotaService {
    constructor() {
        this.repository = new tipo_item_cuota_repository_1.TipoItemCuotaRepository();
        this.categoriaRepository = new categoria_item_repository_1.CategoriaItemRepository();
    }
    async getAll(options) {
        return await this.repository.findAll(options);
    }
    async getById(id) {
        const tipo = await this.repository.findById(id);
        if (!tipo) {
            throw new error_middleware_1.AppError('Tipo de ítem no encontrado', 404);
        }
        return tipo;
    }
    async getByCodigo(codigo) {
        const tipo = await this.repository.findByCodigo(codigo);
        if (!tipo) {
            throw new error_middleware_1.AppError(`Tipo de ítem con código '${codigo}' no encontrado`, 404);
        }
        return tipo;
    }
    async getByCategoriaCodigo(categoriaCodigo, includeInactive = false) {
        return await this.repository.findByCategoriaCodigo(categoriaCodigo, { includeInactive });
    }
    async getCalculados(includeInactive = false) {
        return await this.repository.findCalculados({ includeInactive });
    }
    async getManuales(includeInactive = false) {
        return await this.repository.findManuales({ includeInactive });
    }
    async create(data) {
        const existente = await this.repository.findByCodigo(data.codigo);
        if (existente) {
            throw new error_middleware_1.AppError(`Ya existe un tipo de ítem con el código '${data.codigo}'`, 400);
        }
        const codigoRegex = /^[A-Z0-9_]+$/;
        if (!codigoRegex.test(data.codigo)) {
            throw new error_middleware_1.AppError('El código debe contener solo letras mayúsculas, números y guiones bajos', 400);
        }
        if (data.codigo.length < 2 || data.codigo.length > 100) {
            throw new error_middleware_1.AppError('El código debe tener entre 2 y 100 caracteres', 400);
        }
        if (data.nombre.length < 2 || data.nombre.length > 200) {
            throw new error_middleware_1.AppError('El nombre debe tener entre 2 y 200 caracteres', 400);
        }
        const categoria = await this.categoriaRepository.findById(data.categoriaItemId);
        if (!categoria) {
            throw new error_middleware_1.AppError('Categoría de ítem no encontrada', 404);
        }
        if (!categoria.activo) {
            throw new error_middleware_1.AppError('La categoría de ítem está inactiva', 400);
        }
        if (data.esCalculado && !data.formula) {
            throw new error_middleware_1.AppError('Los tipos calculados deben tener una fórmula', 400);
        }
        if (data.orden === undefined) {
            const tipos = await this.repository.findAll({ includeInactive: true });
            const maxOrden = tipos.reduce((max, tipo) => Math.max(max, tipo.orden), 0);
            data.orden = maxOrden + 1;
        }
        return await this.repository.create({
            codigo: data.codigo,
            nombre: data.nombre,
            descripcion: data.descripcion,
            categoriaItem: {
                connect: { id: data.categoriaItemId }
            },
            esCalculado: data.esCalculado ?? true,
            formula: data.formula,
            activo: true,
            orden: data.orden,
            configurable: data.configurable ?? true
        });
    }
    async update(id, data) {
        const tipo = await this.repository.findById(id);
        if (!tipo) {
            throw new error_middleware_1.AppError('Tipo de ítem no encontrado', 404);
        }
        if (data.nombre && (data.nombre.length < 2 || data.nombre.length > 200)) {
            throw new error_middleware_1.AppError('El nombre debe tener entre 2 y 200 caracteres', 400);
        }
        if (data.categoriaItemId) {
            const categoria = await this.categoriaRepository.findById(data.categoriaItemId);
            if (!categoria) {
                throw new error_middleware_1.AppError('Categoría de ítem no encontrada', 404);
            }
            if (!categoria.activo) {
                throw new error_middleware_1.AppError('La categoría de ítem está inactiva', 400);
            }
        }
        if (data.esCalculado === true && !data.formula && !tipo.formula) {
            throw new error_middleware_1.AppError('Los tipos calculados deben tener una fórmula', 400);
        }
        const updateData = {
            nombre: data.nombre,
            descripcion: data.descripcion,
            esCalculado: data.esCalculado,
            formula: data.formula,
            orden: data.orden,
            configurable: data.configurable,
            activo: data.activo
        };
        if (data.categoriaItemId) {
            updateData.categoriaItem = {
                connect: { id: data.categoriaItemId }
            };
        }
        return await this.repository.update(id, updateData);
    }
    async deactivate(id) {
        const tipo = await this.repository.findById(id);
        if (!tipo) {
            throw new error_middleware_1.AppError('Tipo de ítem no encontrado', 404);
        }
        if (!tipo.activo) {
            throw new error_middleware_1.AppError('El tipo de ítem ya está inactivo', 400);
        }
        const hasItems = await this.repository.hasItemsCuota(id);
        if (hasItems) {
            console.warn(`⚠️  Desactivando tipo '${tipo.nombre}' que tiene ítems de cuota asociados`);
        }
        return await this.repository.deactivate(id);
    }
    async activate(id) {
        const tipo = await this.repository.findById(id);
        if (!tipo) {
            throw new error_middleware_1.AppError('Tipo de ítem no encontrado', 404);
        }
        if (tipo.activo) {
            throw new error_middleware_1.AppError('El tipo de ítem ya está activo', 400);
        }
        if (!tipo.categoriaItem.activo) {
            throw new error_middleware_1.AppError('No se puede activar el tipo porque su categoría está inactiva', 400);
        }
        return await this.repository.activate(id);
    }
    async delete(id) {
        const tipo = await this.repository.findById(id);
        if (!tipo) {
            throw new error_middleware_1.AppError('Tipo de ítem no encontrado', 404);
        }
        const hasItems = await this.repository.hasItemsCuota(id);
        if (hasItems) {
            throw new error_middleware_1.AppError('No se puede eliminar el tipo porque tiene ítems de cuota asociados. Desactívelo en su lugar.', 400);
        }
        return await this.repository.delete(id);
    }
    async getUsageStats(id) {
        const stats = await this.repository.getUsageStats(id);
        if (!stats) {
            throw new error_middleware_1.AppError('Tipo de ítem no encontrado', 404);
        }
        return stats;
    }
    async updateFormula(id, formula) {
        const tipo = await this.repository.findById(id);
        if (!tipo) {
            throw new error_middleware_1.AppError('Tipo de ítem no encontrado', 404);
        }
        if (!tipo.esCalculado) {
            throw new error_middleware_1.AppError('No se puede asignar fórmula a un tipo manual', 400);
        }
        if (typeof formula !== 'object' || formula === null) {
            throw new error_middleware_1.AppError('La fórmula debe ser un objeto JSON válido', 400);
        }
        return await this.repository.updateFormula(id, formula);
    }
    async reorder(ordenamiento) {
        const ordenes = ordenamiento.map(o => o.orden);
        const ordenesUnicos = new Set(ordenes);
        if (ordenes.length !== ordenesUnicos.size) {
            throw new error_middleware_1.AppError('Los órdenes deben ser únicos', 400);
        }
        const updates = ordenamiento.map(({ id, orden }) => this.repository.updateOrden(id, orden));
        await Promise.all(updates);
        return { success: true, updated: ordenamiento.length };
    }
    async validateForUse(id) {
        const tipo = await this.repository.findById(id);
        if (!tipo) {
            throw new error_middleware_1.AppError('Tipo de ítem no encontrado', 404);
        }
        if (!tipo.activo) {
            throw new error_middleware_1.AppError('El tipo de ítem está inactivo', 400);
        }
        if (!tipo.categoriaItem.activo) {
            throw new error_middleware_1.AppError('La categoría del tipo de ítem está inactiva', 400);
        }
        return true;
    }
    async getSummaryByCategoria() {
        const categorias = await this.categoriaRepository.findAll({ includeInactive: false });
        const summary = await Promise.all(categorias.map(async (cat) => {
            const tipos = await this.repository.findAll({
                includeInactive: false,
                categoriaItemId: cat.id
            });
            return {
                categoria: {
                    id: cat.id,
                    codigo: cat.codigo,
                    nombre: cat.nombre,
                    icono: cat.icono,
                    color: cat.color
                },
                tipos: tipos.map(t => ({
                    id: t.id,
                    codigo: t.codigo,
                    nombre: t.nombre,
                    esCalculado: t.esCalculado,
                    orden: t.orden
                })),
                totalTipos: tipos.length
            };
        }));
        return {
            categorias: summary,
            totalCategorias: summary.length,
            totalTipos: summary.reduce((sum, cat) => sum + cat.totalTipos, 0)
        };
    }
    async clone(id, nuevoCodigo, nuevoNombre) {
        const tipoOriginal = await this.repository.findById(id);
        if (!tipoOriginal) {
            throw new error_middleware_1.AppError('Tipo de ítem no encontrado', 404);
        }
        const existente = await this.repository.findByCodigo(nuevoCodigo);
        if (existente) {
            throw new error_middleware_1.AppError(`Ya existe un tipo de ítem con el código '${nuevoCodigo}'`, 400);
        }
        return await this.create({
            codigo: nuevoCodigo,
            nombre: nuevoNombre,
            descripcion: tipoOriginal.descripcion || undefined,
            categoriaItemId: tipoOriginal.categoriaItemId,
            esCalculado: tipoOriginal.esCalculado,
            formula: tipoOriginal.formula,
            configurable: tipoOriginal.configurable
        });
    }
}
exports.TipoItemCuotaService = TipoItemCuotaService;
//# sourceMappingURL=tipo-item-cuota.service.js.map