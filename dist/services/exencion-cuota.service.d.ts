import { ExencionCuota } from '@prisma/client';
import { ExencionCuotaRepository } from '@/repositories/exencion-cuota.repository';
import { HistorialAjusteCuotaRepository } from '@/repositories/historial-ajuste-cuota.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { CreateExencionCuotaDto, UpdateExencionCuotaDto, AprobarExencionDto, RechazarExencionDto, RevocarExencionDto, QueryExencionCuotaDto } from '@/dto/exencion-cuota.dto';
export declare class ExencionCuotaService {
    private exencionRepository;
    private historialRepository;
    private personaRepository;
    constructor(exencionRepository: ExencionCuotaRepository, historialRepository: HistorialAjusteCuotaRepository, personaRepository: PersonaRepository);
    private get prisma();
    createExencion(data: CreateExencionCuotaDto, usuario?: string): Promise<ExencionCuota>;
    aprobarExencion(id: number, data: AprobarExencionDto, usuario?: string): Promise<ExencionCuota>;
    rechazarExencion(id: number, data: RechazarExencionDto, usuario?: string): Promise<ExencionCuota>;
    revocarExencion(id: number, data: RevocarExencionDto, usuario?: string): Promise<ExencionCuota>;
    updateExencion(id: number, data: UpdateExencionCuotaDto, usuario?: string): Promise<ExencionCuota>;
    deleteExencion(id: number, usuario?: string): Promise<void>;
    getExencionById(id: number): Promise<ExencionCuota | null>;
    getExencionesByPersonaId(personaId: number, soloActivas?: boolean): Promise<ExencionCuota[]>;
    getExenciones(filters?: QueryExencionCuotaDto): Promise<ExencionCuota[]>;
    getPendientes(): Promise<ExencionCuota[]>;
    getVigentes(): Promise<ExencionCuota[]>;
    getStats(personaId?: number): Promise<any>;
    checkExencionParaPeriodo(personaId: number, fecha: Date): Promise<{
        tieneExencion: boolean;
        porcentaje: number;
        exencion?: ExencionCuota;
    }>;
    updateVencidas(): Promise<number>;
}
//# sourceMappingURL=exencion-cuota.service.d.ts.map