import { Request, Response, NextFunction } from 'express';
import { EstadoReservaService } from '@/services/estado-reserva.service';
export declare class EstadoReservaController {
    private estadoReservaService;
    constructor(estadoReservaService: EstadoReservaService);
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByCodigo(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    reorder(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEstadisticas(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=estado-reserva.controller.d.ts.map