import { Request, Response, NextFunction } from 'express';
import { ItemCuotaService } from '@/services/item-cuota.service';
export declare class ItemCuotaController {
    private service;
    constructor(service: ItemCuotaService);
    getItemsByCuotaId(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDesgloseByCuotaId(req: Request, res: Response, next: NextFunction): Promise<void>;
    getItemsSegmentados(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    addManualItem(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateItem(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteItem(req: Request, res: Response, next: NextFunction): Promise<void>;
    regenerarItems(req: Request, res: Response, next: NextFunction): Promise<void>;
    duplicarItem(req: Request, res: Response, next: NextFunction): Promise<void>;
    aplicarDescuentoGlobal(req: Request, res: Response, next: NextFunction): Promise<void>;
    getGlobalStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    findByTipoItemCodigo(req: Request, res: Response, next: NextFunction): Promise<void>;
    findByCategoriaCodigo(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=item-cuota.controller.d.ts.map