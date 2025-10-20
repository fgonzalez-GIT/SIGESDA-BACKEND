import { Request, Response, NextFunction } from 'express';
import { ReservaAulaService } from '@/services/reserva-aula.service';
export declare class ReservaAulaController {
    private reservaAulaService;
    constructor(reservaAulaService: ReservaAulaService);
    createReserva(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReservas(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReservaById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReservasByAula(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReservasByDocente(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReservasByActividad(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateReserva(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteReserva(req: Request, res: Response, next: NextFunction): Promise<void>;
    detectConflicts(req: Request, res: Response, next: NextFunction): Promise<void>;
    createBulkReservas(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteBulkReservas(req: Request, res: Response, next: NextFunction): Promise<void>;
    createRecurringReserva(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchReservas(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStatistics(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUpcomingReservations(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCurrentReservations(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    checkAvailability(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=reserva-aula.controller.d.ts.map