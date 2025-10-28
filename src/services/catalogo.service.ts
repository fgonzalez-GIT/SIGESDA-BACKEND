import { TipoPersonaCatalogo, EspecialidadDocente } from '@prisma/client';
import { CatalogoRepository } from '@/repositories/catalogo.repository';
import {
  CreateTipoPersonaDto,
  UpdateTipoPersonaDto,
  CreateEspecialidadDto,
  UpdateEspecialidadDto,
  TIPOS_SISTEMA_PROTEGIDOS,
  ESPECIALIDADES_SISTEMA_PROTEGIDAS
} from '@/dto/catalogo.dto';
import { logger } from '@/utils/logger';
import { AppError } from '@/middleware/error.middleware';
import { HttpStatus } from '@/types/enums';

/**
 * Service para gestión administrativa de catálogos
 * Implementa lógica de negocio y validaciones para tipos y especialidades
 */
export class CatalogoService {
  constructor(private catalogoRepository: CatalogoRepository) {}

  // ======================================================================
  // GESTIÓN DE TIPOS DE PERSONA
  // ======================================================================

  /**
   * Crear un nuevo tipo de persona
   */
  async createTipoPersona(data: CreateTipoPersonaDto): Promise<TipoPersonaCatalogo> {
    // Validar que el código no exista
    const existingCodigo = await this.catalogoRepository.getTipoPersonaByCodigo(data.codigo);
    if (existingCodigo) {
      throw new AppError(
        `Ya existe un tipo de persona con código '${data.codigo}'`,
        HttpStatus.CONFLICT
      );
    }

    // Validar que el código no sea uno de los protegidos del sistema
    if (TIPOS_SISTEMA_PROTEGIDOS.includes(data.codigo as any)) {
      throw new AppError(
        `El código '${data.codigo}' está reservado para tipos del sistema`,
        HttpStatus.BAD_REQUEST
      );
    }

    const tipo = await this.catalogoRepository.createTipoPersona(data);

    logger.info(`Tipo de persona creado: ${tipo.codigo} - ${tipo.nombre} (ID: ${tipo.id})`);

    return tipo;
  }

  /**
   * Actualizar un tipo de persona existente
   */
  async updateTipoPersona(id: number, data: UpdateTipoPersonaDto): Promise<TipoPersonaCatalogo> {
    // Verificar que existe
    const existing = await this.catalogoRepository.getTipoPersonaById(id);
    if (!existing) {
      throw new AppError(
        `Tipo de persona con ID ${id} no encontrado`,
        HttpStatus.NOT_FOUND
      );
    }

    // Si se intenta desactivar, verificar que no haya personas con este tipo activo
    if (data.activo === false) {
      const count = await this.catalogoRepository.countPersonasConTipo(id, true);
      if (count > 0) {
        throw new AppError(
          `No se puede desactivar el tipo. Hay ${count} persona(s) con este tipo asignado activamente`,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const updated = await this.catalogoRepository.updateTipoPersona(id, data);

    logger.info(`Tipo de persona actualizado: ${updated.codigo} - ${updated.nombre} (ID: ${id})`);

    return updated;
  }

  /**
   * Eliminar un tipo de persona
   */
  async deleteTipoPersona(id: number): Promise<TipoPersonaCatalogo> {
    // Verificar que existe
    const tipo = await this.catalogoRepository.getTipoPersonaById(id);
    if (!tipo) {
      throw new AppError(
        `Tipo de persona con ID ${id} no encontrado`,
        HttpStatus.NOT_FOUND
      );
    }

    // Verificar que no sea un tipo del sistema
    if (TIPOS_SISTEMA_PROTEGIDOS.includes(tipo.codigo as any)) {
      throw new AppError(
        `No se puede eliminar el tipo '${tipo.codigo}' porque es un tipo del sistema`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Verificar que no haya personas con este tipo (ni activas ni inactivas)
    const count = await this.catalogoRepository.countPersonasConTipo(id, false);
    if (count > 0) {
      throw new AppError(
        `No se puede eliminar el tipo. Hay ${count} persona(s) con este tipo asignado. ` +
        `Considere desactivarlo en lugar de eliminarlo.`,
        HttpStatus.BAD_REQUEST
      );
    }

    const deleted = await this.catalogoRepository.deleteTipoPersona(id);

    logger.info(`Tipo de persona eliminado: ${deleted.codigo} - ${deleted.nombre} (ID: ${id})`);

    return deleted;
  }

  /**
   * Activar/Desactivar un tipo de persona
   */
  async toggleActivoTipoPersona(id: number, activo: boolean): Promise<TipoPersonaCatalogo> {
    // Verificar que existe
    const tipo = await this.catalogoRepository.getTipoPersonaById(id);
    if (!tipo) {
      throw new AppError(
        `Tipo de persona con ID ${id} no encontrado`,
        HttpStatus.NOT_FOUND
      );
    }

    // Si ya está en el estado solicitado, no hacer nada
    if (tipo.activo === activo) {
      return tipo;
    }

    // Si se intenta desactivar, verificar que no haya personas activas
    if (!activo) {
      const count = await this.catalogoRepository.countPersonasConTipo(id, true);
      if (count > 0) {
        throw new AppError(
          `No se puede desactivar el tipo. Hay ${count} persona(s) con este tipo asignado activamente`,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const updated = await this.catalogoRepository.toggleActivoTipoPersona(id, activo);

    logger.info(`Tipo de persona ${activo ? 'activado' : 'desactivado'}: ${updated.codigo} (ID: ${id})`);

    return updated;
  }

  /**
   * Obtener todos los tipos con estadísticas de uso
   */
  async getAllTiposPersonaWithStats() {
    return this.catalogoRepository.getAllTiposPersonaWithStats();
  }

  /**
   * Obtener tipo de persona por ID
   */
  async getTipoPersonaById(id: number): Promise<TipoPersonaCatalogo> {
    const tipo = await this.catalogoRepository.getTipoPersonaById(id);
    if (!tipo) {
      throw new AppError(
        `Tipo de persona con ID ${id} no encontrado`,
        HttpStatus.NOT_FOUND
      );
    }
    return tipo;
  }

  // ======================================================================
  // GESTIÓN DE ESPECIALIDADES DOCENTES
  // ======================================================================

  /**
   * Crear una nueva especialidad docente
   */
  async createEspecialidad(data: CreateEspecialidadDto): Promise<EspecialidadDocente> {
    // Validar que el código no exista
    const existingCodigo = await this.catalogoRepository.getEspecialidadByCodigo(data.codigo);
    if (existingCodigo) {
      throw new AppError(
        `Ya existe una especialidad con código '${data.codigo}'`,
        HttpStatus.CONFLICT
      );
    }

    // Validar que el código no sea uno de los protegidos del sistema
    if (ESPECIALIDADES_SISTEMA_PROTEGIDAS.includes(data.codigo as any)) {
      throw new AppError(
        `El código '${data.codigo}' está reservado para especialidades del sistema`,
        HttpStatus.BAD_REQUEST
      );
    }

    const especialidad = await this.catalogoRepository.createEspecialidad(data);

    logger.info(`Especialidad docente creada: ${especialidad.codigo} - ${especialidad.nombre} (ID: ${especialidad.id})`);

    return especialidad;
  }

  /**
   * Actualizar una especialidad existente
   */
  async updateEspecialidad(id: number, data: UpdateEspecialidadDto): Promise<EspecialidadDocente> {
    // Verificar que existe
    const existing = await this.catalogoRepository.getEspecialidadById(id);
    if (!existing) {
      throw new AppError(
        `Especialidad con ID ${id} no encontrada`,
        HttpStatus.NOT_FOUND
      );
    }

    // Si se intenta desactivar, verificar que no haya docentes con esta especialidad
    if (data.activo === false) {
      const count = await this.catalogoRepository.countDocentesConEspecialidad(id, true);
      if (count > 0) {
        throw new AppError(
          `No se puede desactivar la especialidad. Hay ${count} docente(s) con esta especialidad asignada`,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const updated = await this.catalogoRepository.updateEspecialidad(id, data);

    logger.info(`Especialidad actualizada: ${updated.codigo} - ${updated.nombre} (ID: ${id})`);

    return updated;
  }

  /**
   * Eliminar una especialidad
   */
  async deleteEspecialidad(id: number): Promise<EspecialidadDocente> {
    // Verificar que existe
    const especialidad = await this.catalogoRepository.getEspecialidadById(id);
    if (!especialidad) {
      throw new AppError(
        `Especialidad con ID ${id} no encontrada`,
        HttpStatus.NOT_FOUND
      );
    }

    // Verificar que no sea una especialidad del sistema
    if (ESPECIALIDADES_SISTEMA_PROTEGIDAS.includes(especialidad.codigo as any)) {
      throw new AppError(
        `No se puede eliminar la especialidad '${especialidad.codigo}' porque es una especialidad del sistema`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Verificar que no haya docentes con esta especialidad
    const count = await this.catalogoRepository.countDocentesConEspecialidad(id, false);
    if (count > 0) {
      throw new AppError(
        `No se puede eliminar la especialidad. Hay ${count} docente(s) con esta especialidad asignada. ` +
        `Considere desactivarla en lugar de eliminarla.`,
        HttpStatus.BAD_REQUEST
      );
    }

    const deleted = await this.catalogoRepository.deleteEspecialidad(id);

    logger.info(`Especialidad eliminada: ${deleted.codigo} - ${deleted.nombre} (ID: ${id})`);

    return deleted;
  }

  /**
   * Activar/Desactivar una especialidad
   */
  async toggleActivoEspecialidad(id: number, activo: boolean): Promise<EspecialidadDocente> {
    // Verificar que existe
    const especialidad = await this.catalogoRepository.getEspecialidadById(id);
    if (!especialidad) {
      throw new AppError(
        `Especialidad con ID ${id} no encontrada`,
        HttpStatus.NOT_FOUND
      );
    }

    // Si ya está en el estado solicitado, no hacer nada
    if (especialidad.activo === activo) {
      return especialidad;
    }

    // Si se intenta desactivar, verificar que no haya docentes activos
    if (!activo) {
      const count = await this.catalogoRepository.countDocentesConEspecialidad(id, true);
      if (count > 0) {
        throw new AppError(
          `No se puede desactivar la especialidad. Hay ${count} docente(s) con esta especialidad asignada activamente`,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const updated = await this.catalogoRepository.toggleActivoEspecialidad(id, activo);

    logger.info(`Especialidad ${activo ? 'activada' : 'desactivada'}: ${updated.codigo} (ID: ${id})`);

    return updated;
  }

  /**
   * Obtener todas las especialidades con estadísticas de uso
   */
  async getAllEspecialidadesWithStats() {
    return this.catalogoRepository.getAllEspecialidadesWithStats();
  }

  /**
   * Obtener especialidad por ID
   */
  async getEspecialidadById(id: number): Promise<EspecialidadDocente> {
    const especialidad = await this.catalogoRepository.getEspecialidadById(id);
    if (!especialidad) {
      throw new AppError(
        `Especialidad con ID ${id} no encontrada`,
        HttpStatus.NOT_FOUND
      );
    }
    return especialidad;
  }
}
