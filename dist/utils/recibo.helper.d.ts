import { Recibo, EstadoRecibo } from '@prisma/client';
export declare function validateReciboPagado(recibo: Recibo, operacion: string): void;
export declare function validateReciboEditable(recibo: Recibo): void;
export declare function canDeleteRecibo(recibo: any): {
    canDelete: boolean;
    reason?: string;
};
export declare function validateCanDeleteRecibo(recibo: any): void;
export declare function isReciboVencido(recibo: Recibo, fechaReferencia?: Date): boolean;
export declare function isReciboPendiente(recibo: Recibo): boolean;
export declare function getEstadoSugeridoRecibo(recibo: Recibo, fechaReferencia?: Date): EstadoRecibo;
//# sourceMappingURL=recibo.helper.d.ts.map