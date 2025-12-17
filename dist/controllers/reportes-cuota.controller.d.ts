import { Request, Response, NextFunction } from 'express';
import { ReportesCuotaService } from '@/services/reportes-cuota.service';
export declare class ReportesCuotaController {
    private reportesService;
    constructor(reportesService: ReportesCuotaService);
    getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReportePorCategoria(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAnalisisDescuentos(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReporteExenciones(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReporteComparativo(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEstadisticasRecaudacion(req: Request, res: Response, next: NextFunction): Promise<void>;
    exportarReporte(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=reportes-cuota.controller.d.ts.map