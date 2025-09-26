import { ConfiguracionRepository } from '@/repositories/configuracion.repository';
import {
  CreateConfiguracionDto,
  UpdateConfiguracionDto,
  ConfiguracionQueryDto,
  ImportarConfiguracionesDto,
  TipoConfiguracion,
  parsearValor,
  CLAVES_SISTEMA
} from '@/dto/configuracion.dto';
import { ConfiguracionSistema } from '@prisma/client';

export class ConfiguracionService {
  constructor(private configuracionRepository: ConfiguracionRepository) {}

  async create(data: CreateConfiguracionDto): Promise<ConfiguracionSistema> {
    // Verificar que la clave no exista
    const existing = await this.configuracionRepository.findByClave(data.clave);
    if (existing) {
      throw new Error(`Ya existe una configuración con la clave: ${data.clave}`);
    }

    return this.configuracionRepository.create(data);
  }

  async findAll(query: ConfiguracionQueryDto): Promise<{
    data: ConfiguracionSistema[];
    total: number;
    page: number;
    totalPages: number
  }> {
    const result = await this.configuracionRepository.findAll(query);
    const totalPages = Math.ceil(result.total / query.limit);

    return {
      ...result,
      page: query.page,
      totalPages
    };
  }

  async findById(id: string): Promise<ConfiguracionSistema> {
    const configuracion = await this.configuracionRepository.findById(id);
    if (!configuracion) {
      throw new Error(`Configuración con ID ${id} no encontrada`);
    }
    return configuracion;
  }

  async findByClave(clave: string): Promise<ConfiguracionSistema> {
    const configuracion = await this.configuracionRepository.findByClave(clave);
    if (!configuracion) {
      throw new Error(`Configuración con clave ${clave} no encontrada`);
    }
    return configuracion;
  }

  async findByTipo(tipo: TipoConfiguracion): Promise<ConfiguracionSistema[]> {
    return this.configuracionRepository.findByTipo(tipo);
  }

  async findByCategoria(categoria: string): Promise<ConfiguracionSistema[]> {
    // Validar que la categoría tenga formato válido
    if (!categoria.match(/^[A-Z_][A-Z0-9_]*$/)) {
      throw new Error('La categoría debe estar en MAYÚSCULAS y usar guiones bajos');
    }

    return this.configuracionRepository.findByCategoria(categoria);
  }

  async update(id: string, data: UpdateConfiguracionDto): Promise<ConfiguracionSistema> {
    const existing = await this.configuracionRepository.findById(id);
    if (!existing) {
      throw new Error(`Configuración con ID ${id} no encontrada`);
    }

    // Si se está actualizando el tipo y valor, validar compatibilidad
    if (data.tipo && data.valor) {
      this.validarValorPorTipo(data.valor, data.tipo);
    } else if (data.valor) {
      // Si solo se actualiza el valor, usar el tipo existente
      this.validarValorPorTipo(data.valor, existing.tipo as TipoConfiguracion);
    }

    return this.configuracionRepository.update(id, data);
  }

  async updateByClave(clave: string, data: UpdateConfiguracionDto): Promise<ConfiguracionSistema> {
    const existing = await this.configuracionRepository.findByClave(clave);
    if (!existing) {
      throw new Error(`Configuración con clave ${clave} no encontrada`);
    }

    // Validar valor si se está actualizando
    if (data.valor) {
      const tipoAUsar = data.tipo || (existing.tipo as TipoConfiguracion);
      this.validarValorPorTipo(data.valor, tipoAUsar);
    }

    return this.configuracionRepository.updateByClave(clave, data);
  }

  async delete(id: string): Promise<ConfiguracionSistema> {
    const existing = await this.configuracionRepository.findById(id);
    if (!existing) {
      throw new Error(`Configuración con ID ${id} no encontrada`);
    }

    // Verificar si es una configuración crítica del sistema
    if (Object.values(CLAVES_SISTEMA).includes(existing.clave as any)) {
      throw new Error(`No se puede eliminar la configuración del sistema: ${existing.clave}`);
    }

    return this.configuracionRepository.delete(id);
  }

  async deleteByClave(clave: string): Promise<ConfiguracionSistema> {
    const existing = await this.configuracionRepository.findByClave(clave);
    if (!existing) {
      throw new Error(`Configuración con clave ${clave} no encontrada`);
    }

    // Verificar si es una configuración crítica del sistema
    if (Object.values(CLAVES_SISTEMA).includes(clave as any)) {
      throw new Error(`No se puede eliminar la configuración del sistema: ${clave}`);
    }

    return this.configuracionRepository.deleteByClave(clave);
  }

  async upsert(clave: string, data: CreateConfiguracionDto): Promise<ConfiguracionSistema> {
    // Validar que la clave coincida
    if (data.clave !== clave) {
      throw new Error('La clave en el cuerpo debe coincidir con la clave en la URL');
    }

    return this.configuracionRepository.upsert(clave, data);
  }

  async bulkUpsert(data: ImportarConfiguracionesDto): Promise<{
    procesadas: number;
    errores: string[];
    configuraciones: ConfiguracionSistema[]
  }> {
    const errores: string[] = [];
    const configuracionesCreadas: ConfiguracionSistema[] = [];

    // Validar configuraciones antes de procesarlas
    for (let i = 0; i < data.configuraciones.length; i++) {
      const config = data.configuraciones[i];
      try {
        this.validarValorPorTipo(config.valor, config.tipo);
      } catch (error) {
        errores.push(`Configuración ${i + 1} (${config.clave}): ${error}`);
      }
    }

    if (errores.length > 0 && !data.sobrescribir) {
      throw new Error(`Errores de validación encontrados:\n${errores.join('\n')}`);
    }

    // Procesar configuraciones válidas
    const configuracionesValidas = data.configuraciones.filter((_, index) => {
      return !errores.some(error => error.includes(`Configuración ${index + 1}`));
    });

    try {
      const procesadas = await this.configuracionRepository.bulkUpsert(configuracionesValidas);

      // Obtener las configuraciones creadas/actualizadas
      for (const config of configuracionesValidas) {
        const configuracion = await this.configuracionRepository.findByClave(config.clave);
        if (configuracion) {
          configuracionesCreadas.push(configuracion);
        }
      }

      return {
        procesadas,
        errores,
        configuraciones: configuracionesCreadas
      };
    } catch (error) {
      throw new Error(`Error en operación bulk: ${error}`);
    }
  }

  async exportarTodas(): Promise<ConfiguracionSistema[]> {
    return this.configuracionRepository.exportarTodas();
  }

  async getConfiguracionesPorPrefijo(prefijo: string): Promise<ConfiguracionSistema[]> {
    if (!prefijo.match(/^[A-Z_][A-Z0-9_]*$/)) {
      throw new Error('El prefijo debe estar en MAYÚSCULAS y usar guiones bajos');
    }

    return this.configuracionRepository.getConfiguracionesPorPrefijo(prefijo);
  }

  async contarPorTipo(): Promise<{ tipo: string; count: number }[]> {
    return this.configuracionRepository.contarPorTipo();
  }

  async buscarPorValor(valor: string): Promise<ConfiguracionSistema[]> {
    if (!valor.trim()) {
      throw new Error('El valor de búsqueda no puede estar vacío');
    }

    return this.configuracionRepository.buscarPorValor(valor);
  }

  async getConfiguracionesModificadasRecientemente(dias: number = 7): Promise<ConfiguracionSistema[]> {
    if (dias < 1 || dias > 365) {
      throw new Error('Los días deben estar entre 1 y 365');
    }

    return this.configuracionRepository.getConfiguracionesModificadasRecientemente(dias);
  }

  async validarIntegridad(): Promise<{
    totalConfiguraciones: number;
    porTipo: { [key: string]: number };
    clavesConflictivas: string[];
    valoresInvalidos: { clave: string; error: string }[];
    configuracinosFaltantes: string[];
  }> {
    const result = await this.configuracionRepository.validarIntegridad();

    // Verificar configuraciones críticas del sistema que faltan
    const configuracionesExistentes = await this.configuracionRepository.exportarTodas();
    const clavesExistentes = configuracionesExistentes.map(c => c.clave);

    const configuracinosFaltantes = Object.values(CLAVES_SISTEMA).filter(
      clave => !clavesExistentes.includes(clave)
    );

    return {
      ...result,
      configuracinosFaltantes
    };
  }

  // Métodos de utilidad para valores tipados
  async getValorTipado<T extends keyof typeof TipoConfiguracion>(
    clave: string,
    tipoEsperado: T
  ): Promise<ReturnType<typeof parsearValor<T>>> {
    const configuracion = await this.findByClave(clave);

    if (configuracion.tipo !== tipoEsperado) {
      throw new Error(`La configuración ${clave} es de tipo ${configuracion.tipo}, se esperaba ${tipoEsperado}`);
    }

    return parsearValor(configuracion.valor, tipoEsperado as TipoConfiguracion);
  }

  async setValorTipado(clave: string, valor: any, tipo: TipoConfiguracion): Promise<ConfiguracionSistema> {
    // Convertir valor a string según el tipo
    let valorString: string;

    switch (tipo) {
      case TipoConfiguracion.STRING:
        valorString = String(valor);
        break;
      case TipoConfiguracion.NUMBER:
        if (typeof valor !== 'number' || isNaN(valor)) {
          throw new Error('El valor debe ser un número válido');
        }
        valorString = valor.toString();
        break;
      case TipoConfiguracion.BOOLEAN:
        if (typeof valor !== 'boolean') {
          throw new Error('El valor debe ser un booleano');
        }
        valorString = valor.toString();
        break;
      case TipoConfiguracion.JSON:
        if (typeof valor === 'string') {
          // Validar que sea JSON válido
          JSON.parse(valor);
          valorString = valor;
        } else {
          valorString = JSON.stringify(valor);
        }
        break;
      default:
        throw new Error(`Tipo de configuración no válido: ${tipo}`);
    }

    return this.updateByClave(clave, { valor: valorString, tipo });
  }

  async inicializarConfiguracionesSistema(): Promise<{
    creadas: number;
    errores: string[]
  }> {
    const configuracionesDefecto: CreateConfiguracionDto[] = [
      {
        clave: CLAVES_SISTEMA.CUOTA_SOCIO_ACTIVO,
        valor: '5000',
        descripcion: 'Cuota mensual para socios activos',
        tipo: TipoConfiguracion.NUMBER
      },
      {
        clave: CLAVES_SISTEMA.CUOTA_SOCIO_ESTUDIANTE,
        valor: '2500',
        descripcion: 'Cuota mensual para socios estudiantes',
        tipo: TipoConfiguracion.NUMBER
      },
      {
        clave: CLAVES_SISTEMA.CUOTA_SOCIO_FAMILIAR,
        valor: '3500',
        descripcion: 'Cuota mensual para socios familiares',
        tipo: TipoConfiguracion.NUMBER
      },
      {
        clave: CLAVES_SISTEMA.CUOTA_SOCIO_JUBILADO,
        valor: '2000',
        descripcion: 'Cuota mensual para socios jubilados',
        tipo: TipoConfiguracion.NUMBER
      },
      {
        clave: CLAVES_SISTEMA.NOMBRE_ASOCIACION,
        valor: 'Asociación de Socios',
        descripcion: 'Nombre oficial de la asociación',
        tipo: TipoConfiguracion.STRING
      },
      {
        clave: CLAVES_SISTEMA.EMAIL_CONTACTO,
        valor: 'info@asociacion.com',
        descripcion: 'Email de contacto principal',
        tipo: TipoConfiguracion.STRING
      },
      {
        clave: CLAVES_SISTEMA.TELEFONO_CONTACTO,
        valor: '+54 11 1234-5678',
        descripcion: 'Teléfono de contacto principal',
        tipo: TipoConfiguracion.STRING
      },
      {
        clave: CLAVES_SISTEMA.DIRECCION_ASOCIACION,
        valor: 'Av. Principal 123, Ciudad',
        descripcion: 'Dirección física de la asociación',
        tipo: TipoConfiguracion.STRING
      },
      {
        clave: CLAVES_SISTEMA.DIAS_VENCIMIENTO_CUOTA,
        valor: '10',
        descripcion: 'Días del mes en que vence la cuota',
        tipo: TipoConfiguracion.NUMBER
      },
      {
        clave: CLAVES_SISTEMA.DESCUENTO_FAMILIAR,
        valor: '20',
        descripcion: 'Porcentaje de descuento para familiares (%)',
        tipo: TipoConfiguracion.NUMBER
      },
      {
        clave: CLAVES_SISTEMA.ACTIVIDADES_GRATIS_SOCIOS,
        valor: 'true',
        descripcion: 'Si las actividades son gratis para socios',
        tipo: TipoConfiguracion.BOOLEAN
      },
      {
        clave: CLAVES_SISTEMA.BACKUP_AUTOMATICO,
        valor: 'true',
        descripcion: 'Habilitar backup automático del sistema',
        tipo: TipoConfiguracion.BOOLEAN
      },
      {
        clave: CLAVES_SISTEMA.ENVIO_RECORDATORIOS,
        valor: 'true',
        descripcion: 'Habilitar envío de recordatorios automáticos',
        tipo: TipoConfiguracion.BOOLEAN
      },
      {
        clave: CLAVES_SISTEMA.FORMATO_RECIBO,
        valor: '{"template": "default", "incluirLogo": true, "color": "#0066cc"}',
        descripcion: 'Configuración del formato de recibos',
        tipo: TipoConfiguracion.JSON
      }
    ];

    return this.bulkUpsert({
      configuraciones: configuracionesDefecto,
      sobrescribir: false
    });
  }

  private validarValorPorTipo(valor: string, tipo: TipoConfiguracion): void {
    switch (tipo) {
      case TipoConfiguracion.NUMBER:
        const num = parseFloat(valor);
        if (isNaN(num)) {
          throw new Error('El valor debe ser un número válido para tipo NUMBER');
        }
        break;

      case TipoConfiguracion.BOOLEAN:
        if (!['true', 'false'].includes(valor.toLowerCase())) {
          throw new Error('El valor debe ser "true" o "false" para tipo BOOLEAN');
        }
        break;

      case TipoConfiguracion.JSON:
        try {
          JSON.parse(valor);
        } catch {
          throw new Error('El valor debe ser un JSON válido para tipo JSON');
        }
        break;

      case TipoConfiguracion.STRING:
      default:
        // STRING es siempre válido
        break;
    }
  }
}