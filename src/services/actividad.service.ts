import { Actividad, TipoActividad, TipoPersona } from '@prisma/client';
import { ActividadRepository } from '@/repositories/actividad.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { CreateActividadDto, UpdateActividadDto, ActividadQueryDto } from '@/dto/actividad.dto';
import { logger } from '@/utils/logger';

export class ActividadService {
  constructor(
    private actividadRepository: ActividadRepository,
    private personaRepository: PersonaRepository
  ) {}

  async createActividad(data: CreateActividadDto): Promise<Actividad> {
    // Validar que los docentes existen y son del tipo correcto
    if (data.docenteIds && data.docenteIds.length > 0) {
      for (const docenteId of data.docenteIds) {
        const docente = await this.personaRepository.findById(docenteId);
        if (!docente) {
          throw new Error(`Docente con ID ${docenteId} no encontrado`);
        }
        if (docente.tipo !== TipoPersona.DOCENTE) {
          throw new Error(`La persona ${docente.nombre} ${docente.apellido} no es un docente`);
        }
        if (docente.fechaBaja) {
          throw new Error(`El docente ${docente.nombre} ${docente.apellido} está dado de baja`);
        }
      }
    }

    // Validar precio según tipo de actividad
    if (data.tipo === TipoActividad.CORO && data.precio > 0) {
      logger.warn(`Creando coro con precio ${data.precio}. Los coros suelen ser gratuitos.`);
    }

    const actividad = await this.actividadRepository.create(data);

    logger.info(`Actividad creada: ${actividad.nombre} (${actividad.tipo}) - ID: ${actividad.id}`);

    return actividad;
  }

  async getActividades(query: ActividadQueryDto): Promise<{ data: Actividad[]; total: number; pages: number }> {
    const result = await this.actividadRepository.findAll(query);
    const pages = Math.ceil(result.total / query.limit);

    return {
      ...result,
      pages
    };
  }

  async getActividadById(id: string): Promise<Actividad | null> {
    return this.actividadRepository.findById(id);
  }

  async getActividadesByTipo(tipo: TipoActividad): Promise<Actividad[]> {
    return this.actividadRepository.findByTipo(tipo);
  }

  async updateActividad(id: string, data: UpdateActividadDto): Promise<Actividad> {
    // Verificar que la actividad existe
    const existingActividad = await this.actividadRepository.findById(id);
    if (!existingActividad) {
      throw new Error(`Actividad con ID ${id} no encontrada`);
    }

    // Validar docentes si se están actualizando
    if (data.docenteIds !== undefined) {
      for (const docenteId of data.docenteIds) {
        const docente = await this.personaRepository.findById(docenteId);
        if (!docente) {
          throw new Error(`Docente con ID ${docenteId} no encontrado`);
        }
        if (docente.tipo !== TipoPersona.DOCENTE) {
          throw new Error(`La persona ${docente.nombre} ${docente.apellido} no es un docente`);
        }
        if (docente.fechaBaja) {
          throw new Error(`El docente ${docente.nombre} ${docente.apellido} está dado de baja`);
        }
      }
    }

    const updatedActividad = await this.actividadRepository.update(id, data);

    logger.info(`Actividad actualizada: ${updatedActividad.nombre} (ID: ${id})`);

    return updatedActividad;
  }

  async deleteActividad(id: string, hard = false): Promise<Actividad> {
    const existingActividad = await this.actividadRepository.findById(id);
    if (!existingActividad) {
      throw new Error(`Actividad con ID ${id} no encontrada`);
    }

    // Verificar si tiene participaciones activas
    const participaciones = (existingActividad as any).participaciones || [];
    if (participaciones.length > 0) {
      if (hard) {
        throw new Error('No se puede eliminar permanentemente una actividad con participaciones. Use eliminación lógica.');
      }

      // Soft delete si tiene participaciones
      const deletedActividad = await this.actividadRepository.softDelete(id);
      logger.info(`Actividad dada de baja: ${deletedActividad.nombre} (ID: ${id})`);
      return deletedActividad;
    }

    let deletedActividad: Actividad;

    if (hard) {
      deletedActividad = await this.actividadRepository.delete(id);
      logger.info(`Actividad eliminada permanentemente: ${deletedActividad.nombre} (ID: ${id})`);
    } else {
      deletedActividad = await this.actividadRepository.softDelete(id);
      logger.info(`Actividad dada de baja: ${deletedActividad.nombre} (ID: ${id})`);
    }

    return deletedActividad;
  }

  async asignarDocente(actividadId: string, docenteId: string): Promise<Actividad> {
    // Verificar que la actividad existe
    const actividad = await this.actividadRepository.findById(actividadId);
    if (!actividad) {
      throw new Error(`Actividad con ID ${actividadId} no encontrada`);
    }

    // Verificar que el docente existe y es válido
    const docente = await this.personaRepository.findById(docenteId);
    if (!docente) {
      throw new Error(`Docente con ID ${docenteId} no encontrado`);
    }
    if (docente.tipo !== TipoPersona.DOCENTE) {
      throw new Error(`La persona ${docente.nombre} ${docente.apellido} no es un docente`);
    }
    if (docente.fechaBaja) {
      throw new Error(`El docente ${docente.nombre} ${docente.apellido} está dado de baja`);
    }

    // Verificar que el docente no esté ya asignado
    const docentes = (actividad as any).docentes || [];
    const yaAsignado = docentes.some((d: any) => d.id === docenteId);
    if (yaAsignado) {
      throw new Error(`El docente ${docente.nombre} ${docente.apellido} ya está asignado a esta actividad`);
    }

    const updatedActividad = await this.actividadRepository.asignarDocente(actividadId, docenteId);

    logger.info(`Docente ${docente.nombre} ${docente.apellido} asignado a actividad ${actividad.nombre}`);

    return updatedActividad;
  }

  async desasignarDocente(actividadId: string, docenteId: string): Promise<Actividad> {
    // Verificar que la actividad existe
    const actividad = await this.actividadRepository.findById(actividadId);
    if (!actividad) {
      throw new Error(`Actividad con ID ${actividadId} no encontrada`);
    }

    // Verificar que el docente está asignado
    const docentes = (actividad as any).docentes || [];
    const docente = docentes.find((d: any) => d.id === docenteId);
    if (!docente) {
      throw new Error('El docente no está asignado a esta actividad');
    }

    const updatedActividad = await this.actividadRepository.desasignarDocente(actividadId, docenteId);

    logger.info(`Docente ${docente.nombre} ${docente.apellido} desasignado de actividad ${actividad.nombre}`);

    return updatedActividad;
  }

  async getParticipantes(actividadId: string): Promise<any[]> {
    const actividad = await this.actividadRepository.findById(actividadId);
    if (!actividad) {
      throw new Error(`Actividad con ID ${actividadId} no encontrada`);
    }

    return this.actividadRepository.getParticipantes(actividadId);
  }

  async getEstadisticas(actividadId: string): Promise<any> {
    const actividad = await this.actividadRepository.findById(actividadId);
    if (!actividad) {
      throw new Error(`Actividad con ID ${actividadId} no encontrada`);
    }

    return this.actividadRepository.getEstadisticas(actividadId);
  }

  async getDocentesDisponibles(): Promise<any[]> {
    return this.actividadRepository.getDocentesDisponibles();
  }

  async getCoros(): Promise<Actividad[]> {
    return this.getActividadesByTipo(TipoActividad.CORO);
  }

  async getClasesInstrumento(): Promise<Actividad[]> {
    return this.getActividadesByTipo(TipoActividad.CLASE_INSTRUMENTO);
  }

  async getClasesCanto(): Promise<Actividad[]> {
    return this.getActividadesByTipo(TipoActividad.CLASE_CANTO);
  }

  async searchActividades(searchTerm: string, tipo?: TipoActividad): Promise<Actividad[]> {
    const result = await this.actividadRepository.findAll({
      search: searchTerm,
      tipo,
      page: 1,
      limit: 20
    });

    return result.data;
  }
}