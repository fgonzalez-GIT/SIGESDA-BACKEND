import { TipoPersonaCatalogo, EspecialidadDocente } from '@prisma/client';
import { CatalogoRepository } from '@/repositories/catalogo.repository';
import { CreateTipoPersonaDto, UpdateTipoPersonaDto, CreateEspecialidadDto, UpdateEspecialidadDto } from '@/dto/catalogo.dto';
export declare class CatalogoService {
    private catalogoRepository;
    constructor(catalogoRepository: CatalogoRepository);
    createTipoPersona(data: CreateTipoPersonaDto): Promise<TipoPersonaCatalogo>;
    updateTipoPersona(id: number, data: UpdateTipoPersonaDto): Promise<TipoPersonaCatalogo>;
    deleteTipoPersona(id: number): Promise<TipoPersonaCatalogo>;
    toggleActivoTipoPersona(id: number, activo: boolean): Promise<TipoPersonaCatalogo>;
    getAllTiposPersonaWithStats(): Promise<({
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        descripcion: string | null;
        codigo: string;
        orden: number;
        requiresCategoria: boolean;
        requiresEspecialidad: boolean;
        requiresCuit: boolean;
    } & {
        _count: {
            personasTipo: number;
        };
    })[]>;
    getTipoPersonaById(id: number): Promise<TipoPersonaCatalogo>;
    createEspecialidad(data: CreateEspecialidadDto): Promise<EspecialidadDocente>;
    updateEspecialidad(id: number, data: UpdateEspecialidadDto): Promise<EspecialidadDocente>;
    deleteEspecialidad(id: number): Promise<EspecialidadDocente>;
    toggleActivoEspecialidad(id: number, activo: boolean): Promise<EspecialidadDocente>;
    getAllEspecialidadesWithStats(): Promise<({
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        descripcion: string | null;
        codigo: string;
        orden: number;
    } & {
        _count: {
            personasTipo: number;
        };
    })[]>;
    getEspecialidadById(id: number): Promise<EspecialidadDocente>;
}
//# sourceMappingURL=catalogo.service.d.ts.map