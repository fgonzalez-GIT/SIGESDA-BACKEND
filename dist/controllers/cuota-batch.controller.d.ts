import { Request, Response } from 'express';
export declare class CuotaBatchController {
    generarCuotasBatch(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateCuotasBatch(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    healthCheck(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
declare const _default: CuotaBatchController;
export default _default;
//# sourceMappingURL=cuota-batch.controller.d.ts.map