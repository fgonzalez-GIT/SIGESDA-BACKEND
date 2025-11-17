"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservaSchemas = exports.aulaSchemas = exports.medioPagoSchemas = exports.reciboSchemas = exports.participacionSchemas = exports.actividadSchemas = exports.personaSchemas = exports.commonValidations = void 0;
const zod_1 = require("zod");
const enums_1 = require("@/types/enums");
exports.commonValidations = {
    email: zod_1.z.string().email('Invalid email format').optional(),
    phone: zod_1.z.string().regex(/^\d{3}-\d{7}$/, 'Phone format: 351-1234567').optional(),
    dni: zod_1.z.string().regex(/^\d{8}$/, 'DNI must be 8 digits'),
    cuit: zod_1.z.string().regex(/^\d{2}-\d{8}-\d{1}$/, 'CUIT format: 20-12345678-9').optional(),
    decimal: zod_1.z.number().or(zod_1.z.string().transform(Number)).refine(val => val >= 0, 'Must be positive'),
    positiveInt: zod_1.z.number().int().positive('Must be a positive integer'),
    dateString: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Fecha debe tener formato YYYY-MM-DD o ISO 8601')
};
exports.personaSchemas = {
    create: zod_1.z.object({
        tipo: zod_1.z.nativeEnum(enums_1.TipoPersona),
        nombre: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
        apellido: zod_1.z.string().min(2, 'Last name must be at least 2 characters'),
        dni: exports.commonValidations.dni,
        email: exports.commonValidations.email,
        telefono: exports.commonValidations.phone,
        direccion: zod_1.z.string().optional(),
        fechaNacimiento: exports.commonValidations.dateString.optional(),
        categoria: zod_1.z.nativeEnum(enums_1.CategoriaSocio).optional(),
        fechaIngreso: exports.commonValidations.dateString.optional(),
        especialidad: zod_1.z.string().optional(),
        honorariosPorHora: exports.commonValidations.decimal.optional(),
        cuit: exports.commonValidations.cuit,
        razonSocial: zod_1.z.string().optional(),
    }).refine(data => {
        switch (data.tipo) {
            case enums_1.TipoPersona.SOCIO:
                return data.categoria && data.fechaIngreso;
            case enums_1.TipoPersona.DOCENTE:
                return data.especialidad;
            case enums_1.TipoPersona.PROVEEDOR:
                return data.cuit && data.razonSocial;
            default:
                return true;
        }
    }, {
        message: 'Missing required fields for the selected person type'
    }),
    update: zod_1.z.object({
        nombre: zod_1.z.string().min(2).optional(),
        apellido: zod_1.z.string().min(2).optional(),
        email: exports.commonValidations.email,
        telefono: exports.commonValidations.phone,
        direccion: zod_1.z.string().optional(),
        fechaNacimiento: exports.commonValidations.dateString.optional(),
        categoria: zod_1.z.nativeEnum(enums_1.CategoriaSocio).optional(),
        fechaBaja: exports.commonValidations.dateString.optional(),
        motivoBaja: zod_1.z.string().optional(),
        especialidad: zod_1.z.string().optional(),
        honorariosPorHora: exports.commonValidations.decimal.optional(),
        razonSocial: zod_1.z.string().optional(),
    }),
    filter: zod_1.z.object({
        tipo: zod_1.z.nativeEnum(enums_1.TipoPersona).optional(),
        categoria: zod_1.z.nativeEnum(enums_1.CategoriaSocio).optional(),
        activo: zod_1.z.boolean().optional(),
        search: zod_1.z.string().optional()
    })
};
exports.actividadSchemas = {
    create: zod_1.z.object({
        nombre: zod_1.z.string().min(3, 'Name must be at least 3 characters'),
        tipo: zod_1.z.nativeEnum(enums_1.TipoActividad),
        descripcion: zod_1.z.string().optional(),
        precio: exports.commonValidations.decimal.default(0),
        duracion: exports.commonValidations.positiveInt.optional(),
        capacidadMaxima: exports.commonValidations.positiveInt.optional(),
        docenteIds: zod_1.z.array(zod_1.z.string().cuid()).optional()
    }),
    update: zod_1.z.object({
        nombre: zod_1.z.string().min(3).optional(),
        descripcion: zod_1.z.string().optional(),
        precio: exports.commonValidations.decimal.optional(),
        duracion: exports.commonValidations.positiveInt.optional(),
        capacidadMaxima: exports.commonValidations.positiveInt.optional(),
        activa: zod_1.z.boolean().optional(),
        docenteIds: zod_1.z.array(zod_1.z.string().cuid()).optional()
    }),
    filter: zod_1.z.object({
        tipo: zod_1.z.nativeEnum(enums_1.TipoActividad).optional(),
        activa: zod_1.z.boolean().optional(),
        conDocente: zod_1.z.boolean().optional(),
        search: zod_1.z.string().optional()
    })
};
exports.participacionSchemas = {
    create: zod_1.z.object({
        personaId: zod_1.z.string().cuid(),
        actividadId: zod_1.z.string().cuid(),
        fechaInicio: exports.commonValidations.dateString,
        fechaFin: exports.commonValidations.dateString.optional(),
        precioEspecial: exports.commonValidations.decimal.optional(),
        observaciones: zod_1.z.string().optional()
    }).refine(data => {
        if (data.fechaFin) {
            return new Date(data.fechaInicio) < new Date(data.fechaFin);
        }
        return true;
    }, {
        message: 'fechaInicio must be before fechaFin'
    }),
    update: zod_1.z.object({
        fechaFin: exports.commonValidations.dateString.optional(),
        precioEspecial: exports.commonValidations.decimal.optional(),
        activa: zod_1.z.boolean().optional(),
        observaciones: zod_1.z.string().optional()
    })
};
exports.reciboSchemas = {
    create: zod_1.z.object({
        tipo: zod_1.z.nativeEnum(enums_1.TipoRecibo),
        importe: exports.commonValidations.decimal,
        fechaVencimiento: exports.commonValidations.dateString.optional(),
        concepto: zod_1.z.string().min(5, 'Concept must be descriptive'),
        observaciones: zod_1.z.string().optional(),
        emisorId: zod_1.z.string().cuid().optional(),
        receptorId: zod_1.z.string().cuid().optional()
    }),
    update: zod_1.z.object({
        fechaVencimiento: exports.commonValidations.dateString.optional(),
        concepto: zod_1.z.string().min(5).optional(),
        observaciones: zod_1.z.string().optional()
    }),
    filter: zod_1.z.object({
        tipo: zod_1.z.nativeEnum(enums_1.TipoRecibo).optional(),
        fechaDesde: exports.commonValidations.dateString.optional(),
        fechaHasta: exports.commonValidations.dateString.optional(),
        personaId: zod_1.z.string().cuid().optional(),
        search: zod_1.z.string().optional()
    })
};
exports.medioPagoSchemas = {
    create: zod_1.z.object({
        reciboId: zod_1.z.string().cuid(),
        tipo: zod_1.z.nativeEnum(enums_1.MedioPagoTipo),
        importe: exports.commonValidations.decimal,
        numero: zod_1.z.string().optional(),
        banco: zod_1.z.string().optional(),
        observaciones: zod_1.z.string().optional()
    })
};
exports.aulaSchemas = {
    create: zod_1.z.object({
        nombre: zod_1.z.string().min(3, 'Name must be at least 3 characters'),
        capacidad: exports.commonValidations.positiveInt,
        ubicacion: zod_1.z.string().optional(),
        equipamiento: zod_1.z.string().optional()
    }),
    update: zod_1.z.object({
        nombre: zod_1.z.string().min(3).optional(),
        capacidad: exports.commonValidations.positiveInt.optional(),
        ubicacion: zod_1.z.string().optional(),
        equipamiento: zod_1.z.string().optional(),
        activa: zod_1.z.boolean().optional()
    })
};
exports.reservaSchemas = {
    create: zod_1.z.object({
        aulaId: zod_1.z.string().cuid(),
        actividadId: zod_1.z.string().cuid().optional(),
        docenteId: zod_1.z.string().cuid(),
        fechaInicio: exports.commonValidations.dateString,
        fechaFin: exports.commonValidations.dateString,
        observaciones: zod_1.z.string().optional()
    }).refine(data => {
        return new Date(data.fechaInicio) < new Date(data.fechaFin);
    }, {
        message: 'fechaInicio must be before fechaFin'
    }).refine(data => {
        return new Date(data.fechaInicio) > new Date();
    }, {
        message: 'Cannot create reservations in the past'
    })
};
//# sourceMappingURL=validators.js.map