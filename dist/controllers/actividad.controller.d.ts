import { Request, Response, NextFunction } from 'express';
import { ActividadService } from '@/services/actividad.service';
export declare class ActividadController {
    private actividadService;
    constructor(actividadService: ActividadService);
    createActividad(req: Request, res: Response, next: NextFunction): Promise<void>;
    getActividades(req: Request, res: Response, next: NextFunction): Promise<void>;
    getActividadById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getActividadByCodigo(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateActividad(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteActividad(req: Request, res: Response, next: NextFunction): Promise<void>;
    cambiarEstado(req: Request, res: Response, next: NextFunction): Promise<void>;
    agregarHorario(req: Request, res: Response, next: NextFunction): Promise<void>;
    getHorariosByActividad(req: Request, res: Response, next: NextFunction): Promise<void>;
    actualizarHorario(req: Request, res: Response, next: NextFunction): Promise<void>;
    eliminarHorario(req: Request, res: Response, next: NextFunction): Promise<void>;
    asignarDocente(req: Request, res: Response, next: NextFunction): Promise<void>;
    desasignarDocente(req: Request, res: Response, next: NextFunction): Promise<void>;
    desasignarDocenteById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDocentesByActividad(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDocentesDisponibles(req: Request, res: Response, next: NextFunction): Promise<void>;
    getParticipantes(req: Request, res: Response, next: NextFunction): Promise<void>;
    addParticipante(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteParticipante(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEstadisticas(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCatalogos(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTiposActividades(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCategoriasActividades(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEstadosActividades(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDiasSemana(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRolesDocentes(req: Request, res: Response, next: NextFunction): Promise<void>;
    duplicarActividad(req: Request, res: Response, next: NextFunction): Promise<void>;
    getResumenPorTipo(req: Request, res: Response, next: NextFunction): Promise<void>;
    getHorarioSemanal(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=actividad.controller.d.ts.map