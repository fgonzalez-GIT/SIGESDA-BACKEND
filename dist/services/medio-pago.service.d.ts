import { MedioPagoRepository } from '@/repositories/medio-pago.repository';
import { ReciboRepository } from '@/repositories/recibo.repository';
import { MedioPago, MedioPagoTipo } from '@prisma/client';
import { CreateMedioPagoDto, UpdateMedioPagoDto, MedioPagoFilterDto, MedioPagoSearchDto, MedioPagoStatsDto, DeleteBulkMediosPagoDto, ValidarPagoCompletoDto, ConciliacionBancariaDto } from '@/dto/medio-pago.dto';
export declare class MedioPagoService {
    private medioPagoRepository;
    private reciboRepository;
    constructor(medioPagoRepository: MedioPagoRepository, reciboRepository: ReciboRepository);
    create(data: CreateMedioPagoDto): Promise<MedioPago>;
    findAll(filters: MedioPagoFilterDto): Promise<{
        pages: number;
        mediosPago: Array<MedioPago & {
            recibo: {
                numero: string;
                estado: string;
                importe: import("@prisma/client/runtime/library").Decimal;
                concepto: string;
                fecha: Date;
                receptor: {
                    id: string;
                    nombre: string;
                    apellido: string;
                    dni: string;
                } | null;
            };
        }>;
        total: number;
        totalPages: number;
    }>;
    findById(id: string): Promise<MedioPago | null>;
    findByReciboId(reciboId: string): Promise<MedioPago[]>;
    update(id: string, data: UpdateMedioPagoDto): Promise<MedioPago>;
    delete(id: string): Promise<void>;
    deleteBulk(data: DeleteBulkMediosPagoDto): Promise<{
        eliminados: number;
        errores: string[];
    }>;
    search(data: MedioPagoSearchDto): Promise<({
        id: number;
        tipo: import(".prisma/client").$Enums.MedioPagoTipo;
        createdAt: Date;
        updatedAt: Date;
        observaciones: string | null;
        numero: string | null;
        importe: import("@prisma/client/runtime/library").Decimal;
        fecha: Date;
        reciboId: number;
        banco: string | null;
    } & {
        recibo: {
            numero: string;
            estado: string;
            importe: import("@prisma/client/runtime/library").Decimal;
            concepto: string;
            fecha: Date;
            receptor: {
                id: string;
                nombre: string;
                apellido: string;
                dni: string;
            } | null;
        };
    })[]>;
    getStatistics(data: MedioPagoStatsDto): Promise<{
        totalMediosPago: number;
        importeTotal: number;
        porTipo: Array<{
            tipo: MedioPagoTipo;
            cantidad: number;
            importeTotal: number;
            porcentaje: number;
        }>;
        porBanco?: Array<{
            banco: string;
            cantidad: number;
            importeTotal: number;
            tipos: MedioPagoTipo[];
        }>;
    }>;
    validatePayment(data: ValidarPagoCompletoDto): Promise<{
        alertas: string[];
        importeRecibo: number;
        importeTotalPagos: number;
        diferencia: number;
        esPagoCompleto: boolean;
        estado: "COMPLETO" | "PARCIAL" | "EXCEDIDO";
        mediosPago: Array<{
            id: string;
            tipo: MedioPagoTipo;
            importe: number;
            fecha: Date;
            numero?: string;
            banco?: string;
        }>;
    }>;
    getConciliacionBancaria(data: ConciliacionBancariaDto): Promise<{
        banco: string;
        periodo: {
            desde: Date;
            hasta: Date;
        };
        resumen: {
            tiposOperaciones: {
                tipo: MedioPagoTipo;
                cantidad: number;
                importe: number;
            }[];
            totalOperaciones: number;
            importeTotal: number;
        };
        operaciones: {
            id: string;
            tipo: MedioPagoTipo;
            numero: string;
            importe: number;
            fecha: Date;
            recibo: {
                numero: string;
                concepto: string;
                receptor: string;
            };
        }[];
        estadisticas: {
            promedioOperacion: number;
            operacionMayor: number;
            operacionMenor: number;
            diasConOperaciones: number;
        };
    }>;
    findByTipo(tipo: MedioPagoTipo, limit?: number): Promise<{
        id: number;
        tipo: import(".prisma/client").$Enums.MedioPagoTipo;
        createdAt: Date;
        updatedAt: Date;
        observaciones: string | null;
        numero: string | null;
        importe: import("@prisma/client/runtime/library").Decimal;
        fecha: Date;
        reciboId: number;
        banco: string | null;
    }[]>;
    getQuickStats(): Promise<{
        totalHoy: number;
        totalMes: number;
        porTipoHoy: Record<MedioPagoTipo, number>;
    }>;
    getDashboard(): Promise<{
        estadisticasHoy: {
            totalHoy: number;
            totalMes: number;
            porTipoHoy: Record<MedioPagoTipo, number>;
        };
        recientesPorTipo: {
            tipo: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE";
            mediosPago: {
                id: number;
                tipo: import(".prisma/client").$Enums.MedioPagoTipo;
                createdAt: Date;
                updatedAt: Date;
                observaciones: string | null;
                numero: string | null;
                importe: import("@prisma/client/runtime/library").Decimal;
                fecha: Date;
                reciboId: number;
                banco: string | null;
            }[];
        }[];
    }>;
    private validateMedioPagoSpecific;
    private updateReciboEstado;
    private getOtrosPagosDelRecibo;
}
//# sourceMappingURL=medio-pago.service.d.ts.map