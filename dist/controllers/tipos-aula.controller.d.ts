import { Request, Response, NextFunction } from 'express';
import { TiposAulaService } from '@/services/tipos-aula.service';
export declare class TiposAulaController {
    private service;
    constructor(service: TiposAulaService);
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    findAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    findById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    reorder(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=tipos-aula.controller.d.ts.map