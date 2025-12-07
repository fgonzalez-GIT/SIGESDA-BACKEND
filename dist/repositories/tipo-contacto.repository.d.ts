import { PrismaClient, TipoContactoCatalogo } from '@prisma/client';
import { CreateTipoContactoDto, UpdateTipoContactoDto } from '@/dto/contacto.dto';
export declare class TipoContactoRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateTipoContactoDto): Promise<TipoContactoCatalogo>;
    findAll(soloActivos?: boolean, ordenarPor?: 'orden' | 'nombre' | 'codigo'): Promise<TipoContactoCatalogo[]>;
    findById(id: number): Promise<TipoContactoCatalogo | null>;
    findByCodigo(codigo: string): Promise<TipoContactoCatalogo | null>;
    update(id: number, data: UpdateTipoContactoDto): Promise<TipoContactoCatalogo>;
    delete(id: number): Promise<TipoContactoCatalogo>;
    deactivate(id: number): Promise<TipoContactoCatalogo>;
    activate(id: number): Promise<TipoContactoCatalogo>;
    contarContactosAsociados(id: number): Promise<number>;
    getEstadisticasUso(): Promise<Array<{
        tipo: TipoContactoCatalogo;
        totalContactos: number;
        contactosActivos: number;
    }>>;
}
//# sourceMappingURL=tipo-contacto.repository.d.ts.map