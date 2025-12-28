import { PrismaClient } from '@prisma/client';
import { PreviewCuotaDto, PreviewCuotasSocioDto, CompararCuotaDto } from '@/dto/cuota.dto';
export declare class PreviewCuotaService {
    private prisma;
    constructor(prismaClient?: PrismaClient);
    previewCuota(data: PreviewCuotaDto): Promise<{
        cuota: any;
        desglose?: {
            items: any[];
            calculoDetallado: any;
        };
        explicaciones?: {
            items: string[];
            resumen: string;
        };
        historial?: any[];
    }>;
    previewCuotasSocio(data: PreviewCuotasSocioDto): Promise<{
        socio: any;
        cuotas: any[];
        resumen: {
            totalCuotas: number;
            montoTotal: number;
            desglosePorMes: any[];
        };
    }>;
    compararCuota(data: CompararCuotaDto): Promise<{
        antes: any;
        despues: any;
        diferencias: {
            montoTotal: number;
            itemsModificados: number;
        };
        explicacion: string;
    }>;
    private estaEnRangoFecha;
    private calcularDesglosePorMes;
    private generarDesglose;
    private generarExplicaciones;
    private formatearCuota;
    private calcularCuotaConCambios;
    private generarExplicacionComparacion;
    private getNombreMes;
}
//# sourceMappingURL=preview-cuota.service.d.ts.map