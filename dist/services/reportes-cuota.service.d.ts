import { DashboardCuotasDto, ReportePorCategoriaDto, AnalisisDescuentosDto, ReporteExencionesDto, ReporteComparativoDto, EstadisticasRecaudacionDto } from '@/dto/reportes-cuota.dto';
export declare class ReportesCuotaService {
    private get prisma();
    getDashboard(params?: DashboardCuotasDto): Promise<any>;
    getReportePorCategoria(params: ReportePorCategoriaDto): Promise<any>;
    getAnalisisDescuentos(params: AnalisisDescuentosDto): Promise<any>;
    getReporteExenciones(params: ReporteExencionesDto): Promise<any>;
    getReporteComparativo(params: ReporteComparativoDto): Promise<any>;
    getEstadisticasRecaudacion(params?: EstadisticasRecaudacionDto): Promise<any>;
    private getNombreMes;
    private calculatePercentageChange;
}
//# sourceMappingURL=reportes-cuota.service.d.ts.map