import { Request, Response, NextFunction } from 'express';
import { ContactoService } from '@/services/contacto.service';
export declare class ContactoPersonaController {
    private contactoService;
    constructor(contactoService: ContactoService);
    agregarContacto(req: Request, res: Response, next: NextFunction): Promise<void>;
    getContactosByPersona(req: Request, res: Response, next: NextFunction): Promise<void>;
    getContactoById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateContacto(req: Request, res: Response, next: NextFunction): Promise<void>;
    eliminarContacto(req: Request, res: Response, next: NextFunction): Promise<void>;
    eliminarContactoPermanente(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=contacto-persona.controller.d.ts.map