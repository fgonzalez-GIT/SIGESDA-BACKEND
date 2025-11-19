import { Aula } from '@prisma/client';
import { AulaRepository } from '@/repositories/aula.repository';
import { CreateAulaDto, UpdateAulaDto, AulaQueryDto, DisponibilidadAulaDto } from '@/dto/aula.dto';
import { logger } from '@/utils/logger';
import { ConflictError, NotFoundError, ValidationError } from '@/utils/errors';

export class AulaService {
  constructor(private aulaRepository: AulaRepository) {}

  async createAula(data: CreateAulaDto): Promise<Aula> {
    // Validar que el nombre sea único
    const existingAula = await this.aulaRepository.findByNombre(data.nombre);
    if (existingAula) {
      throw new ConflictError(`Ya existe un aula con el nombre ${data.nombre}`);
    }

    // Validación de capacidad mínima
    if (data.capacidad < 1) {
      throw new ValidationError('La capacidad debe ser al menos 1 persona');
    }

    const aula = await this.aulaRepository.create(data);

    logger.info(`Aula creada: ${aula.nombre} (Capacidad: ${aula.capacidad}) - ID: ${aula.id}`);

    return aula;
  }

  async getAulas(query: AulaQueryDto): Promise<{ data: Aula[]; total: number; pages: number }> {
    const result = await this.aulaRepository.findAll(query);
    const pages = Math.ceil(result.total / query.limit);

    return {
      ...result,
      pages
    };
  }

  async getAulaById(id: string): Promise<Aula | null> {
    return this.aulaRepository.findById(id);
  }

  async updateAula(id: string, data: UpdateAulaDto): Promise<Aula> {
    // Verificar que el aula existe
    const existingAula = await this.aulaRepository.findById(id);
    if (!existingAula) {
      throw new NotFoundError(`Aula con ID ${id} no encontrada`);
    }

    // Validar nombre único si se está actualizando
    if (data.nombre && data.nombre !== existingAula.nombre) {
      const aulaWithSameName = await this.aulaRepository.findByNombre(data.nombre);
      if (aulaWithSameName) {
        throw new ConflictError(`Ya existe un aula con el nombre ${data.nombre}`);
      }
    }

    // Validación de capacidad si se está actualizando
    if (data.capacidad !== undefined && data.capacidad < 1) {
      throw new ValidationError('La capacidad debe ser al menos 1 persona');
    }

    const updatedAula = await this.aulaRepository.update(id, data);

    logger.info(`Aula actualizada: ${updatedAula.nombre} (ID: ${id})`);

    return updatedAula;
  }

  async deleteAula(id: string, hard = false): Promise<Aula> {
    const existingAula = await this.aulaRepository.findById(id);
    if (!existingAula) {
      throw new NotFoundError(`Aula con ID ${id} no encontrada`);
    }

    // Verificar si tiene reservas activas
    const reservas = (existingAula as any).reserva_aulas || [];
    const ahora = new Date();
    const reservasActivas = reservas.filter((reserva: any) => {
      // Una reserva está activa si la fecha de fin es futura
      return new Date(reserva.fechaFin) > ahora;
    });

    if (reservasActivas.length > 0) {
      if (hard) {
        throw new ValidationError('No se puede eliminar permanentemente un aula con reservas activas. Use eliminación lógica.');
      }

      // Soft delete si tiene reservas activas
      const deletedAula = await this.aulaRepository.softDelete(id);
      logger.info(`Aula dada de baja: ${deletedAula.nombre} (ID: ${id}) - Tenía ${reservasActivas.length} reservas activas`);
      return deletedAula;
    }

    let deletedAula: Aula;

    if (hard) {
      deletedAula = await this.aulaRepository.delete(id);
      logger.info(`Aula eliminada permanentemente: ${deletedAula.nombre} (ID: ${id})`);
    } else {
      deletedAula = await this.aulaRepository.softDelete(id);
      logger.info(`Aula dada de baja: ${deletedAula.nombre} (ID: ${id})`);
    }

    return deletedAula;
  }

  async getAulasDisponibles(): Promise<Aula[]> {
    return this.aulaRepository.getDisponibles();
  }

  async verificarDisponibilidad(aulaId: string, data: DisponibilidadAulaDto): Promise<{ disponible: boolean; conflictos?: any[] }> {
    const aula = await this.aulaRepository.findById(aulaId);
    if (!aula) {
      throw new NotFoundError(`Aula con ID ${aulaId} no encontrada`);
    }

    if (!aula.activa) {
      return {
        disponible: false,
        conflictos: [{ mensaje: 'El aula no está activa' }]
      };
    }

    const fechaInicio = new Date(data.fechaInicio);
    const fechaFin = new Date(data.fechaFin);

    // Verificar que las fechas sean futuras
    const ahora = new Date();
    if (fechaInicio <= ahora) {
      throw new ValidationError('La fecha de inicio debe ser futura');
    }

    const disponible = await this.aulaRepository.verificarDisponibilidad(
      aulaId,
      fechaInicio,
      fechaFin,
      data.excluirReservaId
    );

    if (!disponible) {
      const conflictos = await this.aulaRepository.getReservasEnPeriodo(
        aulaId,
        fechaInicio,
        fechaFin
      );

      return {
        disponible: false,
        conflictos: conflictos.map(reserva => ({
          id: reserva.id,
          fechaInicio: reserva.fecha_vigencia_desde,
          fechaFin: reserva.fecha_vigencia_hasta,
          actividad: reserva.horarios_actividades?.actividades?.nombre || 'Sin actividad',
          dia: reserva.horarios_actividades?.dias_semana?.nombre || 'N/A',
          horario: `${reserva.horarios_actividades?.hora_inicio || ''} - ${reserva.horarios_actividades?.hora_fin || ''}`
        }))
      };
    }

    return { disponible: true };
  }

  async getEstadisticas(aulaId: string): Promise<any> {
    const aula = await this.aulaRepository.findById(aulaId);
    if (!aula) {
      throw new NotFoundError(`Aula con ID ${aulaId} no encontrada`);
    }

    return this.aulaRepository.getEstadisticas(aulaId);
  }

  async getAulasConMenorUso(): Promise<any[]> {
    return this.aulaRepository.getAulasConMenorUso();
  }

  async searchAulas(searchTerm: string): Promise<Aula[]> {
    const result = await this.aulaRepository.findAll({
      search: searchTerm,
      page: 1,
      limit: 20
    });

    return result.data;
  }

  async getAulasPorCapacidad(capacidadMinima: number): Promise<Aula[]> {
    const result = await this.aulaRepository.findAll({
      capacidadMinima,
      activa: true,
      page: 1,
      limit: 100
    });

    return result.data;
  }

  async getAulasConEquipamiento(): Promise<Aula[]> {
    const result = await this.aulaRepository.findAll({
      conEquipamiento: true,
      activa: true,
      page: 1,
      limit: 100
    });

    return result.data;
  }

  async getReservasDelAula(aulaId: string, fechaDesde?: string, fechaHasta?: string): Promise<any[]> {
    const aula = await this.aulaRepository.findById(aulaId);
    if (!aula) {
      throw new NotFoundError(`Aula con ID ${aulaId} no encontrada`);
    }

    if (fechaDesde && fechaHasta) {
      return this.aulaRepository.getReservasEnPeriodo(
        aulaId,
        new Date(fechaDesde),
        new Date(fechaHasta)
      );
    }

    // Si no se especifican fechas, retornar reservas futuras
    const ahora = new Date();
    const enUnMes = new Date();
    enUnMes.setMonth(enUnMes.getMonth() + 1);

    return this.aulaRepository.getReservasEnPeriodo(aulaId, ahora, enUnMes);
  }
}