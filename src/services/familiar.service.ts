import { Familiar, TipoPersona, TipoParentesco } from '@prisma/client';
import { FamiliarRepository } from '@/repositories/familiar.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import {
  CreateFamiliarDto,
  UpdateFamiliarDto,
  FamiliarQueryDto,
  CreateBulkFamiliaresDto,
  DeleteBulkFamiliaresDto,
  FamiliarSearchDto
} from '@/dto/familiar.dto';
import { logger } from '@/utils/logger';

export class FamiliarService {
  constructor(
    private familiarRepository: FamiliarRepository,
    private personaRepository: PersonaRepository
  ) {}

  async createFamiliar(data: CreateFamiliarDto): Promise<Familiar> {
    // Validate that both persons exist and are SOCIO type
    const [socio, familiar] = await Promise.all([
      this.personaRepository.findById(data.socioId),
      this.personaRepository.findById(data.familiarId)
    ]);

    if (!socio) {
      throw new Error(`Socio con ID ${data.socioId} no encontrado`);
    }

    if (!familiar) {
      throw new Error(`Familiar con ID ${data.familiarId} no encontrado`);
    }

    // Both must be SOCIO type
    if (socio.tipo !== TipoPersona.SOCIO) {
      throw new Error(`La persona ${socio.nombre} ${socio.apellido} no es un socio`);
    }

    if (familiar.tipo !== TipoPersona.SOCIO) {
      throw new Error(`La persona ${familiar.nombre} ${familiar.apellido} no es un socio`);
    }

    // Both must be active (not have fechaBaja)
    if (socio.fechaBaja) {
      throw new Error(`El socio ${socio.nombre} ${socio.apellido} está dado de baja`);
    }

    if (familiar.fechaBaja) {
      throw new Error(`El socio ${familiar.nombre} ${familiar.apellido} está dado de baja`);
    }

    // Check for existing relationship
    const existingRelation = await this.familiarRepository.findExistingRelation(data.socioId, data.familiarId);
    if (existingRelation) {
      throw new Error(`Ya existe una relación familiar entre ${socio.nombre} ${socio.apellido} y ${familiar.nombre} ${familiar.apellido}`);
    }

    // Validate parentesco logic
    this.validateParentesco(data.parentesco, socio, familiar);

    const relacion = await this.familiarRepository.create(data);

    logger.info(`Relación familiar creada: ${socio.nombre} ${socio.apellido} - ${data.parentesco} - ${familiar.nombre} ${familiar.apellido} (ID: ${relacion.id})`);

    return relacion;
  }

  async getFamiliares(query: FamiliarQueryDto): Promise<{ data: Familiar[]; total: number; pages: number }> {
    const result = await this.familiarRepository.findAll(query);
    const pages = Math.ceil(result.total / query.limit);

    return {
      ...result,
      pages
    };
  }

  async getFamiliarById(id: string): Promise<Familiar | null> {
    return this.familiarRepository.findById(id);
  }

  async getFamiliarsBySocio(socioId: string, includeInactivos = false): Promise<Familiar[]> {
    // Validate socio exists
    const socio = await this.personaRepository.findById(socioId);
    if (!socio) {
      throw new Error(`Socio con ID ${socioId} no encontrado`);
    }

    if (socio.tipo !== TipoPersona.SOCIO) {
      throw new Error(`La persona ${socio.nombre} ${socio.apellido} no es un socio`);
    }

    return this.familiarRepository.findBySocioId(socioId, includeInactivos);
  }

  async updateFamiliar(id: string, data: UpdateFamiliarDto): Promise<Familiar> {
    const existingRelacion = await this.familiarRepository.findById(id);
    if (!existingRelacion) {
      throw new Error(`Relación familiar con ID ${id} no encontrada`);
    }

    // If updating parentesco, validate the new relationship
    if (data.parentesco) {
      this.validateParentesco(data.parentesco, existingRelacion.socio as any, existingRelacion.familiar as any);
    }

    const updatedRelacion = await this.familiarRepository.update(id, data);

    logger.info(`Relación familiar actualizada: ID ${id} - Nuevo parentesco: ${data.parentesco || 'sin cambios'}`);

    return updatedRelacion;
  }

  async deleteFamiliar(id: string): Promise<Familiar> {
    const existingRelacion = await this.familiarRepository.findById(id);
    if (!existingRelacion) {
      throw new Error(`Relación familiar con ID ${id} no encontrada`);
    }

    const deletedRelacion = await this.familiarRepository.delete(id);

    logger.info(`Relación familiar eliminada: ${existingRelacion.socio.nombre} ${existingRelacion.socio.apellido} - ${existingRelacion.parentesco} - ${existingRelacion.familiar.nombre} ${existingRelacion.familiar.apellido}`);

    return deletedRelacion;
  }

  async createBulkFamiliares(data: CreateBulkFamiliaresDto): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    const validFamiliares: CreateFamiliarDto[] = [];

    // Validate each relationship
    for (const familiar of data.familiares) {
      try {
        // Check if persons exist and are SOCIO
        const [socio, familiarPerson] = await Promise.all([
          this.personaRepository.findById(familiar.socioId),
          this.personaRepository.findById(familiar.familiarId)
        ]);

        if (!socio || socio.tipo !== TipoPersona.SOCIO || socio.fechaBaja) {
          errors.push(`Socio ${familiar.socioId} inválido o inactivo`);
          continue;
        }

        if (!familiarPerson || familiarPerson.tipo !== TipoPersona.SOCIO || familiarPerson.fechaBaja) {
          errors.push(`Familiar ${familiar.familiarId} inválido o inactivo`);
          continue;
        }

        // Check existing relationship
        const existing = await this.familiarRepository.findExistingRelation(familiar.socioId, familiar.familiarId);
        if (existing) {
          errors.push(`Relación ya existe entre ${socio.nombre} ${socio.apellido} y ${familiarPerson.nombre} ${familiarPerson.apellido}`);
          continue;
        }

        validFamiliares.push(familiar);
      } catch (error) {
        errors.push(`Error validando relación ${familiar.socioId}-${familiar.familiarId}: ${error}`);
      }
    }

    // Create valid relationships
    const result = validFamiliares.length > 0
      ? await this.familiarRepository.createBulk(validFamiliares)
      : { count: 0 };

    logger.info(`Creación masiva de familiares: ${result.count} creados, ${errors.length} errores`);

    return {
      count: result.count,
      errors
    };
  }

  async deleteBulkFamiliares(data: DeleteBulkFamiliaresDto): Promise<{ count: number }> {
    const result = await this.familiarRepository.deleteBulk(data.ids);

    logger.info(`Eliminación masiva de familiares: ${result.count} eliminados`);

    return result;
  }

  async searchFamiliares(searchData: FamiliarSearchDto): Promise<Familiar[]> {
    return this.familiarRepository.search(searchData);
  }

  async getParentescoStats(): Promise<Array<{ parentesco: TipoParentesco; count: number }>> {
    return this.familiarRepository.getParentescoStats();
  }

  async getFamilyTree(socioId: string): Promise<any> {
    // Validate socio exists
    const socio = await this.personaRepository.findById(socioId);
    if (!socio) {
      throw new Error(`Socio con ID ${socioId} no encontrado`);
    }

    if (socio.tipo !== TipoPersona.SOCIO) {
      throw new Error(`La persona ${socio.nombre} ${socio.apellido} no es un socio`);
    }

    const familyTree = await this.familiarRepository.getFamilyTree(socioId);

    return {
      ...familyTree,
      socio: {
        id: socio.id,
        nombre: socio.nombre,
        apellido: socio.apellido,
        dni: socio.dni,
        numeroSocio: socio.numeroSocio
      }
    };
  }

  async getTiposParentesco(): Promise<TipoParentesco[]> {
    return Object.values(TipoParentesco);
  }

  // Helper method to validate parentesco relationships
  private validateParentesco(parentesco: TipoParentesco, socio: any, familiar: any): void {
    // Basic business rules for parentesco validation
    // This can be extended with more complex family relationship logic

    // Example: If setting someone as HIJO/HIJA, the familiar should be younger
    // Note: This is a simplified example - real family relationships are more complex

    if (socio.fechaNacimiento && familiar.fechaNacimiento) {
      const socioAge = new Date().getFullYear() - new Date(socio.fechaNacimiento).getFullYear();
      const familiarAge = new Date().getFullYear() - new Date(familiar.fechaNacimiento).getFullYear();

      if ((parentesco === TipoParentesco.HIJO || parentesco === TipoParentesco.HIJA) && familiarAge >= socioAge) {
        logger.warn(`Advertencia: Se está estableciendo como ${parentesco} a una persona de edad similar o mayor`);
      }

      if ((parentesco === TipoParentesco.PADRE || parentesco === TipoParentesco.MADRE) && familiarAge <= socioAge) {
        logger.warn(`Advertencia: Se está estableciendo como ${parentesco} a una persona de edad similar o menor`);
      }
    }

    // Additional validation rules can be added here
  }
}