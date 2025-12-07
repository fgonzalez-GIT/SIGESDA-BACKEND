import { Request, Response, NextFunction } from 'express';
import { EstadosEquipamientoService } from '@/services/estados-equipamiento.service';
export declare class EstadosEquipamientoController {
    private service;
    constructor(service: EstadosEquipamientoService);
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    findAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    findById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    reorder(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=estados-equipamiento.controller.d.ts.map