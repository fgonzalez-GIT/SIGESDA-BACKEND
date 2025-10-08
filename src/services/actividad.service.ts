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

    // Validar horarios
    if (data.horarios && data.horarios.length > 0) {
      this.validateHorarios(data.horarios);
    }

    // Validar precio según tipo de actividad
    if (data.tipo === TipoActividad.CORO && data.precio > 0) {
      logger.warn(`Creando coro con precio ${data.precio}. Los coros suelen ser gratuitos.`);
    }

    const actividad = await this.actividadRepository.create(data);

    logger.info(`Actividad creada: ${actividad.nombre} (${actividad.tipo}) - ID: ${actividad.id}`);

    return actividad;
  }

  private validateHorarios(horarios: any[]): void {
    // Verificar que no haya conflictos de horarios (mismo día, horarios superpuestos)
    for (let i = 0; i < horarios.length; i++) {
      for (let j = i + 1; j < horarios.length; j++) {
        const h1 = horarios[i];
        const h2 = horarios[j];

        // Si son el mismo día, verificar superposición
        if (h1.diaSemana === h2.diaSemana) {
          const inicio1 = this.timeToMinutes(h1.horaInicio);
          const fin1 = this.timeToMinutes(h1.horaFin);
          const inicio2 = this.timeToMinutes(h2.horaInicio);
          const fin2 = this.timeToMinutes(h2.horaFin);

          // Verificar si hay superposición
          if ((inicio1 < fin2 && fin1 > inicio2) || (inicio2 < fin1 && fin2 > inicio1)) {
            throw new Error(
              `Conflicto de horarios para ${h1.diaSemana}: ${h1.horaInicio}-${h1.horaFin} se superpone con ${h2.horaInicio}-${h2.horaFin}`
            );
          }
        }
      }
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
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

    // Validar horarios si se están actualizando
    if (data.horarios !== undefined && data.horarios.length > 0) {
      this.validateHorarios(data.horarios);
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

  // Métodos para gestión individual de horarios

  async agregarHorario(actividadId: string, horarioData: any): Promise<any> {
    // Verificar que la actividad existe
    const actividad = await this.actividadRepository.findById(actividadId);
    if (!actividad) {
      throw new Error(`Actividad con ID ${actividadId} no encontrada`);
    }

    // Obtener horarios existentes
    const horariosExistentes = await this.actividadRepository.getHorariosByActividad(actividadId);

    // Validar que no hay conflicto con horarios existentes
    const todosHorarios = [...horariosExistentes, horarioData];
    this.validateHorarios(todosHorarios);

    const horario = await this.actividadRepository.createHorario(actividadId, horarioData);

    logger.info(`Horario agregado a actividad ${actividad.nombre}: ${horarioData.diaSemana} ${horarioData.horaInicio}-${horarioData.horaFin}`);

    return horario;
  }

  async actualizarHorario(horarioId: string, horarioData: any): Promise<any> {
    // Obtener el horario actual para validaciones
    const horarioActual = await this.actividadRepository.findHorarioById(horarioId);

    if (!horarioActual) {
      throw new Error(`Horario con ID ${horarioId} no encontrado`);
    }

    // Si se están modificando día u horas, validar conflictos
    if (horarioData.diaSemana || horarioData.horaInicio || horarioData.horaFin) {
      const actividadId = horarioActual.actividadId;

      // Obtener todos los horarios de la actividad excepto el actual
      const todosLosHorarios = await this.actividadRepository.getHorariosByActividad(actividadId);
      const otrosHorarios = todosLosHorarios.filter(h => h.id !== horarioId);

      // Crear el horario actualizado para validación
      const horarioActualizado = {
        diaSemana: horarioData.diaSemana || horarioActual.diaSemana,
        horaInicio: horarioData.horaInicio || horarioActual.horaInicio,
        horaFin: horarioData.horaFin || horarioActual.horaFin,
        activo: horarioData.activo !== undefined ? horarioData.activo : horarioActual.activo
      };

      // Validar contra los otros horarios de la misma actividad
      const todosParaValidar = [...otrosHorarios, horarioActualizado];
      this.validateHorarios(todosParaValidar);
    }

    const horario = await this.actividadRepository.updateHorario(horarioId, horarioData);

    logger.info(`Horario actualizado: ${horarioId} de actividad ${horarioActual.actividad.nombre}`);

    return horario;
  }

  async eliminarHorario(actividadId: string, horarioId: string): Promise<any> {
    // Verificar que la actividad existe
    const actividad = await this.actividadRepository.findById(actividadId);
    if (!actividad) {
      throw new Error(`Actividad con ID ${actividadId} no encontrada`);
    }

    const horario = await this.actividadRepository.deleteHorario(horarioId);

    logger.info(`Horario eliminado de actividad ${actividad.nombre}: ${horarioId}`);

    return horario;
  }

  async getActividadesPorDia(diaSemana: string, soloActivas: boolean = true): Promise<Actividad[]> {
    return this.actividadRepository.findActividadesByDia(diaSemana, soloActivas);
  }

  async verificarConflictosHorario(actividadId: string, diaSemana: string, horaInicio: string, horaFin: string): Promise<any> {
    const conflictos = await this.actividadRepository.findConflictosHorario(actividadId, diaSemana, horaInicio, horaFin);

    return {
      tieneConflictos: conflictos.length > 0,
      conflictos: conflictos.map(actividad => ({
        id: actividad.id,
        nombre: actividad.nombre,
        tipo: actividad.tipo,
        horarios: actividad.horarios,
        docentes: actividad.docentes
      }))
    };
  }

  async verificarDisponibilidadAula(aulaId: string, diaSemana: string, horaInicio: string, horaFin: string, excluirActividadId?: string): Promise<any> {
    const conflictos = await this.actividadRepository.verificarDisponibilidadAula(
      aulaId,
      diaSemana,
      horaInicio,
      horaFin,
      excluirActividadId
    );

    return {
      disponible: conflictos.length === 0,
      conflictos: conflictos.map(actividad => ({
        id: actividad.id,
        nombre: actividad.nombre,
        tipo: actividad.tipo,
        horarios: actividad.horarios,
        aula: actividad.reservasAula[0]?.aula
      }))
    };
  }

  async verificarDisponibilidadDocente(docenteId: string, diaSemana: string, horaInicio: string, horaFin: string, excluirActividadId?: string): Promise<any> {
    const conflictos = await this.actividadRepository.verificarDisponibilidadDocente(
      docenteId,
      diaSemana,
      horaInicio,
      horaFin,
      excluirActividadId
    );

    return {
      disponible: conflictos.length === 0,
      conflictos: conflictos.map(actividad => ({
        id: actividad.id,
        nombre: actividad.nombre,
        tipo: actividad.tipo,
        horarios: actividad.horarios
      }))
    };
  }

  async getHorarioSemanal(): Promise<any> {
    const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

    const horarioSemanal: any = {};

    for (const dia of diasSemana) {
      const actividades = await this.actividadRepository.findActividadesByDia(dia, true);

      horarioSemanal[dia] = actividades.map(actividad => ({
        id: actividad.id,
        nombre: actividad.nombre,
        tipo: actividad.tipo,
        capacidadMaxima: actividad.capacidadMaxima,
        docentes: actividad.docentes,
        horarios: actividad.horarios.sort((a, b) => {
          const aMin = this.timeToMinutes(a.horaInicio);
          const bMin = this.timeToMinutes(b.horaInicio);
          return aMin - bMin;
        })
      }));
    }

    return {
      semana: horarioSemanal,
      totalActividades: Object.values(horarioSemanal).flat().length,
      generadoEn: new Date()
    };
  }

  async getCargaHorariaDocente(docenteId: string): Promise<any> {
    // Validar que el docente existe
    const docente = await this.personaRepository.findById(docenteId);
    if (!docente) {
      throw new Error(`Docente con ID ${docenteId} no encontrado`);
    }

    if (docente.tipo !== 'DOCENTE') {
      throw new Error(`La persona ${docente.nombre} ${docente.apellido} no es un docente`);
    }

    // Obtener todas las actividades del docente
    const actividades = await this.actividadRepository.findAll({
      page: 1,
      limit: 100
    });

    const actividadesDocente = actividades.data.filter(act =>
      act.activa && (act as any).docentes.some((d: any) => d.id === docenteId)
    );

    // Calcular horas totales por día
    const horasPorDia: any = {
      LUNES: 0,
      MARTES: 0,
      MIERCOLES: 0,
      JUEVES: 0,
      VIERNES: 0,
      SABADO: 0,
      DOMINGO: 0
    };

    let totalHorasSemana = 0;

    actividadesDocente.forEach(actividad => {
      (actividad as any).horarios.forEach((horario: any) => {
        if (horario.activo) {
          const duracion = this.timeToMinutes(horario.horaFin) - this.timeToMinutes(horario.horaInicio);
          const horas = duracion / 60;
          horasPorDia[horario.diaSemana] += horas;
          totalHorasSemana += horas;
        }
      });
    });

    const alertas = [];
    if (totalHorasSemana > 20) {
      alertas.push('Sobrecarga horaria: más de 20 horas semanales');
    }

    return {
      docente: {
        id: docente.id,
        nombre: docente.nombre,
        apellido: docente.apellido,
        especialidad: docente.especialidad
      },
      totalHorasSemana,
      horasPorDia,
      actividades: actividadesDocente.map(act => ({
        id: act.id,
        nombre: act.nombre,
        tipo: act.tipo,
        horarios: (act as any).horarios
      })),
      alertas
    };
  }
}