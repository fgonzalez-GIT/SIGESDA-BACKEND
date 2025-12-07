"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESTADOS_BLOQUEADOS = void 0;
exports.estadoPermiteAsignacion = estadoPermiteAsignacion;
exports.calcularCantidadDisponible = calcularCantidadDisponible;
exports.calcularDisponibilidad = calcularDisponibilidad;
exports.validarAsignacion = validarAsignacion;
exports.getNombreEstado = getNombreEstado;
exports.estaEstadoBloqueado = estaEstadoBloqueado;
const enums_1 = require("@/types/enums");
exports.ESTADOS_BLOQUEADOS = [
    'ROTO',
    'DADO_DE_BAJA',
    'EN_REPARACION'
];
function estadoPermiteAsignacion(estadoCodigo) {
    return !exports.ESTADOS_BLOQUEADOS.includes(estadoCodigo);
}
function calcularCantidadDisponible(equipamiento, asignaciones) {
    const cantidadTotal = equipamiento.cantidad;
    const cantidadAsignada = asignaciones.reduce((sum, asig) => sum + asig.cantidad, 0);
    return cantidadTotal - cantidadAsignada;
}
function calcularDisponibilidad(equipamiento, asignaciones) {
    const cantidadTotal = equipamiento.cantidad;
    const cantidadAsignada = asignaciones.reduce((sum, asig) => sum + asig.cantidad, 0);
    const cantidadDisponible = cantidadTotal - cantidadAsignada;
    const estadoCodigo = equipamiento.estadoEquipamiento?.codigo || null;
    const estadoNombre = equipamiento.estadoEquipamiento?.nombre || null;
    const estadoPermite = estadoCodigo ? estadoPermiteAsignacion(estadoCodigo) : true;
    const tieneDeficit = cantidadDisponible < 0;
    const warnings = [];
    if (tieneDeficit) {
        warnings.push(`Déficit de inventario: ${Math.abs(cantidadDisponible)} unidades sobrepasadas del stock`);
    }
    if (!estadoPermite && estadoCodigo) {
        warnings.push(`Estado "${estadoNombre}" no permite asignación a aulas`);
    }
    if (cantidadDisponible === 0 && !tieneDeficit) {
        warnings.push('Stock agotado: todas las unidades están asignadas');
    }
    return {
        cantidadTotal,
        cantidadAsignada,
        cantidadDisponible,
        estadoCodigo,
        estadoNombre,
        estadoPermiteAsignacion: estadoPermite,
        tieneDeficit,
        warnings
    };
}
function validarAsignacion(equipamiento, cantidadSolicitada, asignaciones) {
    const errors = [];
    const warnings = [];
    if (!equipamiento.activo) {
        errors.push('El equipamiento no está activo');
    }
    const estadoCodigo = equipamiento.estadoEquipamiento?.codigo;
    if (estadoCodigo && !estadoPermiteAsignacion(estadoCodigo)) {
        errors.push(`No se puede asignar equipamiento en estado "${equipamiento.estadoEquipamiento?.nombre}"`);
    }
    const disponibilidad = calcularDisponibilidad(equipamiento, asignaciones);
    const nuevaDisponible = disponibilidad.cantidadDisponible - cantidadSolicitada;
    if (nuevaDisponible < 0) {
        warnings.push(`La asignación generará un déficit de ${Math.abs(nuevaDisponible)} unidades. ` +
            `Disponible: ${disponibilidad.cantidadDisponible}, Solicitado: ${cantidadSolicitada}`);
    }
    return {
        esValido: errors.length === 0,
        errors,
        warnings
    };
}
function getNombreEstado(estadoCodigo) {
    const estados = {
        [enums_1.EstadoEquipamiento.NUEVO]: 'Nuevo',
        [enums_1.EstadoEquipamiento.USADO]: 'Usado',
        [enums_1.EstadoEquipamiento.EN_REPARACION]: 'En Reparación',
        [enums_1.EstadoEquipamiento.ROTO]: 'Roto',
        [enums_1.EstadoEquipamiento.DADO_DE_BAJA]: 'Dado de Baja'
    };
    return estados[estadoCodigo] || 'Desconocido';
}
function estaEstadoBloqueado(estadoCodigo) {
    return exports.ESTADOS_BLOQUEADOS.includes(estadoCodigo);
}
//# sourceMappingURL=equipamiento.helper.js.map