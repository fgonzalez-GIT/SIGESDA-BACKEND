import { AjusteMasivoDto, ModificarItemsMasivoDto, DescuentoGlobalDto } from '@/dto/cuota.dto';
import { CuotaRepository } from '@/repositories/cuota.repository';
import { ItemCuotaRepository } from '@/repositories/item-cuota.repository';
import { HistorialAjusteCuotaRepository } from '@/repositories/historial-ajuste-cuota.repository';
export declare class AjusteMasivoService {
    private cuotaRepository;
    private itemCuotaRepository;
    private historialRepository;
    constructor(cuotaRepository?: CuotaRepository, itemCuotaRepository?: ItemCuotaRepository, historialRepository?: HistorialAjusteCuotaRepository);
    private get prisma();
    aplicarAjusteMasivo(data: AjusteMasivoDto): Promise<{
        modo: 'PREVIEW' | 'APLICAR';
        cuotasAfectadas: number;
        itemsModificados: number;
        montoTotalOriginal: number;
        montoTotalNuevo: number;
        impactoEconomico: number;
        advertencias: string[];
        errores: string[];
        detalleCuotas: any[];
    }>;
    modificarItemsMasivo(data: ModificarItemsMasivoDto): Promise<{
        modo: 'PREVIEW' | 'APLICAR';
        itemsAfectados: number;
        cuotasAfectadas: number;
        montoTotalOriginal: number;
        montoTotalNuevo: number;
        impactoEconomico: number;
        advertencias: string[];
        errores: string[];
        detalleItems: any[];
    }>;
    aplicarDescuentoGlobal(data: DescuentoGlobalDto): Promise<{
        modo: 'PREVIEW' | 'APLICAR';
        cuotasAfectadas: number;
        montoTotalOriginal: number;
        montoTotalNuevo: number;
        descuentoTotal: number;
        advertencias: string[];
        errores: string[];
        detalleCuotas: any[];
    }>;
    private obtenerCuotasConFiltros;
    private aplicarCondiciones;
    private calcularAjustes;
    private generarAdvertencias;
    private validarAjustes;
    private persistirAjustes;
    private obtenerItemsConFiltros;
    private calcularModificaciones;
    private validarModificaciones;
    private generarAdvertenciasItems;
    private persistirModificaciones;
}
//# sourceMappingURL=ajuste-masivo.service.d.ts.map