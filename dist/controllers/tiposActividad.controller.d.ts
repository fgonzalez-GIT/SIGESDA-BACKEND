import { Request, Response, NextFunction } from 'express';
import { TiposActividadService } from '@/services/tiposActividad.service';
export declare class TiposActividadController {
    private service;
    constructor(service: TiposActividadService);
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    findAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    findById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    reorder(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=tiposActividad.controller.d.ts.map