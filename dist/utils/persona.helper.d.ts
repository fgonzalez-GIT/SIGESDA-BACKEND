export declare const TIPOS_MUTUAMENTE_EXCLUYENTES: Record<string, string[]>;
export declare function validateTiposMutuamenteExcluyentes(tiposCodigos: string[]): {
    valid: boolean;
    error?: string;
};
export declare function canAgregarTipo(tiposExistentes: string[], nuevoTipo: string): {
    valid: boolean;
    error?: string;
    tiposAReemplazar?: string[];
    requiresAutoReplace?: boolean;
};
export declare function getTiposExcluyentes(tipoCodigo: string): string[];
export declare function sonTiposExcluyentes(tipo1: string, tipo2: string): boolean;
//# sourceMappingURL=persona.helper.d.ts.map