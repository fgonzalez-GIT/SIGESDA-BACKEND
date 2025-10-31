import { Request, Response, NextFunction } from 'express';
import { ReciboService } from '@/services/recibo.service';
export declare class ReciboController {
    private reciboService;
    constructor(reciboService: ReciboService);
    createRecibo(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRecibos(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReciboById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReciboByNumero(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRecibosByPersona(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateRecibo(req: Request, res: Response, next: NextFunction): Promise<void>;
    changeEstado(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteRecibo(req: Request, res: Response, next: NextFunction): Promise<void>;
    createBulkRecibos(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteBulkRecibos(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateBulkEstados(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchRecibos(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStatistics(req: Request, res: Response, next: NextFunction): Promise<void>;
    getVencidos(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPendientes(req: Request, res: Response, next: NextFunction): Promise<void>;
    processVencidos(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRecibosPorTipo(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRecibosPorEstado(req: Request, res: Response, next: NextFunction): Promise<void>;
    getValidStateTransitions(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFinancialSummary(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=recibo.controller.d.ts.map