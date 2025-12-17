"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePorcentaje = validatePorcentaje;
exports.validateMontoPositivo = validateMontoPositivo;
exports.validateMontoMayorCero = validateMontoMayorCero;
exports.validateArrayNoVacio = validateArrayNoVacio;
exports.validateId = validateId;
exports.validateStringNoVacio = validateStringNoVacio;
exports.validateRango = validateRango;
exports.validateValoresCoinciden = validateValoresCoinciden;
function validatePorcentaje(valor, max = 100, min = 0) {
    if (valor < min || valor > max) {
        throw new Error(`El porcentaje debe estar entre ${min}% y ${max}%`);
    }
}
function validateMontoPositivo(monto, campoNombre = 'monto') {
    if (monto < 0) {
        throw new Error(`El ${campoNombre} debe ser positivo`);
    }
}
function validateMontoMayorCero(monto, campoNombre = 'monto') {
    if (monto <= 0) {
        throw new Error(`El ${campoNombre} debe ser mayor que cero`);
    }
}
function validateArrayNoVacio(array, campoNombre = 'array') {
    if (!array || array.length === 0) {
        throw new Error(`Debe proporcionar al menos un elemento en ${campoNombre}`);
    }
}
function validateId(id, campoNombre = 'ID') {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error(`El ${campoNombre} debe ser un número entero positivo`);
    }
}
function validateStringNoVacio(valor, campoNombre = 'campo', minLength = 1) {
    if (!valor || valor.trim().length === 0) {
        throw new Error(`El ${campoNombre} no puede estar vacío`);
    }
    if (valor.trim().length < minLength) {
        throw new Error(`El ${campoNombre} debe tener al menos ${minLength} caracteres`);
    }
}
function validateRango(valor, min, max, campoNombre = 'valor') {
    if (valor < min || valor > max) {
        throw new Error(`El ${campoNombre} debe estar entre ${min} y ${max}`);
    }
}
function validateValoresCoinciden(valor1, valor2, campo1Nombre = 'valor1', campo2Nombre = 'valor2', tolerancia = 0.01) {
    if (Math.abs(valor1 - valor2) > tolerancia) {
        throw new Error(`El ${campo1Nombre} y el ${campo2Nombre} no coinciden`);
    }
}
//# sourceMappingURL=validation.helper.js.map