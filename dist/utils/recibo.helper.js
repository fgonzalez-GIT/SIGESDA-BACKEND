"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateReciboPagado = validateReciboPagado;
exports.validateReciboEditable = validateReciboEditable;
exports.canDeleteRecibo = canDeleteRecibo;
exports.validateCanDeleteRecibo = validateCanDeleteRecibo;
exports.isReciboVencido = isReciboVencido;
exports.isReciboPendiente = isReciboPendiente;
exports.getEstadoSugeridoRecibo = getEstadoSugeridoRecibo;
const client_1 = require("@prisma/client");
function validateReciboPagado(recibo, operacion) {
    if (recibo.estado === client_1.EstadoRecibo.PAGADO) {
        throw new Error(`No se puede ${operacion} un recibo pagado`);
    }
}
function validateReciboEditable(recibo) {
    const estadosEditables = [client_1.EstadoRecibo.PENDIENTE, client_1.EstadoRecibo.VENCIDO];
    if (!estadosEditables.includes(recibo.estado)) {
        throw new Error(`El recibo no es editable en su estado actual: ${recibo.estado}`);
    }
}
function canDeleteRecibo(recibo) {
    if (recibo.estado === client_1.EstadoRecibo.PAGADO) {
        return {
            canDelete: false,
            reason: 'No se puede eliminar un recibo pagado'
        };
    }
    if (recibo.mediosPago && recibo.mediosPago.length > 0) {
        return {
            canDelete: false,
            reason: 'No se puede eliminar un recibo que tiene medios de pago registrados'
        };
    }
    return { canDelete: true };
}
function validateCanDeleteRecibo(recibo) {
    const result = canDeleteRecibo(recibo);
    if (!result.canDelete) {
        throw new Error(result.reason || 'No se puede eliminar el recibo');
    }
}
function isReciboVencido(recibo, fechaReferencia = new Date()) {
    if (!recibo.fechaVencimiento) {
        return false;
    }
    if (recibo.estado === client_1.EstadoRecibo.PAGADO) {
        return false;
    }
    return recibo.fechaVencimiento < fechaReferencia;
}
function isReciboPendiente(recibo) {
    return recibo.estado === client_1.EstadoRecibo.PENDIENTE || recibo.estado === client_1.EstadoRecibo.VENCIDO;
}
function getEstadoSugeridoRecibo(recibo, fechaReferencia = new Date()) {
    if (recibo.estado === client_1.EstadoRecibo.PAGADO) {
        return client_1.EstadoRecibo.PAGADO;
    }
    if (isReciboVencido(recibo, fechaReferencia)) {
        return client_1.EstadoRecibo.VENCIDO;
    }
    return client_1.EstadoRecibo.PENDIENTE;
}
//# sourceMappingURL=recibo.helper.js.map