import { Request, Response, NextFunction } from 'express';
import { RollbackCuotaService } from '@/services/rollback-cuota.service';
export declare class RollbackCuotaController {
    private rollbackService;
    constructor(rollbackService?: RollbackCuotaService);
    rollbackGeneracion: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    rollbackCuota: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    validarRollback: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    healthCheck: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=rollback-cuota.controller.d.ts.map