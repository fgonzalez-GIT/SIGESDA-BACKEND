import { ActividadRepository } from '@/repositories/actividad.repository';
import { CreateActividadDto, UpdateActividadDto, QueryActividadesDto } from '@/dto/actividad-v2.dto';
import { logger } from '@/utils/logger';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';

/**
 * Service para manejo de lógica de negocio de Actividades V2.0
 */
export class ActividadService {
  constructor(
    private actividadRepository: ActividadRepository
  ) {}

  /**
   * Crea una nueva actividad con validaciones de negocio
   */
  async createActividad(data: CreateActividadDto) {
    // Validar que el código de actividad no exista
    const existente = await this.actividadRepository.findByCodigoActividad(data.codigoActividad);
    if (existente) {
      throw new ValidationError(`Ya existe una actividad con el código ${data.codigoActividad}`);
    }

    // Validar horarios si se proporcionan
    if (data.horarios && data.horarios.length > 0) {
      this.validateHorarios(data.horarios);
    }

    // Validar fechas
    if (data.fechaHasta) {
      const desde = new Date(data.fechaDesde);
      const hasta = new Date(data.fechaHasta);
      if (hasta < desde) {
        throw new ValidationError('La fecha hasta debe ser posterior a la fecha desde');
      }
    }

    const actividad = await this.actividadRepository.create(data);

    logger.info(`Actividad creada: ${actividad.nombre} (ID: ${actividad.id}) - Código: ${actividad.codigo_actividad}`);

    return actividad;
  }

  /**
   * Valida que no haya conflictos de horarios en la misma actividad
   */
  private validateHorarios(horarios: any[]): void {
    for (let i = 0; i < horarios.length; i++) {
      for (let j = i + 1; j < horarios.length; j++) {
        const h1 = horarios[i];
        const h2 = horarios[j];

        // Si son el mismo día, verificar superposición
        if (h1.diaSemanaId === h2.diaSemanaId) {
          const inicio1 = ActividadRepository.timeToMinutes(h1.horaInicio);
          const fin1 = ActividadRepository.timeToMinutes(h1.horaFin);
          const inicio2 = ActividadRepository.timeToMinutes(h2.horaInicio);
          const fin2 = ActividadRepository.timeToMinutes(h2.horaFin);

          // Verificar si hay superposición
          if (inicio1 < fin2 && fin1 > inicio2) {
            throw new ValidationError(
              `Conflicto de horarios en la misma actividad: ${h1.horaInicio}-${h1.horaFin} se superpone con ${h2.horaInicio}-${h2.horaFin}`
            );
          }
        }
      }
    }
  }

  /**
   * Obtiene actividades con filtros y paginación
   */
  async getActividades(query: QueryActividadesDto) {
    const result = await this.actividadRepository.findAll(query);
    const pages = Math.ceil(result.total / query.limit);

    return {
      ...result,
      pages
    };
  }

  /**
   * Obtiene una actividad por ID
   */
  async getActividadById(id: number) {
    const actividad = await this.actividadRepository.findById(id);

    if (!actividad) {
      throw new NotFoundError(`Actividad con ID ${id} no encontrada`);
    }

    return actividad;
  }

  /**
   * Obtiene una actividad por código
   */
  async getActividadByCodigo(codigo: string) {
    const actividad = await this.actividadRepository.findByCodigoActividad(codigo);

    if (!actividad) {
      throw new NotFoundError(`Actividad con código ${codigo} no encontrada`);
    }

    return actividad;
  }

  /**
   * Actualiza una actividad
   */
  async updateActividad(id: number, data: UpdateActividadDto) {
    // Verificar que existe
    const existente = await this.actividadRepository.findById(id);
    if (!existente) {
      throw new NotFoundError(`Actividad con ID ${id} no encontrada`);
    }

    // Validar código único si se está cambiando
    if (data.codigoActividad && data.codigoActividad !== existente.codigo_actividad) {
      const conMismoCodigo = await this.actividadRepository.findByCodigoActividad(data.codigoActividad);
      if (conMismoCodigo && conMismoCodigo.id !== id) {
        throw new ValidationError(`Ya existe otra actividad con el código ${data.codigoActividad}`);
      }
    }

    // Validar fechas
    if (data.fechaDesde && data.fechaHasta) {
      const desde = new Date(data.fechaDesde);
      const hasta = new Date(data.fechaHasta);
      if (hasta < desde) {
        throw new ValidationError('La fecha hasta debe ser posterior a la fecha desde');
      }
    }

    const updated = await this.actividadRepository.update(id, data);

    logger.info(`Actividad actualizada: ${updated.nombre} (ID: ${id})`);

    return updated;
  }

  /**
   * Elimina una actividad
   */
  async deleteActividad(id: number) {
    const existente = await this.actividadRepository.findById(id);
    if (!existente) {
      throw new NotFoundError(`Actividad con ID ${id} no encontrada`);
    }

    // Verificar si tiene participaciones activas
    const participantes = (existente as any).participaciones_actividades || [];
    if (participantes.length > 0) {
      throw new ValidationError(
        `No se puede eliminar la actividad ${existente.nombre} porque tiene ${participantes.length} participantes activos. Cambie su estado a INACTIVA o FINALIZADA.`
      );
    }

    await this.actividadRepository.delete(id);

    logger.info(`Actividad eliminada: ${existente.nombre} (ID: ${id})`);

    return { message: 'Actividad eliminada exitosamente' };
  }

  /**
   * Cambia el estado de una actividad
   */
  async cambiarEstado(id: number, nuevoEstadoId: number, observaciones?: string) {
    const existente = await this.actividadRepository.findById(id);
    if (!existente) {
      throw new NotFoundError(`Actividad con ID ${id} no encontrada`);
    }

    const updated = await this.actividadRepository.cambiarEstado(id, nuevoEstadoId, observaciones);

    logger.info(`Estado de actividad cambiado: ${updated.nombre} (ID: ${id}) -> Estado: ${updated.estados_actividades.nombre}`);

    return updated;
  }

  // ==================== HORARIOS ====================

  /**
   * Agrega un horario a una actividad
   */
  async agregarHorario(actividadId: number, horarioData: any) {
    const actividad = await this.actividadRepository.findById(actividadId);
    if (!actividad) {
      throw new NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
    }

    // Obtener horarios existentes y validar conflictos
    const horariosExistentes = await this.actividadRepository.getHorariosByActividad(actividadId);

    // Convertir horarios existentes al formato esperado para validación
    const horariosParaValidar = horariosExistentes.map(h => ({
      diaSemanaId: h.dia_semana_id,
      horaInicio: ActividadRepository.formatTime(h.hora_inicio),
      horaFin: ActividadRepository.formatTime(h.hora_fin)
    }));

    // Agregar el nuevo horario a la validación
    horariosParaValidar.push(horarioData);
    this.validateHorarios(horariosParaValidar);

    const horario = await this.actividadRepository.agregarHorario(actividadId, horarioData);

    logger.info(`Horario agregado a actividad ${actividad.nombre}: ${horarioData.diaSemanaId} ${horarioData.horaInicio}-${horarioData.horaFin}`);

    return horario;
  }

  /**
   * Actualiza un horario
   */
  async actualizarHorario(horarioId: number, horarioData: any) {
    const horarioActual = await this.actividadRepository.findHorarioById(horarioId);

    if (!horarioActual) {
      throw new NotFoundError(`Horario con ID ${horarioId} no encontrado`);
    }

    // Si se modifican día u horas, validar conflictos
    if (horarioData.diaSemanaId || horarioData.horaInicio || horarioData.horaFin) {
      const actividadId = horarioActual.actividad_id;

      // Obtener todos los horarios excepto el actual
      const todosLosHorarios = await this.actividadRepository.getHorariosByActividad(actividadId);
      const otrosHorarios = todosLosHorarios
        .filter(h => h.id !== horarioId)
        .map(h => ({
          diaSemanaId: h.dia_semana_id,
          horaInicio: ActividadRepository.formatTime(h.hora_inicio),
          horaFin: ActividadRepository.formatTime(h.hora_fin)
        }));

      // Crear el horario actualizado para validación
      const horarioActualizado = {
        diaSemanaId: horarioData.diaSemanaId || horarioActual.dia_semana_id,
        horaInicio: horarioData.horaInicio || ActividadRepository.formatTime(horarioActual.hora_inicio),
        horaFin: horarioData.horaFin || ActividadRepository.formatTime(horarioActual.hora_fin)
      };

      // Validar
      const todosParaValidar = [...otrosHorarios, horarioActualizado];
      this.validateHorarios(todosParaValidar);
    }

    const updated = await this.actividadRepository.updateHorario(horarioId, horarioData);

    logger.info(`Horario actualizado: ${horarioId} de actividad ${horarioActual.actividades.nombre}`);

    return updated;
  }

  /**
   * Elimina un horario
   */
  async eliminarHorario(horarioId: number) {
    const horario = await this.actividadRepository.findHorarioById(horarioId);

    if (!horario) {
      throw new NotFoundError(`Horario con ID ${horarioId} no encontrado`);
    }

    await this.actividadRepository.deleteHorario(horarioId);

    logger.info(`Horario eliminado: ${horarioId} de actividad ${horario.actividades.nombre}`);

    return { message: 'Horario eliminado exitosamente' };
  }

  /**
   * Obtiene todos los horarios de una actividad
   */
  async getHorariosByActividad(actividadId: number) {
    const actividad = await this.actividadRepository.findById(actividadId);
    if (!actividad) {
      throw new NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
    }

    return this.actividadRepository.getHorariosByActividad(actividadId);
  }

  // ==================== DOCENTES ====================

  /**
   * Asigna un docente a una actividad
   */
  async asignarDocente(actividadId: number, docenteId: number, rolDocenteId: number, observaciones?: string) {
    const actividad = await this.actividadRepository.findById(actividadId);
    if (!actividad) {
      throw new NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
    }

    // Verificar que el docente existe y es del tipo correcto
    // Esta validación se puede mejorar agregando un PersonaRepository

    const asignacion = await this.actividadRepository.asignarDocente(actividadId, docenteId, rolDocenteId, observaciones);

    logger.info(`Docente ${asignacion.personas.nombre} ${asignacion.personas.apellido} asignado a actividad ${actividad.nombre} con rol ${asignacion.roles_docentes.nombre}`);

    return asignacion;
  }

  /**
   * Desasigna un docente de una actividad
   */
  async desasignarDocente(actividadId: number, docenteId: number, rolDocenteId: number) {
    const actividad = await this.actividadRepository.findById(actividadId);
    if (!actividad) {
      throw new NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
    }

    const desasignacion = await this.actividadRepository.desasignarDocente(actividadId, docenteId, rolDocenteId);

    logger.info(`Docente ${desasignacion.personas.nombre} ${desasignacion.personas.apellido} desasignado de actividad ${actividad.nombre}`);

    return desasignacion;
  }

  /**
   * Obtiene docentes de una actividad
   */
  async getDocentesByActividad(actividadId: number) {
    const actividad = await this.actividadRepository.findById(actividadId);
    if (!actividad) {
      throw new NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
    }

    return this.actividadRepository.getDocentesByActividad(actividadId);
  }

  /**
   * Obtiene docentes disponibles
   */
  async getDocentesDisponibles() {
    return this.actividadRepository.getDocentesDisponibles();
  }

  // ==================== PARTICIPACIONES ====================

  /**
   * Obtiene participantes de una actividad
   */
  async getParticipantes(actividadId: number) {
    const actividad = await this.actividadRepository.findById(actividadId);
    if (!actividad) {
      throw new NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
    }

    return this.actividadRepository.getParticipantes(actividadId);
  }

  /**
   * Inscribe un participante en una actividad
   */
  async addParticipante(
    actividadId: number,
    personaId: number,
    fechaInicio: string,
    observaciones?: string
  ) {
    const actividad = await this.actividadRepository.findById(actividadId);
    if (!actividad) {
      throw new NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
    }

    // Check if the person is already enrolled (active or inactive)
    const existingParticipacion = await this.actividadRepository.findParticipacionByPersonaAndActividad(
      actividadId,
      personaId
    );

    if (existingParticipacion) {
      if (existingParticipacion.activo) {
        throw new ConflictError(
          `La persona con ID ${personaId} ya está inscrita activamente en la actividad ${actividad.nombre}`
        );
      } else {
        throw new ConflictError(
          `La persona con ID ${personaId} ya estuvo inscrita en la actividad ${actividad.nombre}. ` +
          `Debe reactivar la participación existente (ID: ${existingParticipacion.id}) en lugar de crear una nueva.`
        );
      }
    }

    const participacion = await this.actividadRepository.addParticipante(
      actividadId,
      personaId,
      fechaInicio,
      observaciones
    );

    logger.info(`Participante inscrito: ${personaId} en actividad ${actividad.nombre} (ID: ${actividadId})`);

    return participacion;
  }

  /**
   * Elimina un participante de una actividad
   */
  async deleteParticipante(actividadId: number, participanteId: number) {
    const actividad = await this.actividadRepository.findById(actividadId);
    if (!actividad) {
      throw new NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
    }

    const participacion = await this.actividadRepository.deleteParticipante(
      actividadId,
      participanteId
    );

    logger.info(`Participante eliminado: ID ${participanteId} de actividad ${actividad.nombre} (ID: ${actividadId})`);

    return participacion;
  }

  // ==================== ESTADÍSTICAS ====================

  /**
   * Obtiene estadísticas de una actividad
   */
  async getEstadisticas(actividadId: number) {
    const estadisticas = await this.actividadRepository.getEstadisticas(actividadId);

    if (!estadisticas) {
      throw new NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
    }

    return estadisticas;
  }

  // ==================== CATÁLOGOS ====================

  /**
   * Obtiene todos los catálogos necesarios para crear/editar actividades
   */
  async getCatalogos() {
    const [tipos, categorias, estados, diasSemana, roles] = await Promise.all([
      this.actividadRepository.getTiposActividades(),
      this.actividadRepository.getCategoriasActividades(),
      this.actividadRepository.getEstadosActividades(),
      this.actividadRepository.getDiasSemana(),
      this.actividadRepository.getRolesDocentes()
    ]);

    return {
      tipos: tipos,
      categorias: categorias,
      estados: estados,
      diasSemana: diasSemana,
      rolesDocentes: roles
    };
  }

  /**
   * Obtiene tipos de actividades
   */
  async getTiposActividades() {
    return this.actividadRepository.getTiposActividades();
  }

  /**
   * Obtiene categorías de actividades
   */
  async getCategoriasActividades() {
    return this.actividadRepository.getCategoriasActividades();
  }

  /**
   * Obtiene estados de actividades
   */
  async getEstadosActividades() {
    return this.actividadRepository.getEstadosActividades();
  }

  /**
   * Obtiene días de la semana
   */
  async getDiasSemana() {
    return this.actividadRepository.getDiasSemana();
  }

  /**
   * Obtiene roles de docentes
   */
  async getRolesDocentes() {
    return this.actividadRepository.getRolesDocentes();
  }

  // ==================== CONSULTAS ESPECIALES ====================

  /**
   * Duplica una actividad existente
   */
  async duplicarActividad(
    idOriginal: number,
    nuevoCodigoActividad: string,
    nuevoNombre: string,
    nuevaFechaDesde: string | Date,
    nuevaFechaHasta?: string | Date | null,
    copiarHorarios: boolean = true,
    copiarDocentes: boolean = false
  ) {
    // Obtener actividad original
    const original = await this.actividadRepository.findById(idOriginal);
    if (!original) {
      throw new NotFoundError(`Actividad con ID ${idOriginal} no encontrada`);
    }

    // Verificar que el nuevo código no exista
    const existeNuevoCodigo = await this.actividadRepository.findByCodigoActividad(nuevoCodigoActividad);
    if (existeNuevoCodigo) {
      throw new ValidationError(`Ya existe una actividad con el código ${nuevoCodigoActividad}`);
    }

    // Preparar datos para la nueva actividad
    const datosNuevaActividad: CreateActividadDto = {
      codigoActividad: nuevoCodigoActividad,
      nombre: nuevoNombre,
      tipoActividadId: original.tipo_actividad_id,
      categoriaId: original.categoria_id,
      estadoId: original.estado_id,
      descripcion: original.descripcion,
      fechaDesde: nuevaFechaDesde,
      fechaHasta: nuevaFechaHasta,
      cupoMaximo: original.cupo_maximo,
      costo: original.costo,
      observaciones: `Duplicado de: ${original.nombre} (ID: ${original.id})`,
      horarios: copiarHorarios ? (original as any).horarios_actividades?.map((h: any) => ({
        diaSemanaId: h.dia_semana_id,
        horaInicio: ActividadRepository.formatTime(h.hora_inicio),
        horaFin: ActividadRepository.formatTime(h.hora_fin),
        activo: h.activo
      })) : [],
      docentes: copiarDocentes ? (original as any).docentes_actividades?.map((d: any) => ({
        docenteId: d.docente_id,
        rolDocenteId: d.rol_docente_id,
        observaciones: d.observaciones
      })) : []
    };

    const nuevaActividad = await this.actividadRepository.create(datosNuevaActividad);

    logger.info(`Actividad duplicada: ${original.nombre} (ID: ${idOriginal}) -> ${nuevaActividad.nombre} (ID: ${nuevaActividad.id})`);

    return nuevaActividad;
  }

  /**
   * Obtiene un resumen de actividades agrupadas por tipo
   */
  async getResumenPorTipo() {
    const tipos = await this.actividadRepository.getTiposActividades();

    const resumen = await Promise.all(
      tipos.map(async (tipo) => {
        const actividades = await this.actividadRepository.findAll({
          tipoActividadId: tipo.id,
          incluirRelaciones: false,
          page: 1,
          limit: 1000
        });

        return {
          tipo: {
            id: tipo.id,
            codigo: tipo.codigo,
            nombre: tipo.nombre
          },
          totalActividades: actividades.total,
          actividades: actividades.data.map(a => ({
            id: a.id,
            codigo: a.codigo_actividad,
            nombre: a.nombre,
            cupoMaximo: a.cupo_maximo,
            costo: a.costo
          }))
        };
      })
    );

    return resumen;
  }

  /**
   * Obtiene horario semanal completo
   */
  async getHorarioSemanal() {
    const diasSemana = await this.actividadRepository.getDiasSemana();

    const horarioSemanal = await Promise.all(
      diasSemana.map(async (dia) => {
        const actividades = await this.actividadRepository.findAll({
          diaSemanaId: dia.id,
          incluirRelaciones: true,
          page: 1,
          limit: 100
        });

        return {
          dia: {
            id: dia.id,
            codigo: dia.codigo,
            nombre: dia.nombre,
            orden: dia.orden
          },
          actividades: actividades.data.map(act => ({
            id: act.id,
            codigo: act.codigo_actividad,
            nombre: act.nombre,
            tipo: (act as any).tipos_actividades?.nombre,
            horarios: (act as any).horarios_actividades?.map((h: any) => ({
              horaInicio: ActividadRepository.formatTime(h.hora_inicio),
              horaFin: ActividadRepository.formatTime(h.hora_fin),
              aula: h.reservas_aulas_actividades?.[0]?.aulas?.nombre
            })),
            docentes: (act as any).docentes_actividades?.map((d: any) => ({
              nombre: `${d.personas.nombre} ${d.personas.apellido}`,
              rol: d.roles_docentes.nombre
            }))
          }))
        };
      })
    );

    return {
      horarioSemanal,
      generadoEn: new Date()
    };
  }
}
