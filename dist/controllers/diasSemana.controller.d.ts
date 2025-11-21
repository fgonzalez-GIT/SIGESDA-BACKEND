import { Request, Response, NextFunction } from 'express';
import { DiasSemanaService } from '@/services/diasSemana.service';
export declare class DiasSemanaController {
    private service;
    constructor(service: DiasSemanaService);
    findAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    findById(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=diasSemana.controller.d.ts.map