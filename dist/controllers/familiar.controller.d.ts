import { Request, Response, NextFunction } from 'express';
import { FamiliarService } from '@/services/familiar.service';
export declare class FamiliarController {
    private familiarService;
    constructor(familiarService: FamiliarService);
    createFamiliar(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFamiliares(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFamiliarById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFamiliarsBySocio(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateFamiliar(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteFamiliar(req: Request, res: Response, next: NextFunction): Promise<void>;
    createBulkFamiliares(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteBulkFamiliares(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchFamiliares(req: Request, res: Response, next: NextFunction): Promise<void>;
    getParentescoStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFamilyTree(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTiposParentesco(req: Request, res: Response, next: NextFunction): Promise<void>;
    checkRelationExists(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAvailableFamiliares(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=familiar.controller.d.ts.map