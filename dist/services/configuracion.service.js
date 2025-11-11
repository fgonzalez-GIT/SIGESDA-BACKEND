"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracionService = void 0;
const configuracion_dto_1 = require("@/dto/configuracion.dto");
class ConfiguracionService {
    constructor(configuracionRepository) {
        this.configuracionRepository = configuracionRepository;
    }
    async create(data) {
        const existing = await this.configuracionRepository.findByClave(data.clave);
        if (existing) {
            throw new Error(`Ya existe una configuración con la clave: ${data.clave}`);
        }
        return this.configuracionRepository.create(data);
    }
    async findAll(query) {
        const result = await this.configuracionRepository.findAll(query);
        const totalPages = Math.ceil(result.total / query.limit);
        return {
            ...result,
            page: query.page,
            totalPages
        };
    }
    async findById(id) {
        const configuracion = await this.configuracionRepository.findById(id);
        if (!configuracion) {
            throw new Error(`Configuración con ID ${id} no encontrada`);
        }
        return configuracion;
    }
    async findByClave(clave) {
        const configuracion = await this.configuracionRepository.findByClave(clave);
        if (!configuracion) {
            throw new Error(`Configuración con clave ${clave} no encontrada`);
        }
        return configuracion;
    }
    async findByTipo(tipo) {
        return this.configuracionRepository.findByTipo(tipo);
    }
    async findByCategoria(categoria) {
        if (!categoria.match(/^[A-Z_][A-Z0-9_]*$/)) {
            throw new Error('La categoría debe estar en MAYÚSCULAS y usar guiones bajos');
        }
        return this.configuracionRepository.findByCategoria(categoria);
    }
    async update(id, data) {
        const existing = await this.configuracionRepository.findById(id);
        if (!existing) {
            throw new Error(`Configuración con ID ${id} no encontrada`);
        }
        if (data.tipo && data.valor) {
            this.validarValorPorTipo(data.valor, data.tipo);
        }
        else if (data.valor) {
            this.validarValorPorTipo(data.valor, existing.tipo);
        }
        return this.configuracionRepository.update(id, data);
    }
    async updateByClave(clave, data) {
        const existing = await this.configuracionRepository.findByClave(clave);
        if (!existing) {
            throw new Error(`Configuración con clave ${clave} no encontrada`);
        }
        if (data.valor) {
            const tipoAUsar = data.tipo || existing.tipo;
            this.validarValorPorTipo(data.valor, tipoAUsar);
        }
        return this.configuracionRepository.updateByClave(clave, data);
    }
    async delete(id) {
        const existing = await this.configuracionRepository.findById(id);
        if (!existing) {
            throw new Error(`Configuración con ID ${id} no encontrada`);
        }
        if (Object.values(configuracion_dto_1.CLAVES_SISTEMA).includes(existing.clave)) {
            throw new Error(`No se puede eliminar la configuración del sistema: ${existing.clave}`);
        }
        return this.configuracionRepository.delete(id);
    }
    async deleteByClave(clave) {
        const existing = await this.configuracionRepository.findByClave(clave);
        if (!existing) {
            throw new Error(`Configuración con clave ${clave} no encontrada`);
        }
        if (Object.values(configuracion_dto_1.CLAVES_SISTEMA).includes(clave)) {
            throw new Error(`No se puede eliminar la configuración del sistema: ${clave}`);
        }
        return this.configuracionRepository.deleteByClave(clave);
    }
    async upsert(clave, data) {
        if (data.clave !== clave) {
            throw new Error('La clave en el cuerpo debe coincidir con la clave en la URL');
        }
        return this.configuracionRepository.upsert(clave, data);
    }
    async bulkUpsert(data) {
        const errores = [];
        const configuracionesCreadas = [];
        for (let i = 0; i < data.configuraciones.length; i++) {
            const config = data.configuraciones[i];
            try {
                this.validarValorPorTipo(config.valor, config.tipo);
            }
            catch (error) {
                errores.push(`Configuración ${i + 1} (${config.clave}): ${error}`);
            }
        }
        if (errores.length > 0 && !data.sobrescribir) {
            throw new Error(`Errores de validación encontrados:\n${errores.join('\n')}`);
        }
        const configuracionesValidas = data.configuraciones.filter((_, index) => {
            return !errores.some(error => error.includes(`Configuración ${index + 1}`));
        });
        try {
            const procesadas = await this.configuracionRepository.bulkUpsert(configuracionesValidas);
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
        }
        catch (error) {
            throw new Error(`Error en operación bulk: ${error}`);
        }
    }
    async exportarTodas() {
        return this.configuracionRepository.exportarTodas();
    }
    async getConfiguracionesPorPrefijo(prefijo) {
        if (!prefijo.match(/^[A-Z_][A-Z0-9_]*$/)) {
            throw new Error('El prefijo debe estar en MAYÚSCULAS y usar guiones bajos');
        }
        return this.configuracionRepository.getConfiguracionesPorPrefijo(prefijo);
    }
    async contarPorTipo() {
        return this.configuracionRepository.contarPorTipo();
    }
    async buscarPorValor(valor) {
        if (!valor.trim()) {
            throw new Error('El valor de búsqueda no puede estar vacío');
        }
        return this.configuracionRepository.buscarPorValor(valor);
    }
    async getConfiguracionesModificadasRecientemente(dias = 7) {
        if (dias < 1 || dias > 365) {
            throw new Error('Los días deben estar entre 1 y 365');
        }
        return this.configuracionRepository.getConfiguracionesModificadasRecientemente(dias);
    }
    async validarIntegridad() {
        const result = await this.configuracionRepository.validarIntegridad();
        const configuracionesExistentes = await this.configuracionRepository.exportarTodas();
        const clavesExistentes = configuracionesExistentes.map(c => c.clave);
        const configuracinosFaltantes = Object.values(configuracion_dto_1.CLAVES_SISTEMA).filter(clave => !clavesExistentes.includes(clave));
        return {
            ...result,
            configuracinosFaltantes
        };
    }
    async getValorTipado(clave, tipoEsperado) {
        const configuracion = await this.findByClave(clave);
        if (configuracion.tipo !== tipoEsperado) {
            throw new Error(`La configuración ${clave} es de tipo ${configuracion.tipo}, se esperaba ${tipoEsperado}`);
        }
        return (0, configuracion_dto_1.parsearValor)(configuracion.valor, tipoEsperado);
    }
    async setValorTipado(clave, valor, tipo) {
        let valorString;
        switch (tipo) {
            case configuracion_dto_1.TipoConfiguracion.STRING:
                valorString = String(valor);
                break;
            case configuracion_dto_1.TipoConfiguracion.NUMBER:
                if (typeof valor !== 'number' || isNaN(valor)) {
                    throw new Error('El valor debe ser un número válido');
                }
                valorString = valor.toString();
                break;
            case configuracion_dto_1.TipoConfiguracion.BOOLEAN:
                if (typeof valor !== 'boolean') {
                    throw new Error('El valor debe ser un booleano');
                }
                valorString = valor.toString();
                break;
            case configuracion_dto_1.TipoConfiguracion.JSON:
                if (typeof valor === 'string') {
                    JSON.parse(valor);
                    valorString = valor;
                }
                else {
                    valorString = JSON.stringify(valor);
                }
                break;
            default:
                throw new Error(`Tipo de configuración no válido: ${tipo}`);
        }
        return this.updateByClave(clave, { valor: valorString, tipo });
    }
    async inicializarConfiguracionesSistema() {
        const configuracionesDefecto = [
            {
                clave: configuracion_dto_1.CLAVES_SISTEMA.CUOTA_SOCIO_ACTIVO,
                valor: '5000',
                descripcion: 'Cuota mensual para socios activos',
                tipo: configuracion_dto_1.TipoConfiguracion.NUMBER
            },
            {
                clave: configuracion_dto_1.CLAVES_SISTEMA.CUOTA_SOCIO_ESTUDIANTE,
                valor: '2500',
                descripcion: 'Cuota mensual para socios estudiantes',
                tipo: configuracion_dto_1.TipoConfiguracion.NUMBER
            },
            {
                clave: configuracion_dto_1.CLAVES_SISTEMA.CUOTA_SOCIO_FAMILIAR,
                valor: '3500',
                descripcion: 'Cuota mensual para socios familiares',
                tipo: configuracion_dto_1.TipoConfiguracion.NUMBER
            },
            {
                clave: configuracion_dto_1.CLAVES_SISTEMA.CUOTA_SOCIO_JUBILADO,
                valor: '2000',
                descripcion: 'Cuota mensual para socios jubilados',
                tipo: configuracion_dto_1.TipoConfiguracion.NUMBER
            },
            {
                clave: configuracion_dto_1.CLAVES_SISTEMA.NOMBRE_ASOCIACION,
                valor: 'Asociación de Socios',
                descripcion: 'Nombre oficial de la asociación',
                tipo: configuracion_dto_1.TipoConfiguracion.STRING
            },
            {
                clave: configuracion_dto_1.CLAVES_SISTEMA.EMAIL_CONTACTO,
                valor: 'info@asociacion.com',
                descripcion: 'Email de contacto principal',
                tipo: configuracion_dto_1.TipoConfiguracion.STRING
            },
            {
                clave: configuracion_dto_1.CLAVES_SISTEMA.TELEFONO_CONTACTO,
                valor: '+54 11 1234-5678',
                descripcion: 'Teléfono de contacto principal',
                tipo: configuracion_dto_1.TipoConfiguracion.STRING
            },
            {
                clave: configuracion_dto_1.CLAVES_SISTEMA.DIRECCION_ASOCIACION,
                valor: 'Av. Principal 123, Ciudad',
                descripcion: 'Dirección física de la asociación',
                tipo: configuracion_dto_1.TipoConfiguracion.STRING
            },
            {
                clave: configuracion_dto_1.CLAVES_SISTEMA.DIAS_VENCIMIENTO_CUOTA,
                valor: '10',
                descripcion: 'Días del mes en que vence la cuota',
                tipo: configuracion_dto_1.TipoConfiguracion.NUMBER
            },
            {
                clave: configuracion_dto_1.CLAVES_SISTEMA.DESCUENTO_FAMILIAR,
                valor: '20',
                descripcion: 'Porcentaje de descuento para familiares (%)',
                tipo: configuracion_dto_1.TipoConfiguracion.NUMBER
            },
            {
                clave: configuracion_dto_1.CLAVES_SISTEMA.ACTIVIDADES_GRATIS_SOCIOS,
                valor: 'true',
                descripcion: 'Si las actividades son gratis para socios',
                tipo: configuracion_dto_1.TipoConfiguracion.BOOLEAN
            },
            {
                clave: configuracion_dto_1.CLAVES_SISTEMA.BACKUP_AUTOMATICO,
                valor: 'true',
                descripcion: 'Habilitar backup automático del sistema',
                tipo: configuracion_dto_1.TipoConfiguracion.BOOLEAN
            },
            {
                clave: configuracion_dto_1.CLAVES_SISTEMA.ENVIO_RECORDATORIOS,
                valor: 'true',
                descripcion: 'Habilitar envío de recordatorios automáticos',
                tipo: configuracion_dto_1.TipoConfiguracion.BOOLEAN
            },
            {
                clave: configuracion_dto_1.CLAVES_SISTEMA.FORMATO_RECIBO,
                valor: '{"template": "default", "incluirLogo": true, "color": "#0066cc"}',
                descripcion: 'Configuración del formato de recibos',
                tipo: configuracion_dto_1.TipoConfiguracion.JSON
            }
        ];
        return this.bulkUpsert({
            configuraciones: configuracionesDefecto,
            sobrescribir: false
        });
    }
    validarValorPorTipo(valor, tipo) {
        switch (tipo) {
            case configuracion_dto_1.TipoConfiguracion.NUMBER:
                const num = parseFloat(valor);
                if (isNaN(num)) {
                    throw new Error('El valor debe ser un número válido para tipo NUMBER');
                }
                break;
            case configuracion_dto_1.TipoConfiguracion.BOOLEAN:
                if (!['true', 'false'].includes(valor.toLowerCase())) {
                    throw new Error('El valor debe ser "true" o "false" para tipo BOOLEAN');
                }
                break;
            case configuracion_dto_1.TipoConfiguracion.JSON:
                try {
                    JSON.parse(valor);
                }
                catch {
                    throw new Error('El valor debe ser un JSON válido para tipo JSON');
                }
                break;
            case configuracion_dto_1.TipoConfiguracion.STRING:
            default:
                break;
        }
    }
}
exports.ConfiguracionService = ConfiguracionService;
//# sourceMappingURL=configuracion.service.js.map