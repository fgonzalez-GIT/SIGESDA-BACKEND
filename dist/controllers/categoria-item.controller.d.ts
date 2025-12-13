import { Request, Response, NextFunction } from 'express';
import { CategoriaItemService } from '@/services/categoria-item.service';
export declare class CategoriaItemController {
    private service;
    constructor(service: CategoriaItemService);
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByCodigo(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSummary(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUsageStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    deactivate(req: Request, res: Response, next: NextFunction): Promise<void>;
    activate(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    reorder(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=categoria-item.controller.d.ts.map