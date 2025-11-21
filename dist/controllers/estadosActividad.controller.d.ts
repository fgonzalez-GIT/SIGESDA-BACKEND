import { Request, Response, NextFunction } from 'express';
import { EstadosActividadService } from '@/services/estadosActividad.service';
export declare class EstadosActividadController {
    private service;
    constructor(service: EstadosActividadService);
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    findAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    findById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    reorder(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=estadosActividad.controller.d.ts.map