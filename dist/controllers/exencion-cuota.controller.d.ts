import { Request, Response, NextFunction } from 'express';
import { ExencionCuotaService } from '@/services/exencion-cuota.service';
export declare class ExencionCuotaController {
    private service;
    constructor(service: ExencionCuotaService);
    createExencion(req: Request, res: Response, next: NextFunction): Promise<void>;
    getExencionById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getExenciones(req: Request, res: Response, next: NextFunction): Promise<void>;
    getExencionesByPersona(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPendientes(req: Request, res: Response, next: NextFunction): Promise<void>;
    getVigentes(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateExencion(req: Request, res: Response, next: NextFunction): Promise<void>;
    aprobarExencion(req: Request, res: Response, next: NextFunction): Promise<void>;
    rechazarExencion(req: Request, res: Response, next: NextFunction): Promise<void>;
    revocarExencion(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteExencion(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    checkExencionParaPeriodo(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=exencion-cuota.controller.d.ts.map