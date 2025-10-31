import { Request, Response, NextFunction } from 'express';
import { CategoriasActividadService } from '@/services/categoriasActividad.service';
export declare class CategoriasActividadController {
    private service;
    constructor(service: CategoriasActividadService);
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    findAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    findById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    reorder(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=categoriasActividad.controller.d.ts.map