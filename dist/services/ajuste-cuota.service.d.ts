import { AjusteCuotaSocio, TipoAjusteCuota } from '@prisma/client';
import { AjusteCuotaRepository } from '@/repositories/ajuste-cuota.repository';
import { HistorialAjusteCuotaRepository } from '@/repositories/historial-ajuste-cuota.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { CreateAjusteCuotaDto, UpdateAjusteCuotaDto, QueryAjusteCuotaDto } from '@/dto/ajuste-cuota.dto';
export declare class AjusteCuotaService {
    private ajusteRepository;
    private historialRepository;
    private personaRepository;
    constructor(ajusteRepository: AjusteCuotaRepository, historialRepository: HistorialAjusteCuotaRepository, personaRepository: PersonaRepository);
    private get prisma();
    createAjuste(data: CreateAjusteCuotaDto, usuario?: string): Promise<AjusteCuotaSocio>;
    updateAjuste(id: number, data: UpdateAjusteCuotaDto, usuario?: string): Promise<AjusteCuotaSocio>;
    deactivateAjuste(id: number, usuario?: string, motivo?: string): Promise<AjusteCuotaSocio>;
    activateAjuste(id: number, usuario?: string, motivo?: string): Promise<AjusteCuotaSocio>;
    deleteAjuste(id: number, usuario?: string, motivo?: string): Promise<void>;
    getAjusteById(id: number): Promise<AjusteCuotaSocio | null>;
    getAjustesByPersonaId(personaId: number, soloActivos?: boolean): Promise<AjusteCuotaSocio[]>;
    getAjustesActivosParaPeriodo(personaId: number, fecha: Date): Promise<AjusteCuotaSocio[]>;
    getAjustes(filters?: QueryAjusteCuotaDto): Promise<AjusteCuotaSocio[]>;
    getStats(personaId?: number): Promise<any>;
    calcularAjuste(ajuste: AjusteCuotaSocio, montoOriginal: number): {
        montoOriginal: number;
        ajuste: number;
        montoFinal: number;
        tipoAjuste: TipoAjusteCuota;
        concepto: string;
    };
    calcularAjustesMultiples(ajustes: AjusteCuotaSocio[], montoOriginal: number): {
        montoOriginal: number;
        ajustes: Array<{
            ajusteId: number;
            concepto: string;
            tipoAjuste: TipoAjusteCuota;
            valor: number;
            ajusteCalculado: number;
            montoIntermedio: number;
        }>;
        montoFinal: number;
        totalAjuste: number;
    };
}
//# sourceMappingURL=ajuste-cuota.service.d.ts.map