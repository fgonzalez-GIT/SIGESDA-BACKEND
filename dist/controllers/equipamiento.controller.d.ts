import { Request, Response, NextFunction } from 'express';
import { EquipamientoService } from '@/services/equipamiento.service';
export declare class EquipamientoController {
    private equipamientoService;
    constructor(equipamientoService: EquipamientoService);
    createEquipamiento(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEquipamientos(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEquipamientoById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateEquipamiento(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteEquipamiento(req: Request, res: Response, next: NextFunction): Promise<void>;
    reactivateEquipamiento(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEquipamientoStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDisponibilidad(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=equipamiento.controller.d.ts.map