"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracionController = void 0;
const configuracion_dto_1 = require("@/dto/configuracion.dto");
const zod_1 = require("zod");
class ConfiguracionController {
    constructor(configuracionService) {
        this.configuracionService = configuracionService;
    }
    async createConfiguracion(req, res) {
        try {
            const validatedData = configuracion_dto_1.createConfiguracionSchema.parse(req.body);
            const configuracion = await this.configuracionService.create(validatedData);
            res.status(201).json({
                success: true,
                message: 'Configuración creada exitosamente',
                data: configuracion
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async getConfiguraciones(req, res) {
        try {
            const query = configuracion_dto_1.configuracionQuerySchema.parse(req.query);
            const result = await this.configuracionService.findAll(query);
            res.json({
                success: true,
                message: 'Configuraciones obtenidas exitosamente',
                data: result.data,
                pagination: {
                    page: result.page,
                    limit: query.limit,
                    total: result.total,
                    totalPages: result.totalPages
                }
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación en parámetros de consulta',
                    errors: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async getConfiguracionById(req, res) {
        try {
            const { id } = req.params;
            const configuracion = await this.configuracionService.findById(id);
            res.json({
                success: true,
                message: 'Configuración obtenida exitosamente',
                data: configuracion
            });
        }
        catch (error) {
            const statusCode = error instanceof Error && error.message.includes('no encontrada') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async getConfiguracionByClave(req, res) {
        try {
            const { clave } = req.params;
            const configuracion = await this.configuracionService.findByClave(clave);
            res.json({
                success: true,
                message: 'Configuración obtenida exitosamente',
                data: configuracion
            });
        }
        catch (error) {
            const statusCode = error instanceof Error && error.message.includes('no encontrada') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async getConfiguracionesByTipo(req, res) {
        try {
            const { tipo } = req.params;
            if (!Object.values(configuracion_dto_1.TipoConfiguracion).includes(tipo)) {
                return res.status(400).json({
                    success: false,
                    message: `Tipo inválido. Valores permitidos: ${Object.values(configuracion_dto_1.TipoConfiguracion).join(', ')}`
                });
            }
            const configuraciones = await this.configuracionService.findByTipo(tipo);
            res.json({
                success: true,
                message: 'Configuraciones obtenidas exitosamente',
                data: configuraciones
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async getConfiguracionesByCategoria(req, res) {
        try {
            const { categoria } = req.params;
            const configuraciones = await this.configuracionService.findByCategoria(categoria);
            res.json({
                success: true,
                message: 'Configuraciones obtenidas exitosamente',
                data: configuraciones
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async updateConfiguracion(req, res) {
        try {
            const { id } = req.params;
            const validatedData = configuracion_dto_1.updateConfiguracionSchema.parse(req.body);
            const configuracion = await this.configuracionService.update(id, validatedData);
            res.json({
                success: true,
                message: 'Configuración actualizada exitosamente',
                data: configuracion
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            const statusCode = error instanceof Error && error.message.includes('no encontrada') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async updateConfiguracionByClave(req, res) {
        try {
            const { clave } = req.params;
            const validatedData = configuracion_dto_1.updateConfiguracionSchema.parse(req.body);
            const configuracion = await this.configuracionService.updateByClave(clave, validatedData);
            res.json({
                success: true,
                message: 'Configuración actualizada exitosamente',
                data: configuracion
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            const statusCode = error instanceof Error && error.message.includes('no encontrada') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async deleteConfiguracion(req, res) {
        try {
            const { id } = req.params;
            const configuracion = await this.configuracionService.delete(id);
            res.json({
                success: true,
                message: 'Configuración eliminada exitosamente',
                data: configuracion
            });
        }
        catch (error) {
            let statusCode = 500;
            if (error instanceof Error) {
                if (error.message.includes('no encontrada')) {
                    statusCode = 404;
                }
                else if (error.message.includes('no se puede eliminar')) {
                    statusCode = 403;
                }
            }
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async deleteConfiguracionByClave(req, res) {
        try {
            const { clave } = req.params;
            const configuracion = await this.configuracionService.deleteByClave(clave);
            res.json({
                success: true,
                message: 'Configuración eliminada exitosamente',
                data: configuracion
            });
        }
        catch (error) {
            let statusCode = 500;
            if (error instanceof Error) {
                if (error.message.includes('no encontrada')) {
                    statusCode = 404;
                }
                else if (error.message.includes('no se puede eliminar')) {
                    statusCode = 403;
                }
            }
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async upsertConfiguracion(req, res) {
        try {
            const { clave } = req.params;
            const validatedData = configuracion_dto_1.createConfiguracionSchema.parse(req.body);
            const configuracion = await this.configuracionService.upsert(clave, validatedData);
            res.json({
                success: true,
                message: 'Configuración guardada exitosamente',
                data: configuracion
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async bulkUpsert(req, res) {
        try {
            const validatedData = configuracion_dto_1.importarConfiguracionesSchema.parse(req.body);
            const result = await this.configuracionService.bulkUpsert(validatedData);
            res.json({
                success: true,
                message: `${result.procesadas} configuraciones procesadas exitosamente`,
                data: {
                    procesadas: result.procesadas,
                    errores: result.errores,
                    configuraciones: result.configuraciones
                }
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async exportarTodas(req, res) {
        try {
            const configuraciones = await this.configuracionService.exportarTodas();
            res.json({
                success: true,
                message: 'Configuraciones exportadas exitosamente',
                data: configuraciones,
                total: configuraciones.length
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async getConfiguracionesPorPrefijo(req, res) {
        try {
            const { prefijo } = req.params;
            const configuraciones = await this.configuracionService.getConfiguracionesPorPrefijo(prefijo);
            res.json({
                success: true,
                message: 'Configuraciones obtenidas exitosamente',
                data: configuraciones
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async contarPorTipo(req, res) {
        try {
            const estadisticas = await this.configuracionService.contarPorTipo();
            res.json({
                success: true,
                message: 'Estadísticas obtenidas exitosamente',
                data: estadisticas
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async buscarPorValor(req, res) {
        try {
            const { q } = req.query;
            if (!q || typeof q !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'El parámetro "q" es requerido para la búsqueda'
                });
            }
            const configuraciones = await this.configuracionService.buscarPorValor(q);
            res.json({
                success: true,
                message: 'Búsqueda completada exitosamente',
                data: configuraciones
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async getConfiguracionesModificadasRecientemente(req, res) {
        try {
            const { dias } = req.query;
            const diasNum = dias ? parseInt(dias) : 7;
            if (isNaN(diasNum)) {
                return res.status(400).json({
                    success: false,
                    message: 'El parámetro "dias" debe ser un número válido'
                });
            }
            const configuraciones = await this.configuracionService.getConfiguracionesModificadasRecientemente(diasNum);
            res.json({
                success: true,
                message: 'Configuraciones modificadas obtenidas exitosamente',
                data: configuraciones
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async validarIntegridad(req, res) {
        try {
            const reporte = await this.configuracionService.validarIntegridad();
            const hasErrors = reporte.valoresInvalidos.length > 0 ||
                reporte.clavesConflictivas.length > 0 ||
                reporte.configuracinosFaltantes.length > 0;
            res.json({
                success: !hasErrors,
                message: hasErrors ? 'Se encontraron problemas de integridad' : 'Sistema íntegro',
                data: reporte
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async getValorTipado(req, res) {
        try {
            const { clave, tipo } = req.params;
            if (!Object.values(configuracion_dto_1.TipoConfiguracion).includes(tipo)) {
                return res.status(400).json({
                    success: false,
                    message: `Tipo inválido. Valores permitidos: ${Object.values(configuracion_dto_1.TipoConfiguracion).join(', ')}`
                });
            }
            const valor = await this.configuracionService.getValorTipado(clave, tipo);
            res.json({
                success: true,
                message: 'Valor obtenido exitosamente',
                data: {
                    clave,
                    valor,
                    tipo
                }
            });
        }
        catch (error) {
            const statusCode = error instanceof Error && error.message.includes('no encontrada') ? 404 : 400;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async setValorTipado(req, res) {
        try {
            const { clave, tipo } = req.params;
            const { valor } = req.body;
            if (!Object.values(configuracion_dto_1.TipoConfiguracion).includes(tipo)) {
                return res.status(400).json({
                    success: false,
                    message: `Tipo inválido. Valores permitidos: ${Object.values(configuracion_dto_1.TipoConfiguracion).join(', ')}`
                });
            }
            if (valor === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'El campo "valor" es requerido'
                });
            }
            const configuracion = await this.configuracionService.setValorTipado(clave, valor, tipo);
            res.json({
                success: true,
                message: 'Valor actualizado exitosamente',
                data: configuracion
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
    async inicializarSistema(req, res) {
        try {
            const result = await this.configuracionService.inicializarConfiguracionesSistema();
            res.json({
                success: true,
                message: `Sistema inicializado. ${result.creadas} configuraciones creadas`,
                data: {
                    creadas: result.creadas,
                    errores: result.errores
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
}
exports.ConfiguracionController = ConfiguracionController;
//# sourceMappingURL=configuracion.controller.js.map