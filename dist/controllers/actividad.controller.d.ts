import { Request, Response, NextFunction } from 'express';
import { ActividadService } from '@/services/actividad.service';
export declare class ActividadController {
    private actividadService;
    constructor(actividadService: ActividadService);
    createActividad(req: Request, res: Response, next: NextFunction): Promise<void>;
    getActividades(req: Request, res: Response, next: NextFunction): Promise<void>;
    getActividadById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateActividad(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteActividad(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCoros(req: Request, res: Response, next: NextFunction): Promise<void>;
    getClasesInstrumento(req: Request, res: Response, next: NextFunction): Promise<void>;
    getClasesCanto(req: Request, res: Response, next: NextFunction): Promise<void>;
    asignarDocente(req: Request, res: Response, next: NextFunction): Promise<void>;
    desasignarDocente(req: Request, res: Response, next: NextFunction): Promise<void>;
    getParticipantes(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEstadisticas(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDocentesDisponibles(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchActividades(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=actividad.controller.d.ts.map