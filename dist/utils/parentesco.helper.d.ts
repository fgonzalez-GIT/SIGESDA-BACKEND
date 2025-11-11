import { TipoParentesco } from '@prisma/client';
export declare const PARENTESCO_COMPLEMENTARIO: Record<TipoParentesco, TipoParentesco>;
export declare enum GradoParentesco {
    PRIMER_GRADO = "PRIMER_GRADO",
    SEGUNDO_GRADO = "SEGUNDO_GRADO",
    OTRO = "OTRO"
}
export declare const PARENTESCOS_PRIMER_GRADO: TipoParentesco[];
export declare const PARENTESCOS_SEGUNDO_GRADO: TipoParentesco[];
export declare function getGradoParentesco(parentesco: TipoParentesco): GradoParentesco;
export declare const PARENTESCOS_SIMETRICOS: TipoParentesco[];
export declare const PARENTESCOS_ASIMETRICOS: TipoParentesco[];
export declare function getParentescoComplementario(parentesco: TipoParentesco): TipoParentesco;
export declare function isParentescoSimetrico(parentesco: TipoParentesco): boolean;
export declare function areParentescosComplementarios(parentesco1: TipoParentesco, parentesco2: TipoParentesco): boolean;
export declare function getRelacionBidireccionalDescripcion(nombreA: string, parentescoAB: TipoParentesco, nombreB: string): string;
export declare function validateRelacionBidireccional(relacion1: {
    parentesco: TipoParentesco;
    desdeId: number;
    haciaId: number;
}, relacion2: {
    parentesco: TipoParentesco;
    desdeId: number;
    haciaId: number;
}): {
    valid: boolean;
    error?: string;
};
export declare function getInfoParentesco(parentesco: TipoParentesco): {
    grado: GradoParentesco;
    complementario: TipoParentesco;
    simetrico: boolean;
};
//# sourceMappingURL=parentesco.helper.d.ts.map