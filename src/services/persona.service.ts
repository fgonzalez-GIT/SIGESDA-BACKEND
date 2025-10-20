import { Persona, TipoPersona } from '@prisma/client';
import { PersonaRepository } from '@/repositories/persona.repository';
import { CreatePersonaDto, UpdatePersonaDto, PersonaQueryDto } from '@/dto/persona.dto';
import { logger } from '@/utils/logger';
import { AppError } from '@/middleware/error.middleware';
import { HttpStatus } from '@/types/enums';

export class PersonaService {
  constructor(private personaRepository: PersonaRepository) {}

  // Helper para agregar el campo estado calculado
  private addEstadoField(persona: Persona): Persona & { estado: 'activo' | 'inactivo' } {
    return {
      ...persona,
      estado: persona.fechaBaja === null ? 'activo' : 'inactivo'
    };
  }

  async createPersona(data: CreatePersonaDto): Promise<Persona & { estado: 'activo' | 'inactivo' }> {
    // Validate unique constraints
    const existingDni = await this.personaRepository.findByDni(data.dni);
    if (existingDni) {
      throw new AppError(`Ya existe una persona con DNI ${data.dni}`, HttpStatus.CONFLICT);
    }

    if (data.email) {
      const existingEmail = await this.personaRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new AppError(`Ya existe una persona con email ${data.email}`, HttpStatus.CONFLICT);
      }
    }

    // Auto-assign numero socio for SOCIO type
    if (data.tipo === TipoPersona.SOCIO && !data.numeroSocio) {
      const nextNumero = await this.personaRepository.getNextNumeroSocio();
      (data as any).numeroSocio = nextNumero;
    }

    const persona = await this.personaRepository.create(data);

    logger.info(`Persona created: ${persona.tipo} - ${persona.nombre} ${persona.apellido} (ID: ${persona.id})`);

    return this.addEstadoField(persona);
  }

  async getPersonas(query: PersonaQueryDto): Promise<{ data: (Persona & { estado: 'activo' | 'inactivo' })[]; total: number; pages: number }> {
    const result = await this.personaRepository.findAll(query);
    const pages = Math.ceil(result.total / query.limit);

    return {
      data: result.data.map(p => this.addEstadoField(p)),
      total: result.total,
      pages
    };
  }

  async getPersonaById(id: number): Promise<(Persona & { estado: 'activo' | 'inactivo' }) | null> {
    const persona = await this.personaRepository.findById(id);
    return persona ? this.addEstadoField(persona) : null;
  }

  async updatePersona(id: number, data: UpdatePersonaDto): Promise<Persona & { estado: 'activo' | 'inactivo' }> {
    // Check if persona exists
    const existingPersona = await this.personaRepository.findById(id);
    if (!existingPersona) {
      throw new AppError(`Persona con ID ${id} no encontrada`, HttpStatus.NOT_FOUND);
    }

    // Validate unique constraints if being updated
    if (data.dni && data.dni !== existingPersona.dni) {
      const existingDni = await this.personaRepository.findByDni(data.dni);
      if (existingDni) {
        throw new AppError(`Ya existe una persona con DNI ${data.dni}`, HttpStatus.CONFLICT);
      }
    }

    if (data.email && data.email !== existingPersona.email) {
      const existingEmail = await this.personaRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new AppError(`Ya existe una persona con email ${data.email}`, HttpStatus.CONFLICT);
      }
    }

    const updatedPersona = await this.personaRepository.update(id, data);

    logger.info(`Persona updated: ${updatedPersona.nombre} ${updatedPersona.apellido} (ID: ${id})`);

    return this.addEstadoField(updatedPersona);
  }

  async deletePersona(id: number, hard = false, motivo?: string): Promise<Persona & { estado: 'activo' | 'inactivo' }> {
    const existingPersona = await this.personaRepository.findById(id);
    if (!existingPersona) {
      throw new AppError(`Persona con ID ${id} no encontrada`, HttpStatus.NOT_FOUND);
    }

    let deletedPersona: Persona;

    if (hard) {
      deletedPersona = await this.personaRepository.hardDelete(id);
      logger.info(`Persona hard deleted: ${deletedPersona.nombre} ${deletedPersona.apellido} (ID: ${id})`);
    } else {
      deletedPersona = await this.personaRepository.softDelete(id, motivo);
      logger.info(`Persona soft deleted: ${deletedPersona.nombre} ${deletedPersona.apellido} (ID: ${id})`);
    }

    return this.addEstadoField(deletedPersona);
  }

  async getSocios(categoria?: string, activos = true): Promise<Persona[]> {
    return this.personaRepository.getSocios(categoria as any, activos);
  }

  async getDocentes(): Promise<Persona[]> {
    const result = await this.personaRepository.findAll({
      tipo: TipoPersona.DOCENTE,
      page: 1,
      limit: 100
    });

    return result.data;
  }

  async getProveedores(): Promise<Persona[]> {
    const result = await this.personaRepository.findAll({
      tipo: TipoPersona.PROVEEDOR,
      page: 1,
      limit: 100
    });

    return result.data;
  }

  async searchPersonas(searchTerm: string, tipo?: TipoPersona): Promise<Persona[]> {
    const result = await this.personaRepository.findAll({
      search: searchTerm,
      tipo,
      page: 1,
      limit: 20
    });

    return result.data;
  }

  async checkDniExists(dni: string): Promise<{ exists: boolean; isInactive: boolean; persona: Persona | null }> {
    const persona = await this.personaRepository.findByDni(dni);

    if (!persona) {
      return {
        exists: false,
        isInactive: false,
        persona: null
      };
    }

    // A person is inactive if they have a fechaBaja
    const isInactive = persona.fechaBaja !== null;

    return {
      exists: true,
      isInactive,
      persona
    };
  }

  async reactivatePersona(id: number, data: UpdatePersonaDto): Promise<Persona> {
    // Check if persona exists
    const existingPersona = await this.personaRepository.findById(id);
    if (!existingPersona) {
      throw new AppError(`Persona con ID ${id} no encontrada`, HttpStatus.NOT_FOUND);
    }

    // Verify persona is inactive (has fechaBaja)
    if (existingPersona.fechaBaja === null) {
      throw new AppError(`La persona con ID ${id} ya tiene estado activo`, HttpStatus.BAD_REQUEST);
    }

    // Validate DNI matches if provided
    if (data.dni && data.dni !== existingPersona.dni) {
      throw new AppError('El DNI no coincide con el registro', HttpStatus.BAD_REQUEST);
    }

    // Validate unique constraints if email is being changed
    if (data.email && data.email !== existingPersona.email) {
      const existingEmail = await this.personaRepository.findByEmail(data.email);
      if (existingEmail && existingEmail.id !== id) {
        throw new AppError(`Ya existe una persona con email ${data.email}`, HttpStatus.CONFLICT);
      }
    }

    // Prepare update data with reactivation fields
    const updateData: any = {
      ...data,
      fechaBaja: null,
      motivoBaja: null
    };

    // If changing to SOCIO and no fechaIngreso, set current date
    if (data.tipo === TipoPersona.SOCIO && !existingPersona.fechaIngreso) {
      updateData.fechaIngreso = new Date();
    }

    // Auto-assign numero socio if changing to SOCIO and doesn't have one
    if (data.tipo === TipoPersona.SOCIO && !existingPersona.numeroSocio) {
      const nextNumero = await this.personaRepository.getNextNumeroSocio();
      updateData.numeroSocio = nextNumero;
    }

    const reactivatedPersona = await this.personaRepository.update(id, updateData);

    logger.info(`Persona reactivated: ${reactivatedPersona.nombre} ${reactivatedPersona.apellido} (ID: ${id})`);

    return reactivatedPersona;
  }
}