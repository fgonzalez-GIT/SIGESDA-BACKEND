import { Persona, TipoPersona } from '@prisma/client';
import { PersonaRepository } from '@/repositories/persona.repository';
import { CreatePersonaDto, UpdatePersonaDto, PersonaQueryDto } from '@/dto/persona.dto';
import { logger } from '@/utils/logger';

export class PersonaService {
  constructor(private personaRepository: PersonaRepository) {}

  async createPersona(data: CreatePersonaDto): Promise<Persona> {
    // Validate unique constraints
    const existingDni = await this.personaRepository.findByDni(data.dni);
    if (existingDni) {
      throw new Error(`Ya existe una persona con DNI ${data.dni}`);
    }

    if (data.email) {
      const existingEmail = await this.personaRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new Error(`Ya existe una persona con email ${data.email}`);
      }
    }

    // Auto-assign numero socio for SOCIO type
    if (data.tipo === TipoPersona.SOCIO && !data.numeroSocio) {
      const nextNumero = await this.personaRepository.getNextNumeroSocio();
      (data as any).numeroSocio = nextNumero;
    }

    const persona = await this.personaRepository.create(data);

    logger.info(`Persona created: ${persona.tipo} - ${persona.nombre} ${persona.apellido} (ID: ${persona.id})`);

    return persona;
  }

  async getPersonas(query: PersonaQueryDto): Promise<{ data: Persona[]; total: number; pages: number }> {
    const result = await this.personaRepository.findAll(query);
    const pages = Math.ceil(result.total / query.limit);

    return {
      ...result,
      pages
    };
  }

  async getPersonaById(id: string): Promise<Persona | null> {
    return this.personaRepository.findById(id);
  }

  async updatePersona(id: string, data: UpdatePersonaDto): Promise<Persona> {
    // Check if persona exists
    const existingPersona = await this.personaRepository.findById(id);
    if (!existingPersona) {
      throw new Error(`Persona con ID ${id} no encontrada`);
    }

    // Validate unique constraints if being updated
    if (data.dni && data.dni !== existingPersona.dni) {
      const existingDni = await this.personaRepository.findByDni(data.dni);
      if (existingDni) {
        throw new Error(`Ya existe una persona con DNI ${data.dni}`);
      }
    }

    if (data.email && data.email !== existingPersona.email) {
      const existingEmail = await this.personaRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new Error(`Ya existe una persona con email ${data.email}`);
      }
    }

    const updatedPersona = await this.personaRepository.update(id, data);

    logger.info(`Persona updated: ${updatedPersona.nombre} ${updatedPersona.apellido} (ID: ${id})`);

    return updatedPersona;
  }

  async deletePersona(id: string, hard = false, motivo?: string): Promise<Persona> {
    const existingPersona = await this.personaRepository.findById(id);
    if (!existingPersona) {
      throw new Error(`Persona con ID ${id} no encontrada`);
    }

    let deletedPersona: Persona;

    if (hard) {
      deletedPersona = await this.personaRepository.hardDelete(id);
      logger.info(`Persona hard deleted: ${deletedPersona.nombre} ${deletedPersona.apellido} (ID: ${id})`);
    } else {
      deletedPersona = await this.personaRepository.softDelete(id, motivo);
      logger.info(`Persona soft deleted: ${deletedPersona.nombre} ${deletedPersona.apellido} (ID: ${id})`);
    }

    return deletedPersona;
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
}