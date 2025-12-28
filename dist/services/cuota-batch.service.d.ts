export declare class CuotaBatchService {
    generarCuotasBatch(data: {
        mes: number;
        anio: number;
        categorias?: string[];
        aplicarDescuentos?: boolean;
        observaciones?: string;
    }): Promise<{
        generated: number;
        errors: string[];
        cuotas: any[];
        performance: {
            sociosProcesados: number;
            tiempoTotal: number;
            queriesEjecutados: number;
        };
    }>;
    private _getSociosPorGenerar;
    updateCuotasBatch(cuotaIds: number[], updates: {
        montoBase?: number;
        montoActividades?: number;
        montoTotal?: number;
    }): Promise<{
        updated: number;
    }>;
}
declare const _default: CuotaBatchService;
export default _default;
//# sourceMappingURL=cuota-batch.service.d.ts.map