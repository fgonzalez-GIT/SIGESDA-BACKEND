import { Request, Response, NextFunction } from 'express';
import { CategoriasEquipamientoService } from '@/services/categorias-equipamiento.service';
export declare class CategoriasEquipamientoController {
    private service;
    constructor(service: CategoriasEquipamientoService);
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    findAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    findById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    reorder(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=categorias-equipamiento.controller.d.ts.map