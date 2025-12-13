import { Request, Response, NextFunction } from 'express';
import { TipoItemCuotaService } from '@/services/tipo-item-cuota.service';
export declare class TipoItemCuotaController {
    private service;
    constructor(service: TipoItemCuotaService);
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByCodigo(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByCategoriaCodigo(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCalculados(req: Request, res: Response, next: NextFunction): Promise<void>;
    getManuales(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSummaryByCategoria(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUsageStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateFormula(req: Request, res: Response, next: NextFunction): Promise<void>;
    deactivate(req: Request, res: Response, next: NextFunction): Promise<void>;
    activate(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    clone(req: Request, res: Response, next: NextFunction): Promise<void>;
    reorder(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=tipo-item-cuota.controller.d.ts.map