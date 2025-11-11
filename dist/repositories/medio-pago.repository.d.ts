import { PrismaClient, MedioPago, MedioPagoTipo, Prisma } from '@prisma/client';
import type { MedioPagoFilterDto, MedioPagoSearchDto, MedioPagoStatsDto, ConciliacionBancariaDto, CreateMedioPagoDto, UpdateMedioPagoDto } from '../dto/medio-pago.dto';
export declare class MedioPagoRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateMedioPagoDto): Promise<MedioPago>;
    findMany(filters: MedioPagoFilterDto): Promise<{
        mediosPago: Array<MedioPago & {
            recibo: {
                numero: string;
                estado: string;
                importe: Prisma.Decimal;
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
    findById(id: string): Promise<(MedioPago & {
        recibo: {
            numero: string;
            estado: string;
            importe: Prisma.Decimal;
            concepto: string;
            fecha: Date;
            receptor: {
                id: string;
                nombre: string;
                apellido: string;
                dni: string;
            } | null;
        };
    }) | null>;
    findByReciboId(reciboId: string): Promise<Array<MedioPago>>;
    update(id: string, data: UpdateMedioPagoDto): Promise<MedioPago>;
    delete(id: string): Promise<MedioPago>;
    deleteMany(ids: string[]): Promise<{
        count: number;
    }>;
    search(filters: MedioPagoSearchDto): Promise<Array<MedioPago & {
        recibo: {
            numero: string;
            estado: string;
            importe: Prisma.Decimal;
            concepto: string;
            fecha: Date;
            receptor: {
                id: string;
                nombre: string;
                apellido: string;
                dni: string;
            } | null;
        };
    }>>;
    getStats(filters: MedioPagoStatsDto): Promise<{
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
    validatePayment(reciboId: string, tolerancia?: number): Promise<{
        importeRecibo: number;
        importeTotalPagos: number;
        diferencia: number;
        esPagoCompleto: boolean;
        estado: 'COMPLETO' | 'PARCIAL' | 'EXCEDIDO';
        mediosPago: Array<{
            id: string;
            tipo: MedioPagoTipo;
            importe: number;
            fecha: Date;
            numero?: string;
            banco?: string;
        }>;
    }>;
    getConciliacionBancaria(filters: ConciliacionBancariaDto): Promise<{
        operaciones: Array<{
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
        }>;
        resumen: {
            totalOperaciones: number;
            importeTotal: number;
        };
    }>;
    findByTipo(tipo: MedioPagoTipo, limit?: number): Promise<Array<MedioPago>>;
    getTotalPagosByRecibo(reciboId: string): Promise<number>;
    checkDuplicateNumber(numero: string, tipo: MedioPagoTipo, excludeId?: string): Promise<boolean>;
    getQuickStats(): Promise<{
        totalHoy: number;
        totalMes: number;
        porTipoHoy: Record<MedioPagoTipo, number>;
    }>;
}
//# sourceMappingURL=medio-pago.repository.d.ts.map