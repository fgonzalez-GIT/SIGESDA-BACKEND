"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPersonaLegacySchema = exports.personaQuerySchema = exports.updatePersonaSchema = exports.createPersonaSchema = void 0;
exports.validatePersonaTipoData = validatePersonaTipoData;
exports.transformLegacyToNew = transformLegacyToNew;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const persona_tipo_dto_1 = require("./persona-tipo.dto");
const personaBaseSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1, 'Nombre es requerido').max(100),
    apellido: zod_1.z.string().min(1, 'Apellido es requerido').max(100),
    dni: zod_1.z.string().min(7, 'DNI debe tener al menos 7 caracteres').max(8, 'DNI debe tener máximo 8 caracteres'),
    email: zod_1.z.string().email('Email inválido').max(150).optional(),
    telefono: zod_1.z.string().max(20).optional(),
    direccion: zod_1.z.string().max(200).optional(),
    fechaNacimiento: zod_1.z.string().datetime().optional(),
    observaciones: zod_1.z.string().max(500).optional()
});
exports.createPersonaSchema = zod_1.z.object({
    ...personaBaseSchema.shape,
    tipos: zod_1.z.array(persona_tipo_dto_1.createPersonaTipoSchema).optional().default([]),
    contactos: zod_1.z.array(persona_tipo_dto_1.createContactoPersonaSchema).optional().default([])
});
exports.updatePersonaSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1).max(100).optional(),
    apellido: zod_1.z.string().min(1).max(100).optional(),
    dni: zod_1.z.string().min(7).max(8).optional(),
    email: zod_1.z.string().email().max(150).optional().nullable(),
    telefono: zod_1.z.string().max(20).optional().nullable(),
    direccion: zod_1.z.string().max(200).optional().nullable(),
    fechaNacimiento: zod_1.z.string().datetime().optional().nullable(),
    observaciones: zod_1.z.string().max(500).optional().nullable()
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
        const parsed = parseInt(val);
        return isNaN(parsed) ? 1 : parsed;
    }, zod_1.z.number().int().positive().default(1)),
    limit: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 10 : parsed;
    }, zod_1.z.number().int().positive().max(100).default(10)),
    includeTipos: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().default(false)),
    includeContactos: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().default(false))
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
        fechaIngreso: zod_1.z.string().datetime().optional(),
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
        honorariosPorHora: zod_1.z.number().positive().optional()
    }),
    zod_1.z.object({
        ...personaBaseSchema.shape,
        tipo: zod_1.z.literal('PROVEEDOR'),
        cuit: zod_1.z.string().min(11, 'CUIT debe tener 11 caracteres').max(11),
        razonSocial: zod_1.z.string().min(1, 'Razón social es requerida').max(100)
    })
]));
function validatePersonaTipoData(tipoPersonaCodigo, data) {
    const errors = [];
    switch (tipoPersonaCodigo) {
        case 'SOCIO':
            if (!data.categoriaId) {
                errors.push('SOCIO requiere categoriaId');
            }
            break;
        case 'DOCENTE':
            if (!data.especialidadId) {
                errors.push('DOCENTE requiere especialidadId');
            }
            break;
        case 'PROVEEDOR':
            if (!data.cuit) {
                errors.push('PROVEEDOR requiere cuit');
            }
            if (!data.razonSocial) {
                errors.push('PROVEEDOR requiere razonSocial');
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
            tipoData.categoriaId = legacyData.categoriaId;
            tipoData.numeroSocio = legacyData.numeroSocio;
            tipoData.fechaIngreso = legacyData.fechaIngreso;
            break;
        case 'DOCENTE':
            tipoData.especialidadId = 1;
            tipoData.honorariosPorHora = legacyData.honorariosPorHora;
            break;
        case 'PROVEEDOR':
            tipoData.cuit = legacyData.cuit;
            tipoData.razonSocial = legacyData.razonSocial;
            break;
    }
    newData.tipos = [tipoData];
    if (baseData.email) {
        newData.contactos.push({
            tipoContacto: client_1.TipoContacto.EMAIL,
            valor: baseData.email,
            principal: true
        });
    }
    if (baseData.telefono) {
        newData.contactos.push({
            tipoContacto: client_1.TipoContacto.TELEFONO,
            valor: baseData.telefono,
            principal: true
        });
    }
    return newData;
}
//# sourceMappingURL=persona.dto.new.js.map