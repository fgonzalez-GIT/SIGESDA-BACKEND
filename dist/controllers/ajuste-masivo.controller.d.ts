import { Request, Response, NextFunction } from 'express';
import { AjusteMasivoService } from '@/services/ajuste-masivo.service';
export declare class AjusteMasivoController {
    private ajusteMasivoService;
    constructor(ajusteMasivoService?: AjusteMasivoService);
    aplicarAjusteMasivo: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    modificarItemsMasivo: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    aplicarDescuentoGlobal: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    healthCheck: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=ajuste-masivo.controller.d.ts.map