import { Request, Response, NextFunction } from 'express';
import { TipoContactoService } from '@/services/tipo-contacto.service';
export declare class TipoContactoController {
    private tipoContactoService;
    constructor(tipoContactoService: TipoContactoService);
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    findAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    findById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    deactivate(req: Request, res: Response, next: NextFunction): Promise<void>;
    activate(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEstadisticasUso(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=tipo-contacto.controller.d.ts.map