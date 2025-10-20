import { Request, Response } from 'express';
import { CategoriaSocioService } from '@/services/categoria-socio.service';
export declare class CategoriaSocioController {
    private service;
    constructor(service: CategoriaSocioService);
    getCategorias(req: Request, res: Response): Promise<void>;
    getCategoriaById(req: Request, res: Response): Promise<void>;
    getCategoriaByCodigo(req: Request, res: Response): Promise<void>;
    createCategoria(req: Request, res: Response): Promise<void>;
    updateCategoria(req: Request, res: Response): Promise<void>;
    deleteCategoria(req: Request, res: Response): Promise<void>;
    getStats(req: Request, res: Response): Promise<void>;
    toggleActive(req: Request, res: Response): Promise<void>;
    reorder(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=categoria-socio.controller.d.ts.map