import { Request, Response, NextFunction } from 'express';
import { AulaService } from '@/services/aula.service';
export declare class AulaController {
    private aulaService;
    constructor(aulaService: AulaService);
    createAula(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAulas(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAulaById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateAula(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteAula(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAulasDisponibles(req: Request, res: Response, next: NextFunction): Promise<void>;
    verificarDisponibilidad(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEstadisticas(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAulasConMenorUso(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchAulas(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAulasPorCapacidad(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAulasConEquipamiento(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReservasDelAula(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=aula.controller.d.ts.map