import { Request, Response, NextFunction } from 'express';
import { CuotaService } from '@/services/cuota.service';
import { MotorReglasDescuentos } from '@/services/motor-reglas-descuentos.service';
import { AjusteCuotaService } from '@/services/ajuste-cuota.service';
import { ExencionCuotaService } from '@/services/exencion-cuota.service';
export declare class SimuladorCuotaController {
    private simuladorService;
    constructor(cuotaService: CuotaService, motorReglasDescuentos: MotorReglasDescuentos, ajusteService?: AjusteCuotaService, exencionService?: ExencionCuotaService);
    simularGeneracion: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    simularReglaDescuento: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    compararEscenarios: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    simularImpactoMasivo: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    healthCheck: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=simulador-cuota.controller.d.ts.map