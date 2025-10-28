import { PrismaClient, TipoPersonaCatalogo, EspecialidadDocente } from '@prisma/client';
import { CreateTipoPersonaDto, UpdateTipoPersonaDto, CreateEspecialidadDto, UpdateEspecialidadDto } from '@/dto/catalogo.dto';

/**
 * Repository para gestión administrativa de catálogos
 * Maneja CRUD de tipos de persona y especialidades docentes
 */
export class CatalogoRepository {
  constructor(private prisma: PrismaClient) {}

  // ======================================================================
  // GESTIÓN DE TIPOS DE PERSONA
  // ======================================================================

  /**
   * Crear un nuevo tipo de persona
   */
  async createTipoPersona(data: CreateTipoPersonaDto): Promise<TipoPersonaCatalogo> {
    return this.prisma.tipoPersonaCatalogo.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        activo: data.activo ?? true,
        orden: data.orden ?? 0
      }
    });
  }

  /**
   * Obtener tipo de persona por ID
   */
  async getTipoPersonaById(id: number): Promise<TipoPersonaCatalogo | null> {
    return this.prisma.tipoPersonaCatalogo.findUnique({
      where: { id }
    });
  }

  /**
   * Obtener tipo de persona por código
   */
  async getTipoPersonaByCodigo(codigo: string): Promise<TipoPersonaCatalogo | null> {
    return this.prisma.tipoPersonaCatalogo.findUnique({
      where: { codigo }
    });
  }

  /**
   * Actualizar un tipo de persona
   */
  async updateTipoPersona(id: number, data: UpdateTipoPersonaDto): Promise<TipoPersonaCatalogo> {
    return this.prisma.tipoPersonaCatalogo.update({
      where: { id },
      data
    });
  }

  /**
   * Eliminar un tipo de persona
   */
  async deleteTipoPersona(id: number): Promise<TipoPersonaCatalogo> {
    return this.prisma.tipoPersonaCatalogo.delete({
      where: { id }
    });
  }

  /**
   * Activar/Desactivar un tipo de persona
   */
  async toggleActivoTipoPersona(id: number, activo: boolean): Promise<TipoPersonaCatalogo> {
    return this.prisma.tipoPersonaCatalogo.update({
      where: { id },
      data: { activo }
    });
  }

  /**
   * Contar personas con un tipo específico (activos o todos)
   */
  async countPersonasConTipo(tipoPersonaId: number, soloActivos = true): Promise<number> {
    return this.prisma.personaTipo.count({
      where: {
        tipoPersonaId,
        ...(soloActivos && {
          activo: true,
          fechaDesasignacion: null
        })
      }
    });
  }

  /**
   * Listar todos los tipos de persona con información de uso
   */
  async getAllTiposPersonaWithStats(): Promise<Array<TipoPersonaCatalogo & { _count: { personasTipo: number } }>> {
    return this.prisma.tipoPersonaCatalogo.findMany({
      include: {
        _count: {
          select: {
            personasTipo: {
              where: {
                activo: true,
                fechaDesasignacion: null
              }
            }
          }
        }
      },
      orderBy: { orden: 'asc' }
    });
  }

  // ======================================================================
  // GESTIÓN DE ESPECIALIDADES DOCENTES
  // ======================================================================

  /**
   * Crear una nueva especialidad docente
   */
  async createEspecialidad(data: CreateEspecialidadDto): Promise<EspecialidadDocente> {
    return this.prisma.especialidadDocente.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        activo: data.activo ?? true,
        orden: data.orden ?? 0
      }
    });
  }

  /**
   * Obtener especialidad por ID
   */
  async getEspecialidadById(id: number): Promise<EspecialidadDocente | null> {
    return this.prisma.especialidadDocente.findUnique({
      where: { id }
    });
  }

  /**
   * Obtener especialidad por código
   */
  async getEspecialidadByCodigo(codigo: string): Promise<EspecialidadDocente | null> {
    return this.prisma.especialidadDocente.findUnique({
      where: { codigo }
    });
  }

  /**
   * Actualizar una especialidad
   */
  async updateEspecialidad(id: number, data: UpdateEspecialidadDto): Promise<EspecialidadDocente> {
    return this.prisma.especialidadDocente.update({
      where: { id },
      data
    });
  }

  /**
   * Eliminar una especialidad
   */
  async deleteEspecialidad(id: number): Promise<EspecialidadDocente> {
    return this.prisma.especialidadDocente.delete({
      where: { id }
    });
  }

  /**
   * Activar/Desactivar una especialidad
   */
  async toggleActivoEspecialidad(id: number, activo: boolean): Promise<EspecialidadDocente> {
    return this.prisma.especialidadDocente.update({
      where: { id },
      data: { activo }
    });
  }

  /**
   * Contar docentes con una especialidad específica (activos o todos)
   */
  async countDocentesConEspecialidad(especialidadId: number, soloActivos = true): Promise<number> {
    return this.prisma.personaTipo.count({
      where: {
        especialidadId,
        ...(soloActivos && {
          activo: true,
          fechaDesasignacion: null
        }),
        tipoPersona: {
          codigo: 'DOCENTE'
        }
      }
    });
  }

  /**
   * Listar todas las especialidades con información de uso
   */
  async getAllEspecialidadesWithStats(): Promise<Array<EspecialidadDocente & { _count: { personasTipo: number } }>> {
    return this.prisma.especialidadDocente.findMany({
      include: {
        _count: {
          select: {
            personasTipo: {
              where: {
                activo: true,
                fechaDesasignacion: null,
                tipoPersona: {
                  codigo: 'DOCENTE'
                }
              }
            }
          }
        }
      },
      orderBy: { orden: 'asc' }
    });
  }
}
