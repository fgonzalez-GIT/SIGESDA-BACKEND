import { Request, Response, NextFunction } from 'express';
import { CuotaService } from '@/services/cuota.service';
export declare class CuotaController {
    private cuotaService;
    constructor(cuotaService: CuotaService);
    createCuota(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCuotas(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCuotaById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCuotaByReciboId(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCuotasPorPeriodo(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCuotasBySocio(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateCuota(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteCuota(req: Request, res: Response, next: NextFunction): Promise<void>;
    generarCuotas(req: Request, res: Response, next: NextFunction): Promise<void>;
    generarCuotasConItems(req: Request, res: Response, next: NextFunction): Promise<void>;
    calcularMontoCuota(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchCuotas(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStatistics(req: Request, res: Response, next: NextFunction): Promise<void>;
    getVencidas(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPendientes(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteBulkCuotas(req: Request, res: Response, next: NextFunction): Promise<void>;
    recalcularCuotas(req: Request, res: Response, next: NextFunction): Promise<void>;
    getResumenMensual(req: Request, res: Response, next: NextFunction): Promise<void>;
    generarReporte(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPeriodosDisponibles(req: Request, res: Response, next: NextFunction): Promise<void>;
    validarGeneracionCuotas(req: Request, res: Response, next: NextFunction): Promise<void>;
    recalcularCuotaById(req: Request, res: Response, next: NextFunction): Promise<void>;
    regenerarCuotasDelPeriodo(req: Request, res: Response, next: NextFunction): Promise<void>;
    previewRecalculoCuotas(req: Request, res: Response, next: NextFunction): Promise<void>;
    compararCuotaConRecalculo(req: Request, res: Response, next: NextFunction): Promise<void>;
    private getNombreMes;
}
//# sourceMappingURL=cuota.controller.d.ts.map