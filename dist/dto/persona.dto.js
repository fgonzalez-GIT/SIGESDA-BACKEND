"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPersonaLegacySchema = exports.personaQuerySchema = exports.updatePersonaSchema = exports.createPersonaSchema = void 0;
exports.validatePersonaTipoData = validatePersonaTipoData;
exports.transformLegacyToNew = transformLegacyToNew;
const zod_1 = require("zod");
const persona_tipo_dto_1 = require("./persona-tipo.dto");
const contacto_dto_1 = require("./contacto.dto");
const personaBaseSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1, 'Nombre es requerido').max(100),
    apellido: zod_1.z.string().min(1, 'Apellido es requerido').max(100),
    dni: zod_1.z.string().min(7, 'DNI debe tener al menos 7 caracteres').max(8, 'DNI debe tener máximo 8 caracteres'),
    email: zod_1.z.string().email('Email inválido').max(150).optional(),
    telefono: zod_1.z.string().max(20).optional(),
    direccion: zod_1.z.string().max(200).optional(),
    fechaNacimiento: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Fecha debe tener formato YYYY-MM-DD o ISO 8601').optional(),
    observaciones: zod_1.z.string().max(500).optional()
});
exports.createPersonaSchema = zod_1.z.preprocess((data) => {
    if (data && data.tipo) {
        let tiposArray = [];
        if (Array.isArray(data.tipo)) {
            tiposArray = data.tipo.map((codigo) => {
                const resultado = {
                    tipoPersonaCodigo: codigo
                };
                if (codigo === 'SOCIO') {
                    if (data.categoriaId)
                        resultado.categoriaId = data.categoriaId;
                    if (data.numeroSocio)
                        resultado.numeroSocio = data.numeroSocio;
                    if (data.fechaIngreso)
                        resultado.fechaIngreso = data.fechaIngreso;
                }
                if (codigo === 'DOCENTE') {
                    if (data.especialidadId)
                        resultado.especialidadId = data.especialidadId;
                    if (data.honorariosPorHora)
                        resultado.honorariosPorHora = data.honorariosPorHora;
                }
                if (codigo === 'PROVEEDOR') {
                    if (data.cuit)
                        resultado.cuit = data.cuit;
                    if (data.razonSocialId)
                        resultado.razonSocialId = data.razonSocialId;
                }
                return resultado;
            });
        }
        else if (typeof data.tipo === 'string') {
            const resultado = {
                tipoPersonaCodigo: data.tipo
            };
            if (data.tipo === 'SOCIO') {
                if (data.categoriaId)
                    resultado.categoriaId = data.categoriaId;
                if (data.numeroSocio)
                    resultado.numeroSocio = data.numeroSocio;
                if (data.fechaIngreso)
                    resultado.fechaIngreso = data.fechaIngreso;
            }
            if (data.tipo === 'DOCENTE') {
                if (data.especialidadId)
                    resultado.especialidadId = data.especialidadId;
                if (data.honorariosPorHora)
                    resultado.honorariosPorHora = data.honorariosPorHora;
            }
            if (data.tipo === 'PROVEEDOR') {
                if (data.cuit)
                    resultado.cuit = data.cuit;
                if (data.razonSocialId)
                    resultado.razonSocialId = data.razonSocialId;
            }
            tiposArray = [resultado];
        }
        const tiposExistentes = data.tipos || [];
        const nuevosDatos = {
            ...data,
            tipos: [...tiposExistentes, ...tiposArray]
        };
        delete nuevosDatos.tipo;
        delete nuevosDatos.categoriaId;
        delete nuevosDatos.numeroSocio;
        delete nuevosDatos.fechaIngreso;
        delete nuevosDatos.especialidadId;
        delete nuevosDatos.honorariosPorHora;
        delete nuevosDatos.cuit;
        delete nuevosDatos.razonSocialId;
        return nuevosDatos;
    }
    return data;
}, zod_1.z.object({
    ...personaBaseSchema.shape,
    tipos: zod_1.z.array(persona_tipo_dto_1.createPersonaTipoSchema).optional().default([]),
    contactos: zod_1.z.array(contacto_dto_1.createContactoPersonaSchema).optional().default([])
}));
exports.updatePersonaSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1).max(100).optional(),
    apellido: zod_1.z.string().min(1).max(100).optional(),
    dni: zod_1.z.string().min(7).max(8).optional(),
    email: zod_1.z.string().email().max(150).optional().nullable(),
    telefono: zod_1.z.string().max(20).optional().nullable(),
    direccion: zod_1.z.string().max(200).optional().nullable(),
    fechaNacimiento: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Fecha debe tener formato YYYY-MM-DD o ISO 8601').optional().nullable(),
    observaciones: zod_1.z.string().max(500).optional().nullable(),
    activo: zod_1.z.boolean().optional(),
    fechaBaja: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Fecha debe tener formato YYYY-MM-DD o ISO 8601').optional().nullable(),
    motivoBaja: zod_1.z.string().max(500).optional().nullable(),
    tipos: zod_1.z.array(persona_tipo_dto_1.createPersonaTipoSchema).optional(),
    contactos: zod_1.z.array(contacto_dto_1.createContactoPersonaSchema).optional()
});
exports.personaQuerySchema = zod_1.z.object({
    tiposCodigos: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val.split(',').map((s) => s.trim());
        }
        return val;
    }, zod_1.z.array(zod_1.z.enum(['NO_SOCIO', 'SOCIO', 'DOCENTE', 'PROVEEDOR'])).optional()),
    categoriaId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    especialidadId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    activo: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().optional()),
    search: zod_1.z.string().optional(),
    page: zod_1.z.preprocess((val) => {
        if (!val)
            return undefined;
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    limit: zod_1.z.preprocess((val) => {
        if (!val)
            return undefined;
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().max(100).optional()),
    includeTipos: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val !== undefined ? val : true;
    }, zod_1.z.boolean().default(true)),
    includeContactos: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val !== undefined ? val : true;
    }, zod_1.z.boolean().default(true))
});
exports.createPersonaLegacySchema = zod_1.z.preprocess((data) => {
    if (data && typeof data.tipo === 'string') {
        return { ...data, tipo: data.tipo.toUpperCase() };
    }
    return data;
}, zod_1.z.discriminatedUnion('tipo', [
    zod_1.z.object({
        ...personaBaseSchema.shape,
        tipo: zod_1.z.literal('SOCIO'),
        categoriaId: zod_1.z.number().int().positive('ID de categoría inválido'),
        fechaIngreso: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Fecha debe tener formato YYYY-MM-DD o ISO 8601').optional(),
        numeroSocio: zod_1.z.number().int().positive().optional()
    }),
    zod_1.z.object({
        ...personaBaseSchema.shape,
        tipo: zod_1.z.literal('NO_SOCIO')
    }),
    zod_1.z.object({
        ...personaBaseSchema.shape,
        tipo: zod_1.z.literal('DOCENTE'),
        especialidad: zod_1.z.string().min(1, 'Especialidad es requerida').max(100),
        honorariosPorHora: zod_1.z.number().nonnegative('Honorarios deben ser 0 o mayor').optional()
    }),
    zod_1.z.object({
        ...personaBaseSchema.shape,
        tipo: zod_1.z.literal('PROVEEDOR'),
        cuit: zod_1.z.string().min(11, 'CUIT debe tener 11 caracteres').max(11),
        razonSocialId: zod_1.z.number().int().positive('ID de razón social inválido')
    })
]));
function validatePersonaTipoData(tipoPersonaCodigo, data) {
    const errors = [];
    switch (tipoPersonaCodigo) {
        case 'SOCIO':
            break;
        case 'DOCENTE':
            break;
        case 'PROVEEDOR':
            if (!data.cuit) {
                errors.push('PROVEEDOR requiere cuit');
            }
            if (!data.razonSocialId) {
                errors.push('PROVEEDOR requiere razonSocialId');
            }
            break;
        case 'NO_SOCIO':
            break;
        default:
            errors.push(`Tipo de persona inválido: ${tipoPersonaCodigo}`);
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
function transformLegacyToNew(legacyData) {
    const { tipo, ...baseData } = legacyData;
    const newData = {
        ...baseData,
        tipos: [],
        contactos: []
    };
    const tipoData = {
        tipoPersonaCodigo: tipo
    };
    switch (tipo) {
        case 'SOCIO':
            if ('categoriaId' in legacyData) {
                tipoData.categoriaId = legacyData.categoriaId;
            }
            if ('numeroSocio' in legacyData) {
                tipoData.numeroSocio = legacyData.numeroSocio;
            }
            if ('fechaIngreso' in legacyData) {
                tipoData.fechaIngreso = legacyData.fechaIngreso;
            }
            break;
        case 'DOCENTE':
            tipoData.especialidadId = 1;
            if ('honorariosPorHora' in legacyData) {
                tipoData.honorariosPorHora = legacyData.honorariosPorHora;
            }
            break;
        case 'PROVEEDOR':
            if ('cuit' in legacyData) {
                tipoData.cuit = legacyData.cuit;
            }
            if ('razonSocialId' in legacyData) {
                tipoData.razonSocialId = legacyData.razonSocialId;
            }
            break;
    }
    newData.tipos = [tipoData];
    return newData;
}
//# sourceMappingURL=persona.dto.js.map