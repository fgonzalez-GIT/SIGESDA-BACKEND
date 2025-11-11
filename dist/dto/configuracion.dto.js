"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLAVES_SISTEMA = exports.parsearValor = exports.importarConfiguracionesSchema = exports.configuracionCategoriaSchema = exports.configuracionQuerySchema = exports.updateConfiguracionSchema = exports.createConfiguracionSchema = exports.TipoConfiguracion = void 0;
const zod_1 = require("zod");
var TipoConfiguracion;
(function (TipoConfiguracion) {
    TipoConfiguracion["STRING"] = "STRING";
    TipoConfiguracion["NUMBER"] = "NUMBER";
    TipoConfiguracion["BOOLEAN"] = "BOOLEAN";
    TipoConfiguracion["JSON"] = "JSON";
})(TipoConfiguracion || (exports.TipoConfiguracion = TipoConfiguracion = {}));
const configuracionBaseSchema = zod_1.z.object({
    clave: zod_1.z.string().min(1, 'Clave es requerida').max(100)
        .regex(/^[A-Z_][A-Z0-9_]*$/, 'Clave debe estar en MAYÚSCULAS y usar guiones bajos'),
    valor: zod_1.z.string().min(1, 'Valor es requerido'),
    descripcion: zod_1.z.string().max(500).optional(),
    tipo: zod_1.z.nativeEnum(TipoConfiguracion).default(TipoConfiguracion.STRING)
});
const validarValorPorTipo = (data) => {
    switch (data.tipo) {
        case TipoConfiguracion.NUMBER:
            const num = parseFloat(data.valor);
            if (isNaN(num)) {
                throw new Error('El valor debe ser un número válido para tipo NUMBER');
            }
            break;
        case TipoConfiguracion.BOOLEAN:
            if (!['true', 'false'].includes(data.valor.toLowerCase())) {
                throw new Error('El valor debe ser "true" o "false" para tipo BOOLEAN');
            }
            break;
        case TipoConfiguracion.JSON:
            try {
                JSON.parse(data.valor);
            }
            catch {
                throw new Error('El valor debe ser un JSON válido para tipo JSON');
            }
            break;
        case TipoConfiguracion.STRING:
        default:
            break;
    }
    return true;
};
exports.createConfiguracionSchema = configuracionBaseSchema
    .refine(validarValorPorTipo, {
    message: 'Valor inválido para el tipo especificado',
    path: ['valor']
});
exports.updateConfiguracionSchema = zod_1.z.object({
    valor: zod_1.z.string().min(1, 'Valor es requerido').optional(),
    descripcion: zod_1.z.string().max(500).optional(),
    tipo: zod_1.z.nativeEnum(TipoConfiguracion).optional()
}).refine((data) => {
    if (data.valor && data.tipo) {
        return validarValorPorTipo(data);
    }
    return true;
}, {
    message: 'Valor inválido para el tipo especificado',
    path: ['valor']
});
exports.configuracionQuerySchema = zod_1.z.object({
    tipo: zod_1.z.nativeEnum(TipoConfiguracion).optional(),
    search: zod_1.z.string().optional(),
    page: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 1 : parsed;
    }, zod_1.z.number().int().positive().default(1)),
    limit: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 10 : parsed;
    }, zod_1.z.number().int().positive().max(100).default(10))
});
exports.configuracionCategoriaSchema = zod_1.z.object({
    categoria: zod_1.z.string().min(1, 'Categoría es requerida')
        .regex(/^[A-Z_][A-Z0-9_]*$/, 'Categoría debe estar en MAYÚSCULAS'),
    incluirDescripciones: zod_1.z.boolean().default(false)
});
exports.importarConfiguracionesSchema = zod_1.z.object({
    configuraciones: zod_1.z.array(zod_1.z.object({
        clave: zod_1.z.string().min(1).max(100),
        valor: zod_1.z.string().min(1),
        descripcion: zod_1.z.string().max(500).optional(),
        tipo: zod_1.z.nativeEnum(TipoConfiguracion).default(TipoConfiguracion.STRING)
    })),
    sobrescribir: zod_1.z.boolean().default(false)
});
const parsearValor = (valor, tipo) => {
    switch (tipo) {
        case TipoConfiguracion.NUMBER:
            return parseFloat(valor);
        case TipoConfiguracion.BOOLEAN:
            return (valor.toLowerCase() === 'true');
        case TipoConfiguracion.JSON:
            return JSON.parse(valor);
        case TipoConfiguracion.STRING:
        default:
            return valor;
    }
};
exports.parsearValor = parsearValor;
exports.CLAVES_SISTEMA = {
    CUOTA_SOCIO_ACTIVO: 'CUOTA_SOCIO_ACTIVO',
    CUOTA_SOCIO_ESTUDIANTE: 'CUOTA_SOCIO_ESTUDIANTE',
    CUOTA_SOCIO_FAMILIAR: 'CUOTA_SOCIO_FAMILIAR',
    CUOTA_SOCIO_JUBILADO: 'CUOTA_SOCIO_JUBILADO',
    NOMBRE_ASOCIACION: 'NOMBRE_ASOCIACION',
    EMAIL_CONTACTO: 'EMAIL_CONTACTO',
    TELEFONO_CONTACTO: 'TELEFONO_CONTACTO',
    DIRECCION_ASOCIACION: 'DIRECCION_ASOCIACION',
    DIAS_VENCIMIENTO_CUOTA: 'DIAS_VENCIMIENTO_CUOTA',
    DESCUENTO_FAMILIAR: 'DESCUENTO_FAMILIAR',
    ACTIVIDADES_GRATIS_SOCIOS: 'ACTIVIDADES_GRATIS_SOCIOS',
    BACKUP_AUTOMATICO: 'BACKUP_AUTOMATICO',
    ENVIO_RECORDATORIOS: 'ENVIO_RECORDATORIOS',
    FORMATO_RECIBO: 'FORMATO_RECIBO'
};
//# sourceMappingURL=configuracion.dto.js.map