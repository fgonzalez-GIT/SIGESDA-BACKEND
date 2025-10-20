import { Request, Response } from 'express';
import { ParticipacionService } from '@/services/participacion.service';
export declare class ParticipacionController {
    private participacionService;
    constructor(participacionService: ParticipacionService);
    createParticipacion(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getParticipaciones(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getParticipacionById(req: Request, res: Response): Promise<void>;
    getParticipacionesByPersona(req: Request, res: Response): Promise<void>;
    getParticipacionesByActividad(req: Request, res: Response): Promise<void>;
    updateParticipacion(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteParticipacion(req: Request, res: Response): Promise<void>;
    inscripcionMasiva(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    desinscribir(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    reactivarParticipacion(req: Request, res: Response): Promise<void>;
    transferirParticipacion(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    verificarCupos(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getParticipacionesActivas(req: Request, res: Response): Promise<void>;
    getParticipacionesPorVencer(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getEstadisticas(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getReporteInasistencias(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getDashboard(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=participacion.controller.d.ts.map