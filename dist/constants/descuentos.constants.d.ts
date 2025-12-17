export declare const DESCUENTO_ESTUDIANTE = 0.4;
export declare const DESCUENTO_JUBILADO = 0.25;
export declare const MAX_ANIOS_ANTIGUEDAD_DESCUENTO = 15;
export declare const PORCENTAJE_DESCUENTO_POR_ANIO = 1;
export declare const LIMITE_GLOBAL_DESCUENTOS_PORCENTAJE = 80;
export declare const MIN_PORCENTAJE_DESCUENTO = 0;
export declare const MAX_PORCENTAJE_DESCUENTO = 100;
export declare const CATEGORIAS_CON_DESCUENTO_LEGACY: {
    readonly ESTUDIANTE: {
        readonly codigo: "ESTUDIANTE";
        readonly porcentaje: 40;
        readonly descripcion: "Descuento para estudiantes";
    };
    readonly JUBILADO: {
        readonly codigo: "JUBILADO";
        readonly porcentaje: 25;
        readonly descripcion: "Descuento para jubilados";
    };
};
export declare const TIPOS_DESCUENTO: {
    readonly PORCENTAJE: "PORCENTAJE";
    readonly FIJO: "FIJO";
    readonly FORMULA: "FORMULA";
};
export declare const PRIORIDAD_DESCUENTOS: {
    readonly EXENCION: 1;
    readonly AJUSTE_MANUAL: 2;
    readonly REGLA_AUTOMATICA: 3;
    readonly DESCUENTO_CATEGORIA: 4;
};
//# sourceMappingURL=descuentos.constants.d.ts.map