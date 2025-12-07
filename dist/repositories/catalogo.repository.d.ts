import { PrismaClient, TipoPersonaCatalogo, EspecialidadDocente } from '@prisma/client';
import { CreateTipoPersonaDto, UpdateTipoPersonaDto, CreateEspecialidadDto, UpdateEspecialidadDto } from '@/dto/catalogo.dto';
export declare class CatalogoRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    createTipoPersona(data: CreateTipoPersonaDto): Promise<TipoPersonaCatalogo>;
    getTipoPersonaById(id: number): Promise<TipoPersonaCatalogo | null>;
    getTipoPersonaByCodigo(codigo: string): Promise<TipoPersonaCatalogo | null>;
    updateTipoPersona(id: number, data: UpdateTipoPersonaDto): Promise<TipoPersonaCatalogo>;
    deleteTipoPersona(id: number): Promise<TipoPersonaCatalogo>;
    toggleActivoTipoPersona(id: number, activo: boolean): Promise<TipoPersonaCatalogo>;
    countPersonasConTipo(tipoPersonaId: number, soloActivos?: boolean): Promise<number>;
    getAllTiposPersonaWithStats(): Promise<Array<TipoPersonaCatalogo & {
        _count: {
            personasTipo: number;
        };
    }>>;
    createEspecialidad(data: CreateEspecialidadDto): Promise<EspecialidadDocente>;
    getEspecialidadById(id: number): Promise<EspecialidadDocente | null>;
    getEspecialidadByCodigo(codigo: string): Promise<EspecialidadDocente | null>;
    updateEspecialidad(id: number, data: UpdateEspecialidadDto): Promise<EspecialidadDocente>;
    deleteEspecialidad(id: number): Promise<EspecialidadDocente>;
    toggleActivoEspecialidad(id: number, activo: boolean): Promise<EspecialidadDocente>;
    countDocentesConEspecialidad(especialidadId: number, soloActivos?: boolean): Promise<number>;
    getAllEspecialidadesWithStats(): Promise<Array<EspecialidadDocente & {
        _count: {
            personaTipos: number;
        };
    }>>;
}
//# sourceMappingURL=catalogo.repository.d.ts.map