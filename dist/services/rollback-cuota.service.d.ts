import { RollbackGeneracionDto, RollbackCuotaDto } from '@/dto/cuota.dto';
export declare class RollbackCuotaService {
    private get prisma();
    rollbackGeneracion(data: RollbackGeneracionDto): Promise<{
        modo: 'PREVIEW' | 'APLICAR';
        cuotasAfectadas: number;
        cuotasEliminables: number;
        cuotasBloqueadas: number;
        recibosAfectados: number;
        itemsAfectados: number;
        montoTotalAfectado: number;
        advertencias: string[];
        errores: string[];
        backupPath?: string;
        detalleCuotas: any[];
    }>;
    rollbackCuota(data: RollbackCuotaDto): Promise<{
        modo: 'PREVIEW' | 'APLICAR';
        cuotaEliminada: boolean;
        reciboEliminado: boolean;
        itemsEliminados: number;
        advertencias: string[];
        errores: string[];
        detalle: any;
    }>;
    private obtenerCuotasPeriodo;
    private clasificarCuotas;
    private generarAdvertencias;
    private calcularEstadisticas;
    private crearBackup;
    private ejecutarRollback;
    private generarDetalleCuotas;
}
//# sourceMappingURL=rollback-cuota.service.d.ts.map