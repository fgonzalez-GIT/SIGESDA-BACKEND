import { Cuota, CategoriaSocio } from '@prisma/client';
import { CuotaRepository } from '@/repositories/cuota.repository';
import { ReciboRepository } from '@/repositories/recibo.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { ConfiguracionRepository } from '@/repositories/configuracion.repository';
import { CreateCuotaDto, UpdateCuotaDto, CuotaQueryDto, GenerarCuotasDto, CuotaSearchDto, CuotaStatsDto, DeleteBulkCuotasDto, CalcularCuotaDto, RecalcularCuotasDto, ReporteCuotasDto } from '@/dto/cuota.dto';
export declare class CuotaService {
    private cuotaRepository;
    private reciboRepository;
    private personaRepository;
    private configuracionRepository;
    constructor(cuotaRepository: CuotaRepository, reciboRepository: ReciboRepository, personaRepository: PersonaRepository, configuracionRepository: ConfiguracionRepository);
    createCuota(data: CreateCuotaDto): Promise<Cuota>;
    getCuotas(query: CuotaQueryDto): Promise<{
        data: Cuota[];
        total: number;
        pages: number;
    }>;
    getCuotaById(id: string): Promise<Cuota | null>;
    getCuotaByReciboId(reciboId: string): Promise<Cuota | null>;
    getCuotasPorPeriodo(mes: number, anio: number, categoria?: CategoriaSocio): Promise<Cuota[]>;
    getCuotasBySocio(socioId: string, limit?: number): Promise<Cuota[]>;
    updateCuota(id: string, data: UpdateCuotaDto): Promise<Cuota>;
    deleteCuota(id: string): Promise<Cuota>;
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
    private calcularFechaVencimiento;
    private getNombreMes;
}
//# sourceMappingURL=cuota.service.d.ts.map