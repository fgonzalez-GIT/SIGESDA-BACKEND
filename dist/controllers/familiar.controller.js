"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamiliarController = void 0;
const familiar_dto_1 = require("@/dto/familiar.dto");
const enums_1 = require("@/types/enums");
class FamiliarController {
    constructor(familiarService) {
        this.familiarService = familiarService;
    }
    async createFamiliar(req, res, next) {
        try {
            const validatedData = familiar_dto_1.createFamiliarSchema.parse(req.body);
            const familiar = await this.familiarService.createFamiliar(validatedData);
            const response = {
                success: true,
                message: 'Relación familiar creada exitosamente',
                data: familiar
            };
            res.status(enums_1.HttpStatus.CREATED).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getFamiliares(req, res, next) {
        try {
            const query = familiar_dto_1.familiarQuerySchema.parse(req.query);
            const result = await this.familiarService.getFamiliares(query);
            const response = {
                success: true,
                data: result.data,
                meta: {
                    page: query.page,
                    limit: query.limit,
                    total: result.total,
                    totalPages: result.pages
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getFamiliarById(req, res, next) {
        try {
            const { id } = req.params;
            const familiar = await this.familiarService.getFamiliarById(parseInt(id));
            if (!familiar) {
                const response = {
                    success: false,
                    error: 'Relación familiar no encontrada'
                };
                res.status(enums_1.HttpStatus.NOT_FOUND).json(response);
                return;
            }
            const response = {
                success: true,
                data: familiar
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getFamiliarsBySocio(req, res, next) {
        try {
            const { socioId } = req.params;
            const { includeInactivos } = req.query;
            const includeInactivosFlag = includeInactivos === 'true';
            const familiares = await this.familiarService.getFamiliarsBySocio(parseInt(socioId), includeInactivosFlag);
            const response = {
                success: true,
                data: familiares,
                meta: {
                    socioId,
                    includeInactivos: includeInactivosFlag,
                    total: familiares.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async updateFamiliar(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = familiar_dto_1.updateFamiliarSchema.parse(req.body);
            const familiar = await this.familiarService.updateFamiliar(parseInt(id), validatedData);
            const response = {
                success: true,
                message: 'Relación familiar actualizada exitosamente',
                data: familiar
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteFamiliar(req, res, next) {
        try {
            const { id } = req.params;
            const familiar = await this.familiarService.deleteFamiliar(parseInt(id));
            const response = {
                success: true,
                message: 'Relación familiar eliminada exitosamente',
                data: familiar
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async createBulkFamiliares(req, res, next) {
        try {
            const validatedData = familiar_dto_1.createBulkFamiliaresSchema.parse(req.body);
            const result = await this.familiarService.createBulkFamiliares(validatedData);
            const response = {
                success: true,
                message: `Creación masiva completada: ${result.count} relaciones creadas`,
                data: {
                    created: result.count,
                    errors: result.errors
                },
                meta: {
                    totalAttempted: validatedData.familiares.length,
                    successful: result.count,
                    failed: result.errors.length
                }
            };
            const statusCode = result.errors.length > 0 ? 207 : enums_1.HttpStatus.CREATED;
            res.status(statusCode).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteBulkFamiliares(req, res, next) {
        try {
            const validatedData = familiar_dto_1.deleteBulkFamiliaresSchema.parse(req.body);
            const result = await this.familiarService.deleteBulkFamiliares(validatedData);
            const response = {
                success: true,
                message: `${result.count} relaciones familiares eliminadas`,
                data: result
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async searchFamiliares(req, res, next) {
        try {
            const searchData = familiar_dto_1.familiarSearchSchema.parse(req.query);
            const familiares = await this.familiarService.searchFamiliares(searchData);
            const response = {
                success: true,
                data: familiares,
                meta: {
                    searchTerm: searchData.search,
                    searchBy: searchData.searchBy,
                    total: familiares.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getParentescoStats(req, res, next) {
        try {
            const stats = await this.familiarService.getParentescoStats();
            const response = {
                success: true,
                data: stats,
                meta: {
                    totalTypes: stats.length,
                    totalRelations: stats.reduce((sum, stat) => sum + stat.count, 0)
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getFamilyTree(req, res, next) {
        try {
            const { socioId } = req.params;
            const familyTree = await this.familiarService.getFamilyTree(parseInt(socioId));
            const response = {
                success: true,
                data: familyTree
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getTiposParentesco(req, res, next) {
        try {
            const tipos = await this.familiarService.getTiposParentesco();
            const response = {
                success: true,
                data: tipos,
                meta: {
                    total: tipos.length
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async checkRelationExists(req, res, next) {
        try {
            const { socioId, familiarId } = req.params;
            const existing = await this.familiarService.getFamiliares({
                socioId: parseInt(socioId),
                familiarId: parseInt(familiarId),
                page: 1,
                limit: 1,
                includeInactivos: false,
                soloActivos: true
            });
            const exists = existing.total > 0;
            const response = {
                success: true,
                data: {
                    exists,
                    relation: exists ? existing.data[0] : null
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getAvailableFamiliares(req, res, next) {
        try {
            const { socioId } = req.params;
            const existingFamiliares = await this.familiarService.getFamiliarsBySocio(parseInt(socioId), false);
            const familiarIds = existingFamiliares.map(f => f.familiarId);
            const response = {
                success: true,
                message: 'Para implementar: obtener socios disponibles excluyendo familiares existentes',
                data: {
                    socioId,
                    excludeIds: [...familiarIds, socioId]
                }
            };
            res.status(enums_1.HttpStatus.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.FamiliarController = FamiliarController;
//# sourceMappingURL=familiar.controller.js.map