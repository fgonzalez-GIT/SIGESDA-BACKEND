import { PrismaClient } from '@prisma/client';
import { CreateEstadoReservaDto, UpdateEstadoReservaDto, QueryEstadosReservasDto, ReorderEstadosReservasDto } from '@/dto/estados-reserva.dto';
export declare class EstadoReservaService {
    private prisma;
    private repository;
    constructor(prisma: PrismaClient);
    create(data: CreateEstadoReservaDto): Promise<{
        success: boolean;
        message: string;
        data: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    findAll(query: QueryEstadosReservasDto): Promise<{
        success: boolean;
        data: ({
            _count: {
                reservas: number;
            };
        } & {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        })[];
        message: string;
    }>;
    findById(id: number): Promise<{
        success: boolean;
        data: {
            _count: {
                reservas: number;
            };
        } & {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    findByCodigo(codigo: string): Promise<{
        success: boolean;
        data: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    update(id: number, data: UpdateEstadoReservaDto): Promise<{
        success: boolean;
        message: string;
        data: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    delete(id: number): Promise<{
        success: boolean;
        message: string;
        data: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    reorder(data: ReorderEstadosReservasDto): Promise<{
        success: boolean;
        message: string;
        data: {
            count: number;
        };
    }>;
    getEstadoInicial(): Promise<{
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    validateEstado(estadoId: number): Promise<boolean>;
    validateTransicion(estadoActualCodigo: string, nuevoEstadoCodigo: string): Promise<boolean>;
    getEstadisticasUso(): Promise<{
        success: boolean;
        data: {
            id: any;
            codigo: any;
            nombre: any;
            totalReservas: any;
            orden: any;
        }[];
        message: string;
    }>;
}
//# sourceMappingURL=estado-reserva.service.d.ts.map