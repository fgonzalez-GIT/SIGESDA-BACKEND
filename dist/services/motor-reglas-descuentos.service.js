"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MotorReglasDescuentos = void 0;
const client_1 = require("@prisma/client");
const date_helper_1 = require("@/utils/date.helper");
const descuentos_constants_1 = require("@/constants/descuentos.constants");
const prisma = new client_1.PrismaClient();
class MotorReglasDescuentos {
    constructor(prismaClient) {
        this.prisma = prismaClient || prisma;
    }
    async aplicarReglas(cuotaId, personaId, itemsCuota) {
        const config = await this.getConfiguracionActiva();
        if (!config || !config.activa) {
            return {
                itemsDescuento: [],
                aplicaciones: [],
                totalDescuento: 0,
                porcentajeTotalAplicado: 0
            };
        }
        const reglas = await this.getReglasActivas(config.prioridadReglas);
        if (reglas.length === 0) {
            return {
                itemsDescuento: [],
                aplicaciones: [],
                totalDescuento: 0,
                porcentajeTotalAplicado: 0
            };
        }
        const descuentosAplicables = [];
        for (const regla of reglas) {
            const cumpleCondiciones = await this.evaluarCondiciones(regla, personaId);
            if (cumpleCondiciones) {
                const descuento = await this.calcularDescuento(regla, personaId, itemsCuota);
                if (descuento && descuento.porcentaje > 0) {
                    descuentosAplicables.push(descuento);
                }
            }
        }
        if (descuentosAplicables.length === 0) {
            return {
                itemsDescuento: [],
                aplicaciones: [],
                totalDescuento: 0,
                porcentajeTotalAplicado: 0
            };
        }
        const descuentosResueltos = this.resolverConflictos(descuentosAplicables, Number(config.limiteDescuentoTotal), itemsCuota, config);
        const { itemsDescuento, aplicaciones, totalDescuento, porcentajeTotalAplicado } = await this.crearItemsDescuento(cuotaId, descuentosResueltos, itemsCuota);
        return {
            itemsDescuento,
            aplicaciones,
            totalDescuento,
            porcentajeTotalAplicado
        };
    }
    async getConfiguracionActiva() {
        return await this.prisma.configuracionDescuentos.findFirst({
            where: { activa: true },
            orderBy: { id: 'asc' }
        });
    }
    async getReglasActivas(prioridadReglas) {
        if (prioridadReglas && prioridadReglas.length > 0) {
            const reglas = await this.prisma.reglaDescuento.findMany({
                where: {
                    id: { in: prioridadReglas },
                    activa: true
                }
            });
            return reglas.sort((a, b) => {
                return prioridadReglas.indexOf(a.id) - prioridadReglas.indexOf(b.id);
            });
        }
        return await this.prisma.reglaDescuento.findMany({
            where: { activa: true },
            orderBy: { prioridad: 'asc' }
        });
    }
    async evaluarCondiciones(regla, personaId) {
        const condiciones = regla.condiciones;
        switch (condiciones.type) {
            case 'categoria':
                return await this.evaluarCondicionCategoria(personaId, condiciones);
            case 'relacion_familiar':
                return await this.evaluarCondicionFamiliar(personaId, condiciones);
            case 'cantidad_actividades':
                return await this.evaluarCondicionActividades(personaId, condiciones);
            case 'antiguedad':
                return await this.evaluarCondicionAntiguedad(personaId, condiciones);
            case 'personalizado':
                return await this.evaluarCondicionPersonalizada(personaId, condiciones);
            default:
                console.warn(`Tipo de condición desconocido: ${condiciones.type}`);
                return false;
        }
    }
    async evaluarCondicionCategoria(personaId, condiciones) {
        const personaTipo = await this.prisma.personaTipo.findFirst({
            where: {
                personaId,
                activo: true,
                tipoPersona: { codigo: 'SOCIO' }
            },
            include: {
                categoria: true
            }
        });
        if (!personaTipo || !personaTipo.categoria) {
            return false;
        }
        const categoriasPermitidas = condiciones.categorias || [];
        return categoriasPermitidas.includes(personaTipo.categoria.codigo);
    }
    async evaluarCondicionFamiliar(personaId, condiciones) {
        const count = await this.prisma.familiar.count({
            where: {
                socioId: personaId,
                activo: condiciones.activa !== false
            }
        });
        return count > 0;
    }
    async evaluarCondicionActividades(personaId, condiciones) {
        const count = await this.prisma.participacion_actividades.count({
            where: {
                personaId: personaId,
                activa: true
            }
        });
        const minimo = condiciones.minimo || 0;
        const maximo = condiciones.maximo || Number.MAX_SAFE_INTEGER;
        return count >= minimo && count <= maximo;
    }
    async evaluarCondicionAntiguedad(personaId, condiciones) {
        const personaTipo = await this.prisma.personaTipo.findFirst({
            where: {
                personaId,
                activo: true,
                tipoPersona: { codigo: 'SOCIO' }
            }
        });
        if (!personaTipo || !personaTipo.fechaIngreso) {
            return false;
        }
        const fechaIngreso = new Date(personaTipo.fechaIngreso);
        const ahora = new Date();
        const mesesAntiguedad = (0, date_helper_1.calcularMesesEntreFechas)(fechaIngreso, ahora);
        const mesesMinimo = condiciones.mesesMinimo || 0;
        return mesesAntiguedad >= mesesMinimo;
    }
    async evaluarCondicionPersonalizada(personaId, condiciones) {
        console.warn('Condiciones personalizadas no implementadas aún');
        return false;
    }
    async calcularDescuento(regla, personaId, itemsCuota) {
        const formula = regla.formula;
        let porcentaje = 0;
        let metadata = {};
        switch (formula.type) {
            case 'porcentaje_fijo':
                porcentaje = formula.porcentaje || 0;
                metadata = { tipo: 'fijo', valor: porcentaje };
                break;
            case 'porcentaje_desde_bd':
                porcentaje = await this.obtenerPorcentajeDesdeDB(personaId, formula);
                metadata = { tipo: 'desde_bd', fuente: formula.fuente, campo: formula.campo };
                break;
            case 'escalado':
                porcentaje = await this.calcularDescuentoEscalado(personaId, formula);
                metadata = { tipo: 'escalado', reglas: formula.reglas };
                break;
            case 'personalizado':
                porcentaje = await this.ejecutarFuncionPersonalizada(personaId, formula, itemsCuota);
                metadata = { tipo: 'personalizado', funcion: formula.funcion };
                break;
            default:
                console.warn(`Tipo de fórmula desconocido: ${formula.type}`);
                return null;
        }
        if (porcentaje <= 0) {
            return null;
        }
        const montoBase = this.calcularMontoBase(itemsCuota, regla);
        const montoCalculado = (montoBase * porcentaje) / 100;
        return {
            regla,
            porcentaje,
            montoBase,
            montoCalculado,
            metadata
        };
    }
    async obtenerPorcentajeDesdeDB(personaId, formula) {
        if (formula.fuente === 'categorias_socios') {
            const personaTipo = await this.prisma.personaTipo.findFirst({
                where: {
                    personaId,
                    activo: true,
                    tipoPersona: { codigo: 'SOCIO' }
                },
                include: {
                    categoria: true
                }
            });
            if (!personaTipo || !personaTipo.categoria) {
                return 0;
            }
            return Number(personaTipo.categoria.descuento || 0);
        }
        return 0;
    }
    async calcularDescuentoEscalado(personaId, formula) {
        const count = await this.prisma.participacion_actividades.count({
            where: {
                personaId: personaId,
                activa: true
            }
        });
        const reglas = formula.reglas || [];
        for (const regla of reglas) {
            try {
                const condicion = regla.condicion.replace(/actividades/g, count.toString());
                if (eval(condicion)) {
                    return regla.descuento;
                }
            }
            catch (error) {
                console.error('Error evaluando condición escalada:', error);
            }
        }
        return 0;
    }
    async ejecutarFuncionPersonalizada(personaId, formula, itemsCuota) {
        const funcion = formula.funcion;
        switch (funcion) {
            case 'calcularMaximoDescuentoFamiliar':
                return await this.calcularMaximoDescuentoFamiliar(personaId);
            case 'calcularDescuentoPorAntiguedad':
                return await this.calcularDescuentoPorAntiguedad(personaId);
            default:
                console.warn(`Función personalizada desconocida: ${funcion}`);
                return 0;
        }
    }
    async calcularMaximoDescuentoFamiliar(personaId) {
        const familiares = await this.prisma.familiar.findMany({
            where: {
                socioId: personaId,
                activo: true
            }
        });
        if (familiares.length === 0) {
            return 0;
        }
        const descuentos = familiares.map(f => Number(f.descuento || 0));
        return Math.max(...descuentos);
    }
    async calcularDescuentoPorAntiguedad(personaId) {
        const personaTipo = await this.prisma.personaTipo.findFirst({
            where: {
                personaId,
                activo: true,
                tipoPersona: { codigo: 'SOCIO' }
            }
        });
        if (!personaTipo || !personaTipo.fechaIngreso) {
            return 0;
        }
        const fechaIngreso = new Date(personaTipo.fechaIngreso);
        const ahora = new Date();
        const anios = (0, date_helper_1.calcularAniosEntreFechas)(fechaIngreso, ahora);
        return Math.min(anios, descuentos_constants_1.MAX_ANIOS_ANTIGUEDAD_DESCUENTO);
    }
    calcularMontoBase(itemsCuota, regla) {
        return itemsCuota
            .filter(item => {
            const esBase = item.tipoItem.categoriaItem.codigo === 'BASE';
            const esActividad = item.tipoItem.categoriaItem.codigo === 'ACTIVIDAD';
            if (esBase && !regla.aplicarABase)
                return false;
            if (esActividad && !regla.aplicarAActividades)
                return false;
            return true;
        })
            .reduce((sum, item) => sum + Number(item.monto), 0);
    }
    resolverConflictos(descuentos, limiteGlobal, itemsCuota, config) {
        const resueltos = [];
        const grupos = this.agruparPorModo(descuentos);
        const acumulativos = grupos.ACUMULATIVO || [];
        if (acumulativos.length > 0) {
            const porcentajeTotal = acumulativos.reduce((sum, d) => sum + d.porcentaje, 0);
            const montoTotal = acumulativos.reduce((sum, d) => sum + d.montoCalculado, 0);
            resueltos.push({
                reglaId: acumulativos[0].regla.id,
                nombreRegla: `Descuentos acumulativos (${acumulativos.length})`,
                porcentaje: Math.min(porcentajeTotal, limiteGlobal),
                monto: montoTotal,
                itemsAfectados: this.getItemsAfectados(itemsCuota, acumulativos[0].regla),
                metadata: {
                    modo: 'ACUMULATIVO',
                    reglasAplicadas: acumulativos.map(d => ({
                        id: d.regla.id,
                        codigo: d.regla.codigo,
                        porcentaje: d.porcentaje
                    }))
                }
            });
        }
        const exclusivos = grupos.EXCLUSIVO || [];
        if (exclusivos.length > 0) {
            const mayor = exclusivos.reduce((max, d) => d.porcentaje > max.porcentaje ? d : max);
            resueltos.push({
                reglaId: mayor.regla.id,
                nombreRegla: mayor.regla.nombre,
                porcentaje: Math.min(mayor.porcentaje, limiteGlobal),
                monto: mayor.montoCalculado,
                itemsAfectados: this.getItemsAfectados(itemsCuota, mayor.regla),
                metadata: {
                    modo: 'EXCLUSIVO',
                    reglaAplicada: {
                        id: mayor.regla.id,
                        codigo: mayor.regla.codigo,
                        porcentaje: mayor.porcentaje
                    }
                }
            });
        }
        const maximos = grupos.MAXIMO || [];
        for (const desc of maximos) {
            const limite = Number(desc.regla.maxDescuento) || limiteGlobal;
            resueltos.push({
                reglaId: desc.regla.id,
                nombreRegla: desc.regla.nombre,
                porcentaje: Math.min(desc.porcentaje, limite, limiteGlobal),
                monto: desc.montoCalculado,
                itemsAfectados: this.getItemsAfectados(itemsCuota, desc.regla),
                metadata: {
                    modo: 'MAXIMO',
                    limiteRegla: limite,
                    reglaAplicada: {
                        id: desc.regla.id,
                        codigo: desc.regla.codigo,
                        porcentaje: desc.porcentaje
                    }
                }
            });
        }
        const personalizados = grupos.PERSONALIZADO || [];
        for (const desc of personalizados) {
            resueltos.push({
                reglaId: desc.regla.id,
                nombreRegla: desc.regla.nombre,
                porcentaje: Math.min(desc.porcentaje, limiteGlobal),
                monto: desc.montoCalculado,
                itemsAfectados: this.getItemsAfectados(itemsCuota, desc.regla),
                metadata: {
                    modo: 'PERSONALIZADO',
                    reglaAplicada: {
                        id: desc.regla.id,
                        codigo: desc.regla.codigo,
                        porcentaje: desc.porcentaje
                    }
                }
            });
        }
        return resueltos;
    }
    agruparPorModo(descuentos) {
        const grupos = {};
        for (const descuento of descuentos) {
            const modo = descuento.regla.modoAplicacion;
            if (!grupos[modo]) {
                grupos[modo] = [];
            }
            grupos[modo].push(descuento);
        }
        return grupos;
    }
    getItemsAfectados(itemsCuota, regla) {
        return itemsCuota
            .filter(item => {
            const esBase = item.tipoItem.categoriaItem.codigo === 'BASE';
            const esActividad = item.tipoItem.categoriaItem.codigo === 'ACTIVIDAD';
            if (esBase && regla.aplicarABase)
                return true;
            if (esActividad && regla.aplicarAActividades)
                return true;
            return false;
        })
            .map(item => item.id);
    }
    async crearItemsDescuento(cuotaId, descuentos, itemsCuota) {
        const itemsDescuento = [];
        const aplicaciones = [];
        const tipoDescuento = await this.prisma.tipoItemCuota.findFirst({
            where: {
                categoriaItem: { codigo: 'DESCUENTO' },
                activo: true
            }
        });
        if (!tipoDescuento) {
            console.warn('No se encontró tipo de item de descuento');
            return {
                itemsDescuento: [],
                aplicaciones: [],
                totalDescuento: 0,
                porcentajeTotalAplicado: 0
            };
        }
        let totalDescuento = 0;
        let totalPorcentaje = 0;
        for (const descuento of descuentos) {
            itemsDescuento.push({
                tipoItemId: tipoDescuento.id,
                concepto: descuento.nombreRegla,
                monto: -Math.abs(descuento.monto),
                cantidad: 1,
                porcentaje: descuento.porcentaje,
                esAutomatico: true,
                esEditable: false,
                metadata: descuento.metadata
            });
            aplicaciones.push({
                reglaId: descuento.reglaId,
                porcentajeAplicado: descuento.porcentaje,
                montoDescuento: descuento.monto,
                metadata: descuento.metadata
            });
            totalDescuento += descuento.monto;
            totalPorcentaje += descuento.porcentaje;
        }
        return {
            itemsDescuento,
            aplicaciones,
            totalDescuento,
            porcentajeTotalAplicado: totalPorcentaje
        };
    }
}
exports.MotorReglasDescuentos = MotorReglasDescuentos;
exports.default = MotorReglasDescuentos;
//# sourceMappingURL=motor-reglas-descuentos.service.js.map