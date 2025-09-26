import { PrismaClient, ConfiguracionSistema } from '@prisma/client';
import { CreateConfiguracionDto, ConfiguracionQueryDto, TipoConfiguracion } from '@/dto/configuracion.dto';

export class ConfiguracionRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateConfiguracionDto): Promise<ConfiguracionSistema> {
    return this.prisma.configuracionSistema.create({
      data
    });
  }

  async findAll(query: ConfiguracionQueryDto): Promise<{ data: ConfiguracionSistema[]; total: number }> {
    const where: any = {};

    if (query.tipo) {
      where.tipo = query.tipo;
    }

    if (query.search) {
      where.OR = [
        { clave: { contains: query.search, mode: 'insensitive' } },
        { descripcion: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.prisma.configuracionSistema.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [
          { clave: 'asc' }
        ]
      }),
      this.prisma.configuracionSistema.count({ where })
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<ConfiguracionSistema | null> {
    return this.prisma.configuracionSistema.findUnique({
      where: { id }
    });
  }

  async findByClave(clave: string): Promise<ConfiguracionSistema | null> {
    return this.prisma.configuracionSistema.findUnique({
      where: { clave }
    });
  }

  async findByTipo(tipo: TipoConfiguracion): Promise<ConfiguracionSistema[]> {
    return this.prisma.configuracionSistema.findMany({
      where: { tipo },
      orderBy: { clave: 'asc' }
    });
  }

  async findByCategoria(categoria: string): Promise<ConfiguracionSistema[]> {
    return this.prisma.configuracionSistema.findMany({
      where: {
        clave: {
          startsWith: categoria
        }
      },
      orderBy: { clave: 'asc' }
    });
  }

  async update(id: string, data: Partial<CreateConfiguracionDto>): Promise<ConfiguracionSistema> {
    return this.prisma.configuracionSistema.update({
      where: { id },
      data
    });
  }

  async updateByClave(clave: string, data: Partial<CreateConfiguracionDto>): Promise<ConfiguracionSistema> {
    return this.prisma.configuracionSistema.update({
      where: { clave },
      data
    });
  }

  async delete(id: string): Promise<ConfiguracionSistema> {
    return this.prisma.configuracionSistema.delete({
      where: { id }
    });
  }

  async deleteByClave(clave: string): Promise<ConfiguracionSistema> {
    return this.prisma.configuracionSistema.delete({
      where: { clave }
    });
  }

  async upsert(clave: string, data: CreateConfiguracionDto): Promise<ConfiguracionSistema> {
    return this.prisma.configuracionSistema.upsert({
      where: { clave },
      create: data,
      update: {
        valor: data.valor,
        descripcion: data.descripcion,
        tipo: data.tipo
      }
    });
  }

  async bulkUpsert(configuraciones: CreateConfiguracionDto[]): Promise<number> {
    let count = 0;

    // Usar transacción para operación bulk
    await this.prisma.$transaction(async (prisma) => {
      for (const config of configuraciones) {
        await prisma.configuracionSistema.upsert({
          where: { clave: config.clave },
          create: config,
          update: {
            valor: config.valor,
            descripcion: config.descripcion,
            tipo: config.tipo
          }
        });
        count++;
      }
    });

    return count;
  }

  async getConfiguracionesPorPrefijo(prefijo: string): Promise<ConfiguracionSistema[]> {
    return this.prisma.configuracionSistema.findMany({
      where: {
        clave: {
          startsWith: prefijo
        }
      },
      orderBy: { clave: 'asc' }
    });
  }

  async exportarTodas(): Promise<ConfiguracionSistema[]> {
    return this.prisma.configuracionSistema.findMany({
      orderBy: { clave: 'asc' }
    });
  }

  async contarPorTipo(): Promise<{ tipo: string; count: number }[]> {
    const result = await this.prisma.configuracionSistema.groupBy({
      by: ['tipo'],
      _count: {
        tipo: true
      }
    });

    return result.map(item => ({
      tipo: item.tipo,
      count: item._count.tipo
    }));
  }

  async buscarPorValor(valor: string): Promise<ConfiguracionSistema[]> {
    return this.prisma.configuracionSistema.findMany({
      where: {
        valor: {
          contains: valor,
          mode: 'insensitive'
        }
      },
      orderBy: { clave: 'asc' }
    });
  }

  async getConfiguracionesModificadasRecientmente(dias: number = 7): Promise<ConfiguracionSistema[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);

    return this.prisma.configuracionSistema.findMany({
      where: {
        updatedAt: {
          gte: fechaLimite
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async validarIntegridad(): Promise<{
    totalConfiguraciones: number;
    porTipo: { [key: string]: number };
    clavesConflictivas: string[];
    valoresInvalidos: { clave: string; error: string }[];
  }> {
    const todasConfiguraciones = await this.exportarTodas();
    const porTipo = await this.contarPorTipo();
    const clavesConflictivas: string[] = [];
    const valoresInvalidos: { clave: string; error: string }[] = [];

    // Validar valores según tipo
    for (const config of todasConfiguraciones) {
      try {
        switch (config.tipo) {
          case TipoConfiguracion.NUMBER:
            const num = parseFloat(config.valor);
            if (isNaN(num)) {
              valoresInvalidos.push({
                clave: config.clave,
                error: 'Valor no es un número válido'
              });
            }
            break;

          case TipoConfiguracion.BOOLEAN:
            if (!['true', 'false'].includes(config.valor.toLowerCase())) {
              valoresInvalidos.push({
                clave: config.clave,
                error: 'Valor no es un booleano válido (true/false)'
              });
            }
            break;

          case TipoConfiguracion.JSON:
            try {
              JSON.parse(config.valor);
            } catch {
              valoresInvalidos.push({
                clave: config.clave,
                error: 'Valor no es un JSON válido'
              });
            }
            break;
        }
      } catch (error) {
        valoresInvalidos.push({
          clave: config.clave,
          error: `Error de validación: ${error}`
        });
      }
    }

    return {
      totalConfiguraciones: todasConfiguraciones.length,
      porTipo: porTipo.reduce((acc, item) => {
        acc[item.tipo] = item.count;
        return acc;
      }, {} as { [key: string]: number }),
      clavesConflictivas,
      valoresInvalidos
    };
  }
}