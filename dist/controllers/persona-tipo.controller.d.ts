import { Request, Response, NextFunction } from 'express';
import { PersonaTipoService } from '@/services/persona-tipo.service';
export declare class PersonaTipoController {
    private personaTipoService;
    constructor(personaTipoService: PersonaTipoService);
    asignarTipo(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTiposByPersona(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateTipo(req: Request, res: Response, next: NextFunction): Promise<void>;
    desasignarTipo(req: Request, res: Response, next: NextFunction): Promise<void>;
    eliminarTipo(req: Request, res: Response, next: NextFunction): Promise<void>;
    agregarContacto(req: Request, res: Response, next: NextFunction): Promise<void>;
    getContactosByPersona(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateContacto(req: Request, res: Response, next: NextFunction): Promise<void>;
    eliminarContacto(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTiposPersona(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTipoPersonaByCodigo(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEspecialidadesDocentes(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEspecialidadByCodigo(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRazonesSociales(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRazonSocialByCodigo(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=persona-tipo.controller.d.ts.map