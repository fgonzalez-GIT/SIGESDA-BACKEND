import { Request, Response, NextFunction } from 'express';
import { MedioPagoService } from '@/services/medio-pago.service';
export declare class MedioPagoController {
    private medioPagoService;
    constructor(medioPagoService: MedioPagoService);
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByReciboId(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    search(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStatistics(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteBulk(req: Request, res: Response, next: NextFunction): Promise<void>;
    validatePayment(req: Request, res: Response, next: NextFunction): Promise<void>;
    getConciliacionBancaria(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByTipo(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    getQuickStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    validateReciboPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEfectivo(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCheques(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTransferencias(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTarjetas(req: Request, res: Response, next: NextFunction): Promise<void>;
    getResumenPeriodo(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=medio-pago.controller.d.ts.map