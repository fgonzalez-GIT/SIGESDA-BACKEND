import { ActividadRepository } from '@/repositories/actividad.repository';
import { CreateActividadDto, UpdateActividadDto, QueryActividadesDto } from '@/dto/actividad-v2.dto';
import { logger } from '@/utils/logger';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';
import { PrismaClient } from '@prisma/client';
import { normalizeTimeToString } from '@/utils/time.utils';

/**
 * Service para manejo de lógica de negocio de Actividades V2.0
 */
export class ActividadService {
  private prisma: PrismaClient;

  constructor(
    private actividadRepository: ActividadRepository,
    prisma?: PrismaClient
  ) {
    this.prisma = prisma || new PrismaClient();
  }

  /**
   * Genera código de actividad automáticamente
   * Formato: PRIMERA_PALABRA_TIPO-ABREVIATURA_NOMBRE
   * Ejemplo: "Coro" + "Coro Adultos 2025" → "CORO-CORADU25"
   */
  private async generateCodigoActividad(tipoActividadId: number, nombre: string): Promise<string> {
    // Obtener el tipo de actividad
    const tipoActividad = await this.prisma.tipos_actividades.findUnique({
      where: { id: tipoActividadId }
    });

    if (!tipoActividad) {
      throw new ValidationError(`Tipo de actividad con ID ${tipoActividadId} no encontrado`);
    }

    // Primera palabra del tipo (ej: "Coro" → "CORO")
    const primeraPalabraTipo = tipoActividad.nombre.split(' ')[0].toUpperCase();

    // Abreviatura del nombre (primeras 3 letras de cada palabra + números)
    const palabrasNombre = nombre.split(' ');
    let abreviatura = palabrasNombre
      .map(palabra => {
        // Si es un número, mantenerlo completo pero solo últimos 2 dígitos si es año
        if (/^\d+$/.test(palabra)) {
          return palabra.length === 4 ? palabra.slice(-2) : palabra;
        }
        // Tomar primeras 3 letras
        return palabra.slice(0, 3).toUpperCase();
      })
      .join('');

    // Código base
    let codigoBase = `${primeraPalabraTipo}-${abreviatura}`;

    // Verificar unicidad y agregar sufijo si es necesario
    let codigo = codigoBase;
    let contador = 1;

    while (await this.actividadRepository.findByCodigoActividad(codigo)) {
      codigo = `${codigoBase}-${contador}`;
      contador++;
    }

    return codigo;
  }

  /**
   * Crea una nueva actividad con validaciones de negocio
   */
  async createActividad(data: CreateActividadDto) {
    // Auto-generar código si no se proporciona
    let codigoActividad = data.codigoActividad;
    if (!codigoActividad) {
      codigoActividad = await this.generateCodigoActividad(data.tipoActividadId, data.nombre);
      data = { ...data, codigoActividad };
    } else {
      // Validar que el código proporcionado no exista
      const existente = await this.actividadRepository.findByCodigoActividad(codigoActividad);
      if (existente) {
        throw new ValidationError(`Ya existe una actividad con el código ${codigoActividad}`);
      }
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

    logger.info(`Actividad creada: ${actividad.nombre} (ID: ${actividad.id})`);

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

    // Validar fechas
    if (data.fechaDesde && data.fechaHasta) {
      const desde = new Date(data.fechaDesde);
      const hasta = new Date(data.fechaHasta);
      if (hasta < desde) {
        throw new ValidationError('La fecha hasta debe ser posterior a la fecha desde');
      }
    }

    // Extraer horarios del payload (si existen)
    const { horarios, ...actividadData } = data as any;

    // Actualizar datos base de la actividad
    const updated = await this.actividadRepository.update(id, actividadData);

    // Si se proporcionaron horarios, reemplazarlos completamente
    if (horarios && Array.isArray(horarios)) {
      // 1. Eliminar todos los horarios existentes
      await this.actividadRepository.deleteHorariosByActividad(id);

      // 2. Agregar los nuevos horarios
      if (horarios.length > 0) {
        for (const horario of horarios) {
          await this.actividadRepository.agregarHorario(id, horario);
        }
      }
    }

    // Retornar actividad actualizada con horarios
    const actividadCompleta = await this.actividadRepository.findById(id);

    logger.info(`Actividad actualizada: ${updated.nombre} (ID: ${id})${horarios ? ` - horarios reemplazados (${horarios.length})` : ''}`);

    return actividadCompleta;
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

    logger.info(`Estado de actividad cambiado: ${updated.nombre} (ID: ${id})`);

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
      diaSemanaId: h.diaSemanaId,
      horaInicio: normalizeTimeToString(h.horaInicio),
      horaFin: normalizeTimeToString(h.horaFin)
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
      const actividadId = horarioActual.actividadId;

      // Obtener todos los horarios excepto el actual
      const todosLosHorarios = await this.actividadRepository.getHorariosByActividad(actividadId);
      const otrosHorarios = todosLosHorarios
        .filter(h => h.id !== horarioId)
        .map(h => ({
          diaSemanaId: h.diaSemanaId,
          horaInicio: normalizeTimeToString(h.horaInicio),
          horaFin: normalizeTimeToString(h.horaFin)
        }));

      // Crear el horario actualizado para validación
      const horarioActualizado = {
        diaSemanaId: horarioData.diaSemanaId || horarioActual.diaSemanaId,
        horaInicio: horarioData.horaInicio || normalizeTimeToString(horarioActual.horaInicio),
        horaFin: horarioData.horaFin || normalizeTimeToString(horarioActual.horaFin)
      };

      // Validar
      const todosParaValidar = [...otrosHorarios, horarioActualizado];
      this.validateHorarios(todosParaValidar);
    }

    const updated = await this.actividadRepository.updateHorario(horarioId, horarioData);

    const actividadNombre = (horarioActual as any).actividades?.nombre || 'Actividad';
    logger.info(`Horario actualizado: ${horarioId} de actividad ${actividadNombre}`);

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

    const actividadNombre = (horario as any).actividades?.nombre || 'Actividad';
    logger.info(`Horario eliminado: ${horarioId} de actividad ${actividadNombre}`);

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
   * ACTUALIZADO: Valida tipo DOCENTE activo en persona_tipo
   */
  async asignarDocente(actividadId: number, docenteId: number, rolDocenteId: number, observaciones?: string) {
    const actividad = await this.actividadRepository.findById(actividadId);
    if (!actividad) {
      throw new NotFoundError(`Actividad con ID ${actividadId} no encontrada`);
    }

    // Validar que el docente existe y tiene tipo DOCENTE activo
    const docente = await this.actividadRepository.validarDocente(docenteId);

    if (!docente) {
      throw new NotFoundError(`Persona con ID ${docenteId} no encontrada`);
    }

    if (!docente.esDocenteActivo) {
      throw new ValidationError(
        `La persona ${docente.nombre} ${docente.apellido} (ID: ${docenteId}) no tiene el tipo DOCENTE activo. ` +
        `Solo se pueden asignar personas con tipo DOCENTE activo a actividades.`
      );
    }

    // Verificar si ya existe la asignación
    const asignacionExistente = await this.actividadRepository.findAsignacionDocente(actividadId, docenteId, rolDocenteId);
    if (asignacionExistente) {
      const rolNombre = (asignacionExistente as any).rolesDocentes?.nombre || `ID ${rolDocenteId}`;
      throw new ConflictError(
        `El docente ${docente.nombre} ${docente.apellido} ya está asignado a la actividad "${actividad.nombre}" con el rol "${rolNombre}"`
      );
    }

    const asignacion = await this.actividadRepository.asignarDocente(actividadId, docenteId, rolDocenteId, observaciones);

    const docenteNombre = (asignacion as any).personas?.nombre || 'Docente';
    const docenteApellido = (asignacion as any).personas?.apellido || '';
    const rolNombre = (asignacion as any).roles_docentes?.nombre || 'Rol';
    logger.info(`Docente ${docenteNombre} ${docenteApellido} asignado a actividad ${actividad.nombre} con rol ${rolNombre}`);

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

    const docenteNombre = (desasignacion as any).personas?.nombre || 'Docente';
    const docenteApellido = (desasignacion as any).personas?.apellido || '';
    logger.info(`Docente ${docenteNombre} ${docenteApellido} desasignado de actividad ${actividad.nombre}`);

    return desasignacion;
  }

  /**
   * Desasigna un docente usando el ID de la asignación
   */
  async desasignarDocenteById(asignacionId: number) {
    const desasignacion = await this.actividadRepository.desasignarDocenteById(asignacionId);

    const docenteNombre = (desasignacion as any).personas?.nombre || 'Docente';
    const docenteApellido = (desasignacion as any).personas?.apellido || '';
    logger.info(`Docente ${docenteNombre} ${docenteApellido} desasignado (asignación ID: ${asignacionId})`);

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
      tipoActividadId: 1, // TODO: Mapear desde original.tipo
      categoriaId: 1, // TODO: Determinar categoría
      estadoId: 1, // TODO: Determinar estado
      descripcion: original.descripcion,
      fechaDesde: nuevaFechaDesde,
      fechaHasta: nuevaFechaHasta,
      cupoMaximo: original.capacidadMaxima || undefined,
      costo: Number(original.precio) || 0,
      observaciones: `Duplicado de: ${original.nombre} (ID: ${original.id})`,
      reservasAulas: [], // Campo requerido
      horarios: copiarHorarios ? (original as any).horarios_actividades?.map((h: any) => ({
        diaSemanaId: h.dia_semana_id || h.diaSemana,
        horaInicio: typeof h.hora_inicio === 'string' ? h.hora_inicio : h.horaInicio,
        horaFin: typeof h.hora_fin === 'string' ? h.hora_fin : h.horaFin,
        activo: h.activo
      })) : [],
      docentes: copiarDocentes ? (original as any).docentes_actividades?.map((d: any) => ({
        docenteId: d.docente_id || d.docenteId,
        rolDocenteId: d.rol_docente_id || d.rolDocenteId,
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
          limit: 1000,
          orderBy: 'nombre',
          orderDir: 'asc'
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
            codigo: (a as any).codigo_actividad || a.nombre,
            nombre: a.nombre,
            cupoMaximo: a.capacidadMaxima,
            costo: Number(a.precio) || 0
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
          limit: 100,
          orderBy: 'nombre',
          orderDir: 'asc'
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
            codigo: (act as any).codigo_actividad || act.nombre,
            nombre: act.nombre,
            tipo: (act as any).tipos_actividades?.nombre || act.tipo,
            horarios: (act as any).horarios_actividades?.map((h: any) => ({
              horaInicio: typeof h.hora_inicio === 'string' ? h.hora_inicio : h.horaInicio,
              horaFin: ActividadRepository.formatTime(h.hora_fin)
              // Campo 'aula' eliminado - la relación reservas_aulas_actividades no existe en horarios_actividades
              // Si necesitas el aula, usa (act as any).actividades_aulas en su lugar
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
