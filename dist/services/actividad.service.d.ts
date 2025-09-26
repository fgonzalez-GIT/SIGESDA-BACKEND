import { Actividad, TipoActividad } from '@prisma/client';
import { ActividadRepository } from '@/repositories/actividad.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { CreateActividadDto, UpdateActividadDto, ActividadQueryDto } from '@/dto/actividad.dto';
export declare class ActividadService {
    private actividadRepository;
    private personaRepository;
    constructor(actividadRepository: ActividadRepository, personaRepository: PersonaRepository);
    createActividad(data: CreateActividadDto): Promise<Actividad>;
    getActividades(query: ActividadQueryDto): Promise<{
        data: Actividad[];
        total: number;
        pages: number;
    }>;
    getActividadById(id: string): Promise<Actividad | null>;
    getActividadesByTipo(tipo: TipoActividad): Promise<Actividad[]>;
    updateActividad(id: string, data: UpdateActividadDto): Promise<Actividad>;
    deleteActividad(id: string, hard?: boolean): Promise<Actividad>;
    asignarDocente(actividadId: string, docenteId: string): Promise<Actividad>;
    desasignarDocente(actividadId: string, docenteId: string): Promise<Actividad>;
    getParticipantes(actividadId: string): Promise<any[]>;
    getEstadisticas(actividadId: string): Promise<any>;
    getDocentesDisponibles(): Promise<any[]>;
    getCoros(): Promise<Actividad[]>;
    getClasesInstrumento(): Promise<Actividad[]>;
    getClasesCanto(): Promise<Actividad[]>;
    searchActividades(searchTerm: string, tipo?: TipoActividad): Promise<Actividad[]>;
}
//# sourceMappingURL=actividad.service.d.ts.map