import { Request, Response, NextFunction } from 'express';
import { PreviewCuotaService } from '@/services/preview-cuota.service';
export declare class PreviewCuotaController {
    private previewService;
    constructor(previewService?: PreviewCuotaService);
    previewCuota: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    previewCuotasSocio: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    compararCuota: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    healthCheck: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=preview-cuota.controller.d.ts.map