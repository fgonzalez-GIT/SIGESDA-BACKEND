import { Equipamiento, AulaEquipamiento } from '@prisma/client';
export declare const ESTADOS_BLOQUEADOS: string[];
export declare function estadoPermiteAsignacion(estadoCodigo: string): boolean;
export declare function calcularCantidadDisponible(equipamiento: Equipamiento, asignaciones: AulaEquipamiento[]): number;
export declare function calcularDisponibilidad(equipamiento: Equipamiento & {
    estadoEquipamiento?: {
        codigo: string;
        nombre: string;
    } | null;
}, asignaciones: AulaEquipamiento[]): {
    cantidadTotal: number;
    cantidadAsignada: number;
    cantidadDisponible: number;
    estadoCodigo: string | null;
    estadoNombre: string | null;
    estadoPermiteAsignacion: boolean;
    tieneDeficit: boolean;
    warnings: string[];
};
export declare function validarAsignacion(equipamiento: Equipamiento & {
    estadoEquipamiento?: {
        codigo: string;
        nombre: string;
    } | null;
}, cantidadSolicitada: number, asignaciones: AulaEquipamiento[]): {
    esValido: boolean;
    errors: string[];
    warnings: string[];
};
export declare function getNombreEstado(estadoCodigo: string): string;
export declare function estaEstadoBloqueado(estadoCodigo: string): boolean;
//# sourceMappingURL=equipamiento.helper.d.ts.map