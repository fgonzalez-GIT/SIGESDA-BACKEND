import { Request, Response, NextFunction } from 'express';
import { AjusteCuotaService } from '@/services/ajuste-cuota.service';
import { HistorialAjusteCuotaRepository } from '@/repositories/historial-ajuste-cuota.repository';
export declare class AjusteCuotaController {
    private service;
    private historialRepository;
    constructor(service: AjusteCuotaService, historialRepository: HistorialAjusteCuotaRepository);
    createAjuste(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAjusteById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAjustes(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAjustesByPersona(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateAjuste(req: Request, res: Response, next: NextFunction): Promise<void>;
    deactivateAjuste(req: Request, res: Response, next: NextFunction): Promise<void>;
    activateAjuste(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteAjuste(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    calcularAjuste(req: Request, res: Response, next: NextFunction): Promise<void>;
    getHistorial(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllHistorial(req: Request, res: Response, next: NextFunction): Promise<void>;
    getHistorialStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=ajuste-cuota.controller.d.ts.map