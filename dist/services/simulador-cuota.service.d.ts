import { CuotaService } from './cuota.service';
import { MotorReglasDescuentos } from './motor-reglas-descuentos.service';
import { AjusteCuotaService } from './ajuste-cuota.service';
import { ExencionCuotaService } from './exencion-cuota.service';
import { SimularGeneracionDto, SimularReglaDescuentoDto, CompararEscenariosDto, SimularImpactoMasivoDto } from '@/dto/cuota.dto';
export declare class SimuladorCuotaService {
    private cuotaService;
    private motorReglasDescuentos;
    private ajusteService?;
    private exencionService?;
    constructor(cuotaService: CuotaService, motorReglasDescuentos: MotorReglasDescuentos, ajusteService?: AjusteCuotaService, exencionService?: ExencionCuotaService);
    private get prisma();
    simularGeneracion(data: SimularGeneracionDto): Promise<{
        cuotasSimuladas: any[];
        resumen: {
            totalCuotas: number;
            montoTotal: number;
            montoPorCategoria: Record<string, number>;
            sociosAfectados: number;
            descuentosAplicados: number;
            ajustesAplicados: number;
            exencionesAplicadas: number;
        };
        detalleCalculo: any[];
    }>;
    simularReglaDescuento(data: SimularReglaDescuentoDto): Promise<{
        impactoActual: any;
        impactoNuevo: any;
        diferencia: {
            montoTotal: number;
            porcentaje: number;
            sociosAfectados: number;
        };
        detalleComparacion: any[];
    }>;
    compararEscenarios(data: CompararEscenariosDto): Promise<{
        escenarios: any[];
        comparacion: {
            mejorEscenario: string;
            mayorRecaudacion: number;
            menorRecaudacion: number;
            diferenciaMaxima: number;
        };
        recomendacion: string;
    }>;
    simularImpactoMasivo(data: SimularImpactoMasivoDto): Promise<{
        impactoInmediato: any;
        proyeccion?: any[];
        resumen: {
            diferenciaTotal: number;
            porcentajeCambio: number;
            sociosAfectados: number;
            impactoAnual?: number;
        };
    }>;
    private obtenerSociosElegibles;
    private calcularCuotaSimulada;
    private simularGeneracionConReglas;
    private simularGeneracionConCambios;
    private generarRecomendacion;
}
//# sourceMappingURL=simulador-cuota.service.d.ts.map