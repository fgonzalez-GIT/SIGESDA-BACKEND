import { Request, Response, NextFunction } from 'express';
import { RolesDocentesService } from '@/services/rolesDocentes.service';
export declare class RolesDocentesController {
    private service;
    constructor(service: RolesDocentesService);
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    findAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    findById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    reorder(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=rolesDocentes.controller.d.ts.map