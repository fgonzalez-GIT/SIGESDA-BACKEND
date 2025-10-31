import { Request, Response, NextFunction } from 'express';
import { CatalogoService } from '@/services/catalogo.service';
export declare class CatalogoAdminController {
    private catalogoService;
    constructor(catalogoService: CatalogoService);
    createTipoPersona(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllTiposPersonaWithStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTipoPersonaById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateTipoPersona(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteTipoPersona(req: Request, res: Response, next: NextFunction): Promise<void>;
    toggleActivoTipoPersona(req: Request, res: Response, next: NextFunction): Promise<void>;
    createEspecialidad(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllEspecialidadesWithStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEspecialidadById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateEspecialidad(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteEspecialidad(req: Request, res: Response, next: NextFunction): Promise<void>;
    toggleActivoEspecialidad(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=catalogo-admin.controller.d.ts.map