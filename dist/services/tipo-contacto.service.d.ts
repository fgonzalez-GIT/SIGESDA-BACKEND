import { CreateTipoContactoDto, UpdateTipoContactoDto, GetTiposContactoDto } from '@/dto/contacto.dto';
import { TipoContactoCatalogo } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
export declare class TipoContactoService {
    private tipoContactoRepository;
    constructor(prisma: PrismaClient);
    create(data: CreateTipoContactoDto): Promise<TipoContactoCatalogo>;
    findAll(params?: GetTiposContactoDto): Promise<TipoContactoCatalogo[]>;
    findById(id: number): Promise<TipoContactoCatalogo | null>;
    findByCodigo(codigo: string): Promise<TipoContactoCatalogo | null>;
    update(id: number, data: UpdateTipoContactoDto): Promise<TipoContactoCatalogo>;
    delete(id: number): Promise<TipoContactoCatalogo>;
    deactivate(id: number): Promise<TipoContactoCatalogo>;
    activate(id: number): Promise<TipoContactoCatalogo>;
    getEstadisticasUso(): Promise<{
        tipo: TipoContactoCatalogo;
        totalContactos: number;
        contactosActivos: number;
    }[]>;
}
//# sourceMappingURL=tipo-contacto.service.d.ts.map