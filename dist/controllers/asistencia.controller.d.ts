import { Request, Response, NextFunction } from 'express';
import { AsistenciaService } from '@/services/asistencia.service';
export declare class AsistenciaController {
    private asistenciaService;
    constructor(asistenciaService: AsistenciaService);
    createAsistencia(req: Request, res: Response, next: NextFunction): Promise<void>;
    registroMasivo(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAsistencias(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAsistenciaById(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getAsistenciasByParticipacion(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getAsistenciasByActividad(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getAsistenciasByPersona(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateAsistencia(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    deleteAsistencia(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getTasaAsistencia(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getAlertasInasistencias(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReporteAsistencias(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEstadisticasGenerales(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    getResumenPersona(req: Request, res: Response, next: NextFunction): Promise<void>;
    getResumenActividad(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    corregirAsistencia(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=asistencia.controller.d.ts.map