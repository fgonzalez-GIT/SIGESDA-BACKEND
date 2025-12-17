"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNombreMes = getNombreMes;
exports.calcularMesesEntreFechas = calcularMesesEntreFechas;
exports.calcularAniosEntreFechas = calcularAniosEntreFechas;
exports.calcularFechaVencimiento = calcularFechaVencimiento;
exports.esFechaFutura = esFechaFutura;
exports.esFechaPasada = esFechaPasada;
exports.validateFechaRange = validateFechaRange;
exports.formatearFecha = formatearFecha;
exports.crearFechaDesdePeriodo = crearFechaDesdePeriodo;
const date_fns_1 = require("date-fns");
const NOMBRES_MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
function getNombreMes(mes) {
    if (mes < 1 || mes > 12) {
        throw new Error(`Mes inválido: ${mes}. Debe estar entre 1 y 12`);
    }
    return NOMBRES_MESES[mes - 1];
}
function calcularMesesEntreFechas(fecha1, fecha2) {
    return Math.abs((0, date_fns_1.differenceInMonths)(fecha2, fecha1));
}
function calcularAniosEntreFechas(fecha1, fecha2) {
    return Math.abs((0, date_fns_1.differenceInYears)(fecha2, fecha1));
}
function calcularFechaVencimiento(mes, anio, dia = 15) {
    if (mes < 1 || mes > 12) {
        throw new Error(`Mes inválido: ${mes}. Debe estar entre 1 y 12`);
    }
    if (dia < 1 || dia > 31) {
        throw new Error(`Día inválido: ${dia}. Debe estar entre 1 y 31`);
    }
    const fechaCuota = new Date(anio, mes - 1, 1);
    const fechaVencimiento = (0, date_fns_1.addMonths)(fechaCuota, 1);
    fechaVencimiento.setDate(dia);
    return fechaVencimiento;
}
function esFechaFutura(fecha) {
    return (0, date_fns_1.isFuture)((0, date_fns_1.startOfDay)(fecha));
}
function esFechaPasada(fecha) {
    return (0, date_fns_1.isPast)((0, date_fns_1.startOfDay)(fecha));
}
function validateFechaRange(fechaInicio, fechaFin) {
    if (!fechaFin) {
        return;
    }
    if (fechaFin < fechaInicio) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }
}
function formatearFecha(fecha) {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}
function crearFechaDesdePeriodo(mes, anio, dia = 1) {
    if (mes < 1 || mes > 12) {
        throw new Error(`Mes inválido: ${mes}. Debe estar entre 1 y 12`);
    }
    return new Date(anio, mes - 1, dia);
}
//# sourceMappingURL=date.helper.js.map