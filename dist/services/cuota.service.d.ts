import { Cuota, CategoriaSocio } from '@prisma/client';
import { CuotaRepository } from '@/repositories/cuota.repository';
import { ReciboRepository } from '@/repositories/recibo.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { ConfiguracionRepository } from '@/repositories/configuracion.repository';
import { CreateCuotaDto, UpdateCuotaDto, CuotaQueryDto, GenerarCuotasDto, CuotaSearchDto, CuotaStatsDto, DeleteBulkCuotasDto, CalcularCuotaDto, RecalcularCuotasDto, ReporteCuotasDto, RecalcularCuotaDto, RegenerarCuotasDto, PreviewRecalculoDto } from '@/dto/cuota.dto';
export declare class CuotaService {
    private cuotaRepository;
    private reciboRepository;
    private personaRepository;
    private configuracionRepository;
    private ajusteService?;
    private exencionService?;
    constructor(cuotaRepository: CuotaRepository, reciboRepository: ReciboRepository, personaRepository: PersonaRepository, configuracionRepository: ConfiguracionRepository, ajusteService?: any | undefined, exencionService?: any | undefined);
    private get prisma();
    createCuota(data: CreateCuotaDto): Promise<Cuota>;
    getCuotas(query: CuotaQueryDto): Promise<{
        data: Cuota[];
        total: number;
        pages: number;
    }>;
    exportAll(query: Omit<CuotaQueryDto, 'page' | 'limit'>): Promise<{
        data: Cuota[];
        total: number;
    }>;
    getCuotaById(id: number): Promise<Cuota | null>;
    getCuotaByReciboId(reciboId: number): Promise<Cuota | null>;
    getCuotasPorPeriodo(mes: number, anio: number, categoria?: CategoriaSocio): Promise<Cuota[]>;
    getCuotasBySocio(socioId: number, limit?: number): Promise<Cuota[]>;
    updateCuota(id: number, data: UpdateCuotaDto): Promise<Cuota>;
    deleteCuota(id: number): Promise<Cuota>;
    generarCuotas(data: GenerarCuotasDto): Promise<{
        generated: number;
        errors: string[];
        cuotas: Cuota[];
    }>;
    calcularMontoCuota(data: CalcularCuotaDto): Promise<{
        montoBase: number;
        montoActividades: number;
        montoTotal: number;
        descuentos: number;
        detalleCalculo: any;
    }>;
    searchCuotas(searchData: CuotaSearchDto): Promise<Cuota[]>;
    getStatistics(statsData: CuotaStatsDto): Promise<any>;
    getVencidas(): Promise<Cuota[]>;
    getPendientes(): Promise<Cuota[]>;
    deleteBulkCuotas(data: DeleteBulkCuotasDto): Promise<{
        count: number;
    }>;
    recalcularCuotas(data: RecalcularCuotasDto): Promise<{
        updated: number;
        errors: string[];
    }>;
    getResumenMensual(mes: number, anio: number): Promise<any>;
    generarReporte(data: ReporteCuotasDto): Promise<any>;
    private calcularCostoActividades;
    private calcularDescuentos;
    generarCuotasConItems(data: GenerarCuotasDto): Promise<{
        generated: number;
        errors: string[];
        cuotas: any[];
        resumenDescuentos?: any;
    }>;
    recalcularCuota(data: RecalcularCuotaDto): Promise<{
        cuotaOriginal: any;
        cuotaRecalculada: any;
        cambios: {
            montoBase: {
                antes: number;
                despues: number;
                diferencia: number;
            };
            montoActividades: {
                antes: number;
                despues: number;
                diferencia: number;
            };
            montoTotal: {
                antes: number;
                despues: number;
                diferencia: number;
            };
            ajustesAplicados: any[];
            exencionesAplicadas: any[];
        };
    }>;
    regenerarCuotas(data: RegenerarCuotasDto): Promise<{
        eliminadas: number;
        generadas: number;
        cuotas: any[];
    }>;
    previewRecalculo(data: PreviewRecalculoDto): Promise<{
        cuotas: any[];
        cambios: any[];
        resumen: {
            totalCuotas: number;
            conCambios: number;
            sinCambios: number;
            totalAjuste: number;
        };
    }>;
    compararCuota(cuotaId: number): Promise<{
        actual: any;
        recalculada: any;
        diferencias: any;
    }>;
    private calcularMontosCuota;
    private aplicarAjustesYExenciones;
}
//# sourceMappingURL=cuota.service.d.ts.map