"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRIORIDAD_DESCUENTOS = exports.TIPOS_DESCUENTO = exports.CATEGORIAS_CON_DESCUENTO_LEGACY = exports.MAX_PORCENTAJE_DESCUENTO = exports.MIN_PORCENTAJE_DESCUENTO = exports.LIMITE_GLOBAL_DESCUENTOS_PORCENTAJE = exports.PORCENTAJE_DESCUENTO_POR_ANIO = exports.MAX_ANIOS_ANTIGUEDAD_DESCUENTO = exports.DESCUENTO_JUBILADO = exports.DESCUENTO_ESTUDIANTE = void 0;
exports.DESCUENTO_ESTUDIANTE = 0.40;
exports.DESCUENTO_JUBILADO = 0.25;
exports.MAX_ANIOS_ANTIGUEDAD_DESCUENTO = 15;
exports.PORCENTAJE_DESCUENTO_POR_ANIO = 1;
exports.LIMITE_GLOBAL_DESCUENTOS_PORCENTAJE = 80;
exports.MIN_PORCENTAJE_DESCUENTO = 0;
exports.MAX_PORCENTAJE_DESCUENTO = 100;
exports.CATEGORIAS_CON_DESCUENTO_LEGACY = {
    ESTUDIANTE: {
        codigo: 'ESTUDIANTE',
        porcentaje: 40,
        descripcion: 'Descuento para estudiantes'
    },
    JUBILADO: {
        codigo: 'JUBILADO',
        porcentaje: 25,
        descripcion: 'Descuento para jubilados'
    }
};
exports.TIPOS_DESCUENTO = {
    PORCENTAJE: 'PORCENTAJE',
    FIJO: 'FIJO',
    FORMULA: 'FORMULA'
};
exports.PRIORIDAD_DESCUENTOS = {
    EXENCION: 1,
    AJUSTE_MANUAL: 2,
    REGLA_AUTOMATICA: 3,
    DESCUENTO_CATEGORIA: 4
};
//# sourceMappingURL=descuentos.constants.js.map