import { Request, Response } from 'express';
export declare class ActividadAulaController {
    private actividadAulaService;
    constructor();
    asignarAula(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    findAll(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    findById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAulasByActividad(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getActividadesByAula(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    update(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    delete(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    desasignarAula(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    reactivarAsignacion(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    verificarDisponibilidad(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    sugerirAulas(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    asignarMultiplesAulas(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    cambiarAula(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getOcupacionAula(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=actividad-aula.controller.d.ts.map