import { Request, Response, NextFunction } from 'express';
import { PersonaService } from '@/services/persona.service.new';
export declare class PersonaController {
    private personaService;
    constructor(personaService: PersonaService);
    createPersona(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPersonas(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPersonaById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updatePersona(req: Request, res: Response, next: NextFunction): Promise<void>;
    deletePersona(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSocios(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDocentes(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProveedores(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchPersonas(req: Request, res: Response, next: NextFunction): Promise<void>;
    checkDni(req: Request, res: Response, next: NextFunction): Promise<void>;
    reactivatePersona(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEstadoPersona(req: Request, res: Response, next: NextFunction): Promise<void>;
    checkTipoActivo(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=persona.controller.new.d.ts.map