import { PrismaClient } from '@prisma/client';
import { CreateActividadDto, UpdateActividadDto, QueryActividadesDto } from '@/dto/actividad-v2.dto';
export declare class ActividadRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateActividadDto): Promise<{
        id: number;
        nombre: string;
        observaciones: string | null;
        descripcion: string | null;
        costo: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        codigo_actividad: string;
        fecha_desde: Date;
        fecha_hasta: Date | null;
        cupo_maximo: number | null;
        updated_at: Date;
        tipo_actividad_id: number;
        categoria_id: number;
        estado_id: number;
    }>;
    findAll(query: QueryActividadesDto): Promise<{
        data: {
            id: number;
            nombre: string;
            observaciones: string | null;
            descripcion: string | null;
            costo: import("@prisma/client/runtime/library").Decimal;
            created_at: Date;
            codigo_actividad: string;
            fecha_desde: Date;
            fecha_hasta: Date | null;
            cupo_maximo: number | null;
            updated_at: Date;
            tipo_actividad_id: number;
            categoria_id: number;
            estado_id: number;
        }[];
        total: number;
    }>;
    findById(id: number): Promise<({
        categorias_actividades: {
            id: number;
            nombre: string;
            activo: boolean;
            codigo: string;
            descripcion: string | null;
            orden: number;
            created_at: Date;
            updated_at: Date;
        };
        docentes_actividades: ({
            roles_docentes: {
                id: number;
                nombre: string;
                activo: boolean;
                codigo: string;
                descripcion: string | null;
                orden: number;
                created_at: Date;
                updated_at: Date;
            };
            personas: {
                id: number;
                nombre: string;
                apellido: string;
                email: string | null;
                telefono: string | null;
                especialidad: string | null;
                honorariosPorHora: import("@prisma/client/runtime/library").Decimal | null;
            };
        } & {
            id: number;
            observaciones: string | null;
            activo: boolean;
            created_at: Date;
            updated_at: Date;
            fecha_asignacion: Date;
            fecha_desasignacion: Date | null;
            docente_id: number;
            rol_docente_id: number;
            actividad_id: number;
        })[];
        estados_actividades: {
            id: number;
            nombre: string;
            activo: boolean;
            codigo: string;
            descripcion: string | null;
            orden: number;
            created_at: Date;
            updated_at: Date;
        };
        horarios_actividades: ({
            dias_semana: {
                id: number;
                nombre: string;
                codigo: string;
                orden: number;
            };
            reservas_aulas_actividades: ({
                aulas: {
                    id: number;
                    nombre: string;
                    capacidad: number;
                };
            } & {
                id: number;
                observaciones: string | null;
                created_at: Date;
                updated_at: Date;
                fecha_vigencia_desde: Date;
                fecha_vigencia_hasta: Date | null;
                horario_id: number;
                aula_id: number;
            })[];
        } & {
            id: number;
            activo: boolean;
            created_at: Date;
            updated_at: Date;
            hora_inicio: Date;
            hora_fin: Date;
            dia_semana_id: number;
            actividad_id: number;
        })[];
        participaciones_actividades: ({
            personas: {
                id: number;
                tipo: import(".prisma/client").$Enums.TipoPersona;
                nombre: string;
                apellido: string;
                email: string | null;
                telefono: string | null;
            };
        } & {
            id: number;
            observaciones: string | null;
            activo: boolean;
            created_at: Date;
            updated_at: Date;
            actividad_id: number;
            persona_id: number;
            fecha_inicio: Date;
            fecha_fin: Date | null;
            precio_especial: import("@prisma/client/runtime/library").Decimal | null;
        })[];
        tipos_actividades: {
            id: number;
            nombre: string;
            activo: boolean;
            codigo: string;
            descripcion: string | null;
            orden: number;
            created_at: Date;
            updated_at: Date;
        };
        _count: {
            participaciones_actividades: number;
        };
    } & {
        id: number;
        nombre: string;
        observaciones: string | null;
        descripcion: string | null;
        costo: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        codigo_actividad: string;
        fecha_desde: Date;
        fecha_hasta: Date | null;
        cupo_maximo: number | null;
        updated_at: Date;
        tipo_actividad_id: number;
        categoria_id: number;
        estado_id: number;
    }) | null>;
    findByCodigoActividad(codigo: string): Promise<({
        categorias_actividades: {
            id: number;
            nombre: string;
            activo: boolean;
            codigo: string;
            descripcion: string | null;
            orden: number;
            created_at: Date;
            updated_at: Date;
        };
        estados_actividades: {
            id: number;
            nombre: string;
            activo: boolean;
            codigo: string;
            descripcion: string | null;
            orden: number;
            created_at: Date;
            updated_at: Date;
        };
        tipos_actividades: {
            id: number;
            nombre: string;
            activo: boolean;
            codigo: string;
            descripcion: string | null;
            orden: number;
            created_at: Date;
            updated_at: Date;
        };
    } & {
        id: number;
        nombre: string;
        observaciones: string | null;
        descripcion: string | null;
        costo: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        codigo_actividad: string;
        fecha_desde: Date;
        fecha_hasta: Date | null;
        cupo_maximo: number | null;
        updated_at: Date;
        tipo_actividad_id: number;
        categoria_id: number;
        estado_id: number;
    }) | null>;
    update(id: number, data: UpdateActividadDto): Promise<{
        categorias_actividades: {
            id: number;
            nombre: string;
            activo: boolean;
            codigo: string;
            descripcion: string | null;
            orden: number;
            created_at: Date;
            updated_at: Date;
        };
        docentes_actividades: ({
            roles_docentes: {
                id: number;
                nombre: string;
                activo: boolean;
                codigo: string;
                descripcion: string | null;
                orden: number;
                created_at: Date;
                updated_at: Date;
            };
            personas: {
                id: number;
                nombre: string;
                apellido: string;
                especialidad: string | null;
            };
        } & {
            id: number;
            observaciones: string | null;
            activo: boolean;
            created_at: Date;
            updated_at: Date;
            fecha_asignacion: Date;
            fecha_desasignacion: Date | null;
            docente_id: number;
            rol_docente_id: number;
            actividad_id: number;
        })[];
        estados_actividades: {
            id: number;
            nombre: string;
            activo: boolean;
            codigo: string;
            descripcion: string | null;
            orden: number;
            created_at: Date;
            updated_at: Date;
        };
        horarios_actividades: ({
            dias_semana: {
                id: number;
                nombre: string;
                codigo: string;
                orden: number;
            };
        } & {
            id: number;
            activo: boolean;
            created_at: Date;
            updated_at: Date;
            hora_inicio: Date;
            hora_fin: Date;
            dia_semana_id: number;
            actividad_id: number;
        })[];
        tipos_actividades: {
            id: number;
            nombre: string;
            activo: boolean;
            codigo: string;
            descripcion: string | null;
            orden: number;
            created_at: Date;
            updated_at: Date;
        };
    } & {
        id: number;
        nombre: string;
        observaciones: string | null;
        descripcion: string | null;
        costo: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        codigo_actividad: string;
        fecha_desde: Date;
        fecha_hasta: Date | null;
        cupo_maximo: number | null;
        updated_at: Date;
        tipo_actividad_id: number;
        categoria_id: number;
        estado_id: number;
    }>;
    delete(id: number): Promise<{
        id: number;
        nombre: string;
        observaciones: string | null;
        descripcion: string | null;
        costo: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        codigo_actividad: string;
        fecha_desde: Date;
        fecha_hasta: Date | null;
        cupo_maximo: number | null;
        updated_at: Date;
        tipo_actividad_id: number;
        categoria_id: number;
        estado_id: number;
    }>;
    cambiarEstado(id: number, nuevoEstadoId: number, observaciones?: string): Promise<{
        estados_actividades: {
            id: number;
            nombre: string;
            activo: boolean;
            codigo: string;
            descripcion: string | null;
            orden: number;
            created_at: Date;
            updated_at: Date;
        };
    } & {
        id: number;
        nombre: string;
        observaciones: string | null;
        descripcion: string | null;
        costo: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        codigo_actividad: string;
        fecha_desde: Date;
        fecha_hasta: Date | null;
        cupo_maximo: number | null;
        updated_at: Date;
        tipo_actividad_id: number;
        categoria_id: number;
        estado_id: number;
    }>;
    agregarHorario(actividadId: number, horarioData: any): Promise<{
        actividades: {
            id: number;
            nombre: string;
            codigo_actividad: string;
        };
        dias_semana: {
            id: number;
            nombre: string;
            codigo: string;
            orden: number;
        };
    } & {
        id: number;
        activo: boolean;
        created_at: Date;
        updated_at: Date;
        hora_inicio: Date;
        hora_fin: Date;
        dia_semana_id: number;
        actividad_id: number;
    }>;
    updateHorario(horarioId: number, horarioData: any): Promise<{
        actividades: {
            id: number;
            nombre: string;
        };
        dias_semana: {
            id: number;
            nombre: string;
            codigo: string;
            orden: number;
        };
    } & {
        id: number;
        activo: boolean;
        created_at: Date;
        updated_at: Date;
        hora_inicio: Date;
        hora_fin: Date;
        dia_semana_id: number;
        actividad_id: number;
    }>;
    deleteHorario(horarioId: number): Promise<{
        id: number;
        activo: boolean;
        created_at: Date;
        updated_at: Date;
        hora_inicio: Date;
        hora_fin: Date;
        dia_semana_id: number;
        actividad_id: number;
    }>;
    getHorariosByActividad(actividadId: number): Promise<({
        dias_semana: {
            id: number;
            nombre: string;
            codigo: string;
            orden: number;
        };
        reservas_aulas_actividades: ({
            aulas: {
                id: number;
                tipo: string | null;
                nombre: string;
                observaciones: string | null;
                createdAt: Date;
                updatedAt: Date;
                activa: boolean;
                estado: string | null;
                descripcion: string | null;
                capacidad: number;
                ubicacion: string | null;
                equipamiento: string | null;
            };
        } & {
            id: number;
            observaciones: string | null;
            created_at: Date;
            updated_at: Date;
            fecha_vigencia_desde: Date;
            fecha_vigencia_hasta: Date | null;
            horario_id: number;
            aula_id: number;
        })[];
    } & {
        id: number;
        activo: boolean;
        created_at: Date;
        updated_at: Date;
        hora_inicio: Date;
        hora_fin: Date;
        dia_semana_id: number;
        actividad_id: number;
    })[]>;
    findHorarioById(horarioId: number): Promise<({
        actividades: {
            id: number;
            nombre: string;
            codigo_actividad: string;
        };
        dias_semana: {
            id: number;
            nombre: string;
            codigo: string;
            orden: number;
        };
    } & {
        id: number;
        activo: boolean;
        created_at: Date;
        updated_at: Date;
        hora_inicio: Date;
        hora_fin: Date;
        dia_semana_id: number;
        actividad_id: number;
    }) | null>;
    asignarDocente(actividadId: number, docenteId: string, rolDocenteId: number, observaciones?: string): Promise<{
        id: number;
        observaciones: string | null;
        activo: boolean;
        created_at: Date;
        updated_at: Date;
        fecha_asignacion: Date;
        fecha_desasignacion: Date | null;
        docente_id: number;
        rol_docente_id: number;
        actividad_id: number;
    }>;
    desasignarDocente(actividadId: number, docenteId: number, rolDocenteId: number): Promise<{
        roles_docentes: {
            id: number;
            nombre: string;
            activo: boolean;
            codigo: string;
            descripcion: string | null;
            orden: number;
            created_at: Date;
            updated_at: Date;
        };
        personas: {
            id: number;
            nombre: string;
            apellido: string;
        };
    } & {
        id: number;
        observaciones: string | null;
        activo: boolean;
        created_at: Date;
        updated_at: Date;
        fecha_asignacion: Date;
        fecha_desasignacion: Date | null;
        docente_id: number;
        rol_docente_id: number;
        actividad_id: number;
    }>;
    getDocentesByActividad(actividadId: number): Promise<({
        roles_docentes: {
            id: number;
            nombre: string;
            activo: boolean;
            codigo: string;
            descripcion: string | null;
            orden: number;
            created_at: Date;
            updated_at: Date;
        };
        personas: {
            id: number;
            nombre: string;
            apellido: string;
            email: string | null;
            telefono: string | null;
            especialidad: string | null;
            honorariosPorHora: import("@prisma/client/runtime/library").Decimal | null;
        };
    } & {
        id: number;
        observaciones: string | null;
        activo: boolean;
        created_at: Date;
        updated_at: Date;
        fecha_asignacion: Date;
        fecha_desasignacion: Date | null;
        docente_id: number;
        rol_docente_id: number;
        actividad_id: number;
    })[]>;
    getDocentesDisponibles(): Promise<{
        id: number;
        nombre: string;
        apellido: string;
        email: string | null;
        telefono: string | null;
        especialidad: string | null;
        honorariosPorHora: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    getParticipantes(actividadId: number): Promise<({
        personas: {
            id: number;
            tipo: import(".prisma/client").$Enums.TipoPersona;
            nombre: string;
            apellido: string;
            email: string | null;
            telefono: string | null;
            categoriaId: number | null;
            categoria: {
                id: number;
                nombre: string;
                createdAt: Date;
                updatedAt: Date;
                activa: boolean;
                codigo: string;
                descripcion: string | null;
                montoCuota: import("@prisma/client/runtime/library").Decimal;
                descuento: import("@prisma/client/runtime/library").Decimal;
                orden: number;
            } | null;
        };
    } & {
        id: number;
        observaciones: string | null;
        activo: boolean;
        created_at: Date;
        updated_at: Date;
        actividad_id: number;
        persona_id: number;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        precio_especial: import("@prisma/client/runtime/library").Decimal | null;
    })[]>;
    addParticipante(actividadId: number, personaId: string, fechaInicio: string, observaciones?: string): Promise<{
        id: number;
        observaciones: string | null;
        activo: boolean;
        created_at: Date;
        updated_at: Date;
        actividad_id: number;
        persona_id: number;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        precio_especial: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    getEstadisticas(actividadId: number): Promise<{
        totalParticipantes: number;
        totalHorarios: number;
        totalDocentes: number;
        cupoMaximo: number | null;
        cupoDisponible: number | null;
        porcentajeOcupacion: number | null;
        estaLlena: boolean;
    } | null>;
    getTiposActividades(): Promise<{
        id: number;
        nombre: string;
        activo: boolean;
        codigo: string;
        descripcion: string | null;
        orden: number;
        created_at: Date;
        updated_at: Date;
    }[]>;
    getCategoriasActividades(): Promise<{
        id: number;
        nombre: string;
        activo: boolean;
        codigo: string;
        descripcion: string | null;
        orden: number;
        created_at: Date;
        updated_at: Date;
    }[]>;
    getEstadosActividades(): Promise<{
        id: number;
        nombre: string;
        activo: boolean;
        codigo: string;
        descripcion: string | null;
        orden: number;
        created_at: Date;
        updated_at: Date;
    }[]>;
    getDiasSemana(): Promise<{
        id: number;
        nombre: string;
        codigo: string;
        orden: number;
    }[]>;
    getRolesDocentes(): Promise<{
        id: number;
        nombre: string;
        activo: boolean;
        codigo: string;
        descripcion: string | null;
        orden: number;
        created_at: Date;
        updated_at: Date;
    }[]>;
    private parseTimeToDate;
    static formatTime(date: Date): string;
    static minutesToTime(minutes: number): string;
    static timeToMinutes(time: string): number;
}
//# sourceMappingURL=actividad.repository.d.ts.map