import { Persona, PrismaClient } from '@prisma/client';
import { PersonaRepository } from '@/repositories/persona.repository';
import { PersonaTipoRepository } from '@/repositories/persona-tipo.repository';
import { CreatePersonaDto, UpdatePersonaDto, PersonaQueryDto } from '@/dto/persona.dto';
import { logger } from '@/utils/logger';
import { AppError } from '@/middleware/error.middleware';
import { HttpStatus } from '@/types/enums';
import { validateTiposMutuamenteExcluyentes } from '@/utils/persona.helper';
import { prisma } from '@/config/database';

export class PersonaService {
  private prisma: PrismaClient;

  constructor(
    private personaRepository: PersonaRepository,
    private personaTipoRepository: PersonaTipoRepository
  ) {
    this.prisma = prisma;
  }

  // ======================================================================
  // CRUD PRINCIPAL
  // ======================================================================

  /**
   * Crear persona con tipos y contactos
   */
  async createPersona(data: CreatePersonaDto): Promise<Persona> {
    // Validar DNI único
    const existingDni = await this.personaRepository.findByDni(data.dni);
    if (existingDni) {
      throw new AppError(`Ya existe una persona con DNI ${data.dni}`, HttpStatus.CONFLICT);
    }

    // Validar email único (si se proporciona)
    if (data.email) {
      const existingEmail = await this.personaRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new AppError(`Ya existe una persona con email ${data.email}`, HttpStatus.CONFLICT);
      }
    }

    // Procesar tipos
    const tipos = data.tipos || [];

    // Si no se especifica ningún tipo, asignar NO_SOCIO por defecto
    if (tipos.length === 0) {
      tipos.push({
        tipoPersonaCodigo: 'NO_SOCIO'
      } as any);
    }

    // =========================================================================
    // VALIDACIÓN: TIPOS MUTUAMENTE EXCLUYENTES (SOCIO y NO_SOCIO)
    // =========================================================================
    // Obtener todos los códigos de tipos que se van a asignar
    const tiposCodigos: string[] = [];
    for (const tipo of tipos) {
      let tipoCodigo = tipo.tipoPersonaCodigo;

      // Si no tiene código pero tiene ID, obtener el código del catálogo
      if (!tipoCodigo && tipo.tipoPersonaId) {
        const tiposCatalogo = await this.personaTipoRepository.getTiposPersona(false);
        const tipoCatalogo = tiposCatalogo.find(t => t.id === tipo.tipoPersonaId);
        if (tipoCatalogo) {
          tipoCodigo = tipoCatalogo.codigo as any;
        }
      }

      if (tipoCodigo) {
        tiposCodigos.push(tipoCodigo);
      }
    }

    // Validar que no se intenten asignar tipos mutuamente excluyentes
    const validacion = validateTiposMutuamenteExcluyentes(tiposCodigos);
    if (!validacion.valid) {
      throw new AppError(validacion.error!, HttpStatus.BAD_REQUEST);
    }

    // Procesar cada tipo para agregar defaults
    for (const tipo of tipos) {
      // Obtener código del tipo
      let tipoCodigo = tipo.tipoPersonaCodigo;

      if (!tipoCodigo && tipo.tipoPersonaId) {
        const tiposCatalogo = await this.personaTipoRepository.getTiposPersona(false);
        const tipoCatalogo = tiposCatalogo.find(t => t.id === tipo.tipoPersonaId);
        if (tipoCatalogo) {
          tipoCodigo = tipoCatalogo.codigo as any;
        }
      }

      // Auto-asignar defaults según tipo
      if (tipoCodigo === 'SOCIO') {
        // Auto-asignar número de socio si no se proporciona
        if (!tipo.numeroSocio) {
          const nextNumero = await this.personaTipoRepository.getNextNumeroSocio();
          tipo.numeroSocio = nextNumero;
        }

        // Auto-asignar categoría ACTIVO si no se proporciona
        if (!tipo.categoriaId) {
          const categoriaActivo = await this.prisma.categoriaSocio.findFirst({
            where: { codigo: 'ACTIVO', activa: true }
          });
          if (categoriaActivo) {
            tipo.categoriaId = categoriaActivo.id;
            logger.info(`Auto-asignada categoría ACTIVO (ID: ${categoriaActivo.id}) para nuevo socio`);
          } else {
            throw new AppError('No se encontró categoría ACTIVO para asignar', HttpStatus.INTERNAL_SERVER_ERROR);
          }
        }

        // Auto-asignar fecha de ingreso si no se proporciona
        if (!tipo.fechaIngreso) {
          tipo.fechaIngreso = new Date().toISOString();
        }
      }

      if (tipoCodigo === 'DOCENTE') {
        // Auto-asignar especialidad ACTIVO/primera activa si no se proporciona
        if (!tipo.especialidadId) {
          const especialidad = await this.prisma.especialidadDocente.findFirst({
            where: { activo: true },
            orderBy: { orden: 'asc' }
          });
          if (especialidad) {
            tipo.especialidadId = especialidad.id;
            logger.info(`Auto-asignada especialidad ${especialidad.nombre} (ID: ${especialidad.id}) para nuevo docente`);
          } else {
            throw new AppError('No se encontró especialidad activa para asignar', HttpStatus.INTERNAL_SERVER_ERROR);
          }
        }
      }

      if (tipoCodigo === 'PROVEEDOR') {
        // PROVEEDOR requiere CUIT y razonSocialId (se valida en DTO)
        if (!tipo.cuit || !tipo.razonSocialId) {
          throw new AppError(
            'El tipo PROVEEDOR requiere CUIT y razón social',
            HttpStatus.BAD_REQUEST
          );
        }
      }
    }

    // Crear persona con tipos y contactos
    const persona = await this.personaRepository.create({
      ...data,
      tipos,
      contactos: data.contactos || []
    });

    logger.info(`Persona creada: ${persona.nombre} ${persona.apellido} (ID: ${persona.id})`);

    return persona;
  }

  /**
   * Obtener personas con filtros
   */
  async getPersonas(query: PersonaQueryDto): Promise<{
    data: Persona[];
    total: number;
    pages?: number;
    page?: number;
  }> {
    const result = await this.personaRepository.findAll(query);

    // Calcular paginación solo si page y limit están definidos
    const pages = query.limit ? Math.ceil(result.total / query.limit) : undefined;

    return {
      data: result.data,
      total: result.total,
      ...(query.page && { page: query.page }),
      ...(pages && { pages })
    };
  }

  /**
   * Obtener persona por ID
   */
  async getPersonaById(id: number, includeRelations = true): Promise<Persona | null> {
    const persona = await this.personaRepository.findById(id, includeRelations);

    if (!persona) {
      throw new AppError(`Persona con ID ${id} no encontrada`, HttpStatus.NOT_FOUND);
    }

    return persona;
  }

  /**
   * Actualizar persona (datos base, tipos y contactos)
   */
  async updatePersona(id: number, data: UpdatePersonaDto): Promise<Persona> {
    // Verificar que existe
    const existingPersona = await this.personaRepository.findById(id, true);
    if (!existingPersona) {
      throw new AppError(`Persona con ID ${id} no encontrada`, HttpStatus.NOT_FOUND);
    }

    // ========== FASE 2: VALIDACIONES DE NEGOCIO ==========

    // Validación CRÍTICA: No permitir vaciar tipos completamente
    if (data.tipos !== undefined && data.tipos.length === 0) {
      throw new AppError(
        'No se puede eliminar todos los tipos de una persona. Use el endpoint DELETE para dar de baja.',
        HttpStatus.BAD_REQUEST
      );
    }

    // Validación: Asegurar que no quedan 0 tipos activos después del update
    if (data.tipos && data.tipos.length > 0) {
      const tiposActivos = data.tipos.filter(t => t.activo !== false);
      if (tiposActivos.length === 0) {
        throw new AppError(
          'Debe haber al menos un tipo activo para la persona',
          HttpStatus.BAD_REQUEST
        );
      }
    }

    // ========== FIN FASE 2 ==========

    // Validar DNI único si se actualiza
    if (data.dni && data.dni !== existingPersona.dni) {
      const existingDni = await this.personaRepository.findByDni(data.dni);
      if (existingDni) {
        throw new AppError(`Ya existe una persona con DNI ${data.dni}`, HttpStatus.CONFLICT);
      }
    }

    // Validar email único si se actualiza
    if (data.email && data.email !== existingPersona.email) {
      const existingEmail = await this.personaRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new AppError(`Ya existe una persona con email ${data.email}`, HttpStatus.CONFLICT);
      }
    }

    // Procesar tipos si se envían (sincronización completa)
    let tiposProcessed: any[] | undefined;
    if (data.tipos && data.tipos.length > 0) {
      const tipos = data.tipos;

      // Validación: TIPOS MUTUAMENTE EXCLUYENTES (SOCIO y NO_SOCIO)
      const tiposCodigos: string[] = [];
      for (const tipo of tipos) {
        let tipoCodigo = tipo.tipoPersonaCodigo;

        if (!tipoCodigo && tipo.tipoPersonaId) {
          const tiposCatalogo = await this.personaTipoRepository.getTiposPersona(false);
          const tipoCatalogo = tiposCatalogo.find(t => t.id === tipo.tipoPersonaId);
          if (tipoCatalogo) {
            tipoCodigo = tipoCatalogo.codigo as any;
          }
        }

        if (tipoCodigo) {
          tiposCodigos.push(tipoCodigo);
        }
      }

      const validacion = validateTiposMutuamenteExcluyentes(tiposCodigos);
      if (!validacion.valid) {
        throw new AppError(validacion.error!, HttpStatus.BAD_REQUEST);
      }

      // Procesar cada tipo para agregar defaults
      for (const tipo of tipos) {
        let tipoCodigo = tipo.tipoPersonaCodigo;

        if (!tipoCodigo && tipo.tipoPersonaId) {
          const tiposCatalogo = await this.personaTipoRepository.getTiposPersona(false);
          const tipoCatalogo = tiposCatalogo.find(t => t.id === tipo.tipoPersonaId);
          if (tipoCatalogo) {
            tipoCodigo = tipoCatalogo.codigo as any;
          }
        }

        // Auto-asignar defaults según tipo
        if (tipoCodigo === 'SOCIO') {
          if (!tipo.numeroSocio) {
            const nextNumero = await this.personaTipoRepository.getNextNumeroSocio();
            tipo.numeroSocio = nextNumero;
          }

          if (!tipo.categoriaId) {
            const categoriaActivo = await this.prisma.categoriaSocio.findFirst({
              where: { codigo: 'ACTIVO', activa: true }
            });
            if (categoriaActivo) {
              tipo.categoriaId = categoriaActivo.id;
              logger.info(`Auto-asignada categoría ACTIVO (ID: ${categoriaActivo.id}) para socio`);
            }
          }

          if (!tipo.fechaIngreso) {
            tipo.fechaIngreso = new Date().toISOString();
          }
        }

        if (tipoCodigo === 'DOCENTE') {
          if (!tipo.especialidadId) {
            const especialidad = await this.prisma.especialidadDocente.findFirst({
              where: { activo: true },
              orderBy: { orden: 'asc' }
            });
            if (especialidad) {
              tipo.especialidadId = especialidad.id;
              logger.info(`Auto-asignada especialidad ${especialidad.nombre} (ID: ${especialidad.id}) para docente`);
            }
          }
        }

        if (tipoCodigo === 'PROVEEDOR') {
          if (!tipo.cuit || !tipo.razonSocialId) {
            throw new AppError(
              'El tipo PROVEEDOR requiere CUIT y razón social',
              HttpStatus.BAD_REQUEST
            );
          }
        }
      }

      tiposProcessed = tipos;
    }

    const updatedPersona = await this.personaRepository.update(id, {
      ...data,
      tipos: tiposProcessed,
      contactos: data.contactos
    });

    logger.info(`Persona actualizada: ${updatedPersona.nombre} ${updatedPersona.apellido} (ID: ${id})`);

    return updatedPersona;
  }

  // ======================================================================
  // FASE 0: VALIDACIONES PRE-ELIMINACIÓN (IMPLEMENTACIÓN FUTURA)
  // ======================================================================

  /**
   * ⚠️ FASE 0: Validar si una persona puede ser dada de baja
   *
   * TODO: Implementar estas validaciones en el futuro antes de permitir soft delete
   *
   * Validaciones requeridas:
   * 1. ✅ Deudas pendientes (recibos PENDIENTE/VENCIDO)
   * 2. ✅ Participaciones activas en actividades EN_CURSO o PLANIFICADA
   * 3. ✅ Docente asignado a actividad activa
   * 4. ✅ Participaciones activas en secciones
   * 5. ✅ Docente de sección activa
   * 6. ✅ Reservas de aulas futuras/vigentes
   * 7. ✅ Miembro activo de comisión directiva
   *
   * @param personaId - ID de la persona a validar
   * @returns Objeto con canDelete, blockers y warnings
   */
  /* TODO: Descomentar cuando se implemente FASE 0
  async validateCanDelete(personaId: number): Promise<{
    canDelete: boolean;
    blockers: string[];
    warnings: string[];
  }> {
    const blockers: string[] = [];
    const warnings: string[] = [];

    // ========== VALIDACIÓN 1: DEUDAS PENDIENTES ==========
    // TODO: Implementar validación de recibos pendientes
    const recibosPendientes = await this.prisma.recibo.count({
      where: {
        receptorId: personaId,
        tipo: { in: ['CUOTA', 'SUELDO', 'DEUDA', 'PAGO_ACTIVIDAD'] },
        estado: { in: ['PENDIENTE', 'VENCIDO'] }
      }
    });

    if (recibosPendientes > 0) {
      blockers.push(
        `Tiene ${recibosPendientes} recibo(s) pendiente(s) de pago. ` +
        `Debe regularizar las deudas antes de dar de baja.`
      );
    }

    // ========== VALIDACIÓN 2: PARTICIPACIONES ACTIVAS EN ACTIVIDADES EN CURSO ==========
    // TODO: Implementar validación de participaciones activas
    const participacionesActivas = await this.prisma.participacion_actividades.findMany({
      where: {
        personaId,
        activa: true,
        actividades: {
          activa: true,
          estadosActividades: {
            codigo: { in: ['EN_CURSO', 'PLANIFICADA'] }
          }
        }
      },
      include: {
        actividades: {
          include: { estadosActividades: true }
        }
      }
    });

    if (participacionesActivas.length > 0) {
      const actividadesEnCurso = participacionesActivas
        .filter(p => p.actividades.estadosActividades.codigo === 'EN_CURSO')
        .map(p => p.actividades.nombre);

      if (actividadesEnCurso.length > 0) {
        blockers.push(
          `Está inscrito/a en ${actividadesEnCurso.length} actividad(es) en curso: ` +
          `${actividadesEnCurso.join(', ')}. Debe darse de baja de las actividades primero.`
        );
      }

      // Advertencia para actividades PLANIFICADAS (no bloquea, solo advierte)
      const actividadesPlanificadas = participacionesActivas
        .filter(p => p.actividades.estadosActividades.codigo === 'PLANIFICADA')
        .map(p => p.actividades.nombre);

      if (actividadesPlanificadas.length > 0) {
        warnings.push(
          `Está inscrito/a en ${actividadesPlanificadas.length} actividad(es) planificada(s): ` +
          `${actividadesPlanificadas.join(', ')}. Considere dar de baja estas inscripciones.`
        );
      }
    }

    // ========== VALIDACIÓN 3: DOCENTE ASIGNADO A ACTIVIDAD ACTIVA ==========
    // TODO: Implementar validación de docentes activos
    const docentesActivos = await this.prisma.docentes_actividades.findMany({
      where: {
        docenteId: personaId,
        activo: true,
        actividades: {
          activa: true,
          estadosActividades: {
            codigo: { in: ['EN_CURSO', 'PLANIFICADA'] }
          }
        }
      },
      include: {
        actividades: {
          include: { estadosActividades: true }
        },
        rolesDocentes: true
      }
    });

    if (docentesActivos.length > 0) {
      const actividadesDocente = docentesActivos.map(
        d => `${d.actividades.nombre} (${d.rolesDocentes.nombre})`
      );

      blockers.push(
        `Es docente activo de ${docentesActivos.length} actividad(es): ` +
        `${actividadesDocente.join(', ')}. Debe desasignarse como docente primero.`
      );
    }

    // ========== VALIDACIÓN 4: PARTICIPACIONES ACTIVAS EN SECCIONES ==========
    // TODO: Implementar validación de secciones activas
    const seccionesActivas = await this.prisma.participaciones_secciones.count({
      where: {
        personaId,
        activa: true,
        secciones_actividades: { activa: true }
      }
    });

    if (seccionesActivas > 0) {
      blockers.push(
        `Está inscrito/a en ${seccionesActivas} sección(es) activa(s). ` +
        `Debe darse de baja de las secciones primero.`
      );
    }

    // ========== VALIDACIÓN 5: DOCENTE DE SECCIÓN ACTIVA ==========
    // TODO: Implementar validación de docente de sección
    const seccionesDocente = await this.prisma.secciones_actividades.count({
      where: {
        personas: { some: { id: personaId } },
        activa: true
      }
    });

    if (seccionesDocente > 0) {
      blockers.push(
        `Es docente de ${seccionesDocente} sección(es) activa(s). ` +
        `Debe desasignarse como docente de las secciones primero.`
      );
    }

    // ========== VALIDACIÓN 6: RESERVAS DE AULAS FUTURAS ==========
    // TODO: Implementar validación de reservas futuras
    const reservasFuturas = await this.prisma.reserva_aulas.count({
      where: {
        docenteId: personaId,
        fechaFin: { gte: new Date() }
      }
    });

    if (reservasFuturas > 0) {
      blockers.push(
        `Tiene ${reservasFuturas} reserva(s) de aula(s) programada(s) a futuro. ` +
        `Debe cancelar las reservas primero.`
      );
    }

    // ========== VALIDACIÓN 7: MIEMBRO ACTIVO DE COMISIÓN DIRECTIVA ==========
    // TODO: Implementar validación de comisión directiva
    const comisionDirectiva = await this.prisma.comision_directiva.findFirst({
      where: {
        socioId: personaId,
        activo: true,
        OR: [
          { fechaFin: null },
          { fechaFin: { gte: new Date() } }
        ]
      }
    });

    if (comisionDirectiva) {
      blockers.push(
        `Tiene un cargo activo en la Comisión Directiva (${comisionDirectiva.cargo}). ` +
        `Debe renunciar al cargo antes de dar de baja.`
      );
    }

    return {
      canDelete: blockers.length === 0,
      blockers,
      warnings
    };
  }
  */

  /**
   * Eliminar persona
   */
  async deletePersona(id: number, hard = false, motivo?: string): Promise<Persona> {
    const existingPersona = await this.personaRepository.findById(id, false);
    if (!existingPersona) {
      throw new AppError(`Persona con ID ${id} no encontrada`, HttpStatus.NOT_FOUND);
    }

    // ⚠️ FASE 0: Validar que se pueda eliminar
    // TODO: Descomentar cuando se implemente FASE 0
    /*
    const validation = await this.validateCanDelete(id);

    if (!validation.canDelete) {
      throw new AppError(
        `No se puede dar de baja la persona. Razones:\n${validation.blockers.join('\n')}`,
        HttpStatus.CONFLICT
      );
    }

    // Mostrar advertencias en logs si existen
    if (validation.warnings.length > 0) {
      logger.warn(`Advertencias al dar de baja persona ${id}:`, validation.warnings);
    }
    */

    let deletedPersona: Persona;

    if (hard) {
      // Hard delete: eliminar completamente
      deletedPersona = await this.personaRepository.hardDelete(id);
      logger.info(`Persona eliminada (hard): ${deletedPersona.nombre} ${deletedPersona.apellido} (ID: ${id})`);
    } else {
      // Soft delete: desactivar todos los tipos
      deletedPersona = await this.personaRepository.softDelete(id, motivo);
      logger.info(`Persona desactivada (soft): ${deletedPersona.nombre} ${deletedPersona.apellido} (ID: ${id})`);
    }

    return deletedPersona;
  }

  // ======================================================================
  // BÚSQUEDAS ESPECÍFICAS
  // ======================================================================

  /**
   * Buscar personas por texto
   */
  async searchPersonas(searchTerm: string, tipoPersonaCodigo?: string, limit = 20): Promise<Persona[]> {
    return this.personaRepository.search(searchTerm, tipoPersonaCodigo, limit);
  }

  /**
   * Obtener socios
   */
  async getSocios(params?: {
    categoriaId?: number;
    activos?: boolean;
    conNumeroSocio?: boolean;
  }): Promise<Persona[]> {
    return this.personaRepository.getSocios(params);
  }

  /**
   * Obtener docentes
   */
  async getDocentes(params?: {
    especialidadId?: number;
    activos?: boolean;
  }): Promise<Persona[]> {
    return this.personaRepository.getDocentes(params);
  }

  /**
   * Obtener proveedores
   */
  async getProveedores(activos = true): Promise<Persona[]> {
    return this.personaRepository.getProveedores(activos);
  }

  /**
   * Obtener personas por tipo
   */
  async getPersonasByTipo(tipoPersonaCodigo: string, soloActivos = true): Promise<Persona[]> {
    return this.personaRepository.findByTipo(tipoPersonaCodigo, soloActivos);
  }

  // ======================================================================
  // UTILIDADES
  // ======================================================================

  /**
   * Verificar si existe persona con DNI
   */
  async checkDniExists(dni: string): Promise<{
    exists: boolean;
    isActive: boolean;
    persona: Persona | null;
  }> {
    const persona = await this.personaRepository.findByDni(dni);

    if (!persona) {
      return {
        exists: false,
        isActive: false,
        persona: null
      };
    }

    const isActive = await this.personaRepository.isActiva(persona.id);

    return {
      exists: true,
      isActive,
      persona
    };
  }

  /**
   * Reactivar persona (agregar tipo NO_SOCIO si no tiene tipos activos)
   */
  async reactivatePersona(id: number, data?: UpdatePersonaDto): Promise<Persona> {
    const persona = await this.personaRepository.findById(id, true);
    if (!persona) {
      throw new AppError(`Persona con ID ${id} no encontrada`, HttpStatus.NOT_FOUND);
    }

    // Verificar si ya está activa
    const isActive = await this.personaRepository.isActiva(id);
    if (isActive) {
      throw new AppError(`La persona con ID ${id} ya está activa`, HttpStatus.BAD_REQUEST);
    }

    // Actualizar datos si se proporcionan
    if (data) {
      await this.updatePersona(id, data);
    }

    // Asignar tipo NO_SOCIO por defecto
    await this.personaTipoRepository.asignarTipo(id, {
      tipoPersonaCodigo: 'NO_SOCIO',
      activo: true
    });

    const reactivatedPersona = await this.personaRepository.findById(id, true);

    logger.info(`Persona reactivada: ${reactivatedPersona!.nombre} ${reactivatedPersona!.apellido} (ID: ${id})`);

    return reactivatedPersona!;
  }

  /**
   * Verificar si persona tiene tipo específico activo
   */
  async hasTipoActivo(personaId: number, tipoPersonaCodigo: string): Promise<boolean> {
    return this.personaRepository.hasTipoActivo(personaId, tipoPersonaCodigo);
  }

  /**
   * Obtener estado de persona (activo/inactivo)
   */
  async getEstadoPersona(personaId: number): Promise<{
    activa: boolean;
    tiposActivos: number;
    tiposInactivos: number;
  }> {
    const tiposActivos = await this.personaRepository.countTiposActivos(personaId);
    const todosTipos = await this.personaTipoRepository.findByPersonaId(personaId, false);

    return {
      activa: tiposActivos > 0,
      tiposActivos,
      tiposInactivos: todosTipos.length - tiposActivos
    };
  }
}
