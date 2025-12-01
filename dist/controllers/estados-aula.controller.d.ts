import { Request, Response, NextFunction } from 'express';
import { EstadosAulaService } from '@/services/estados-aula.service';
export declare class EstadosAulaController {
    private service;
    constructor(service: EstadosAulaService);
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    findAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    findById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    reorder(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=estados-aula.controller.d.ts.map