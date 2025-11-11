import { PrismaClient } from '@prisma/client';
import { CreateTipoActividadDto, UpdateTipoActividadDto, QueryTiposCatalogoDto, ReorderCatalogoDto } from '@/dto/catalogos-actividades.dto';
export declare class TiposActividadRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateTipoActividadDto): Promise<{
        activo: boolean;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }>;
    findAll(query: QueryTiposCatalogoDto): Promise<({
        _count: {
            actividades: number;
        };
    } & {
        activo: boolean;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        orden: number;
    })[]>;
    findById(id: number): Promise<{
        _count: {
            actividades: number;
        };
    } & {
        activo: boolean;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }>;
    update(id: number, data: UpdateTipoActividadDto): Promise<{
        activo: boolean;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }>;
    delete(id: number): Promise<{
        activo: boolean;
        nombre: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        descripcion: string | null;
        codigo: string;
        orden: number;
    }>;
    reorder(data: ReorderCatalogoDto): Promise<{
        message: string;
        count: number;
    }>;
}
//# sourceMappingURL=tiposActividad.repository.d.ts.map