import { Request, Response } from 'express';
import { ConfiguracionService } from '@/services/configuracion.service';
export declare class ConfiguracionController {
    private configuracionService;
    constructor(configuracionService: ConfiguracionService);
    createConfiguracion(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getConfiguraciones(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getConfiguracionById(req: Request, res: Response): Promise<void>;
    getConfiguracionByClave(req: Request, res: Response): Promise<void>;
    getConfiguracionesByTipo(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getConfiguracionesByCategoria(req: Request, res: Response): Promise<void>;
    updateConfiguracion(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateConfiguracionByClave(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteConfiguracion(req: Request, res: Response): Promise<void>;
    deleteConfiguracionByClave(req: Request, res: Response): Promise<void>;
    upsertConfiguracion(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    bulkUpsert(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    exportarTodas(req: Request, res: Response): Promise<void>;
    getConfiguracionesPorPrefijo(req: Request, res: Response): Promise<void>;
    contarPorTipo(req: Request, res: Response): Promise<void>;
    buscarPorValor(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getConfiguracionesModificadasRecientemente(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    validarIntegridad(req: Request, res: Response): Promise<void>;
    getValorTipado(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    setValorTipado(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    inicializarSistema(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=configuracion.controller.d.ts.map