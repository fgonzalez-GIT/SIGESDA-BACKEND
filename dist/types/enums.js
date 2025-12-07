"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = exports.HttpStatus = exports.EstadoEquipamiento = exports.DiaSemana = exports.TipoActividad = exports.TipoPersona = exports.EstadoRecibo = exports.TipoParentesco = exports.MedioPagoTipo = exports.TipoRecibo = void 0;
var client_1 = require("@prisma/client");
Object.defineProperty(exports, "TipoRecibo", { enumerable: true, get: function () { return client_1.TipoRecibo; } });
Object.defineProperty(exports, "MedioPagoTipo", { enumerable: true, get: function () { return client_1.MedioPagoTipo; } });
Object.defineProperty(exports, "TipoParentesco", { enumerable: true, get: function () { return client_1.TipoParentesco; } });
Object.defineProperty(exports, "EstadoRecibo", { enumerable: true, get: function () { return client_1.EstadoRecibo; } });
var TipoPersona;
(function (TipoPersona) {
    TipoPersona["SOCIO"] = "SOCIO";
    TipoPersona["NO_SOCIO"] = "NO_SOCIO";
    TipoPersona["DOCENTE"] = "DOCENTE";
    TipoPersona["PROVEEDOR"] = "PROVEEDOR";
})(TipoPersona || (exports.TipoPersona = TipoPersona = {}));
var TipoActividad;
(function (TipoActividad) {
    TipoActividad["CORO"] = "CORO";
    TipoActividad["CLASE_CANTO"] = "CLASE_CANTO";
    TipoActividad["CLASE_INSTRUMENTO"] = "CLASE_INSTRUMENTO";
})(TipoActividad || (exports.TipoActividad = TipoActividad = {}));
var DiaSemana;
(function (DiaSemana) {
    DiaSemana["LUNES"] = "LUNES";
    DiaSemana["MARTES"] = "MARTES";
    DiaSemana["MIERCOLES"] = "MIERCOLES";
    DiaSemana["JUEVES"] = "JUEVES";
    DiaSemana["VIERNES"] = "VIERNES";
    DiaSemana["SABADO"] = "SABADO";
    DiaSemana["DOMINGO"] = "DOMINGO";
})(DiaSemana || (exports.DiaSemana = DiaSemana = {}));
var EstadoEquipamiento;
(function (EstadoEquipamiento) {
    EstadoEquipamiento["NUEVO"] = "NUEVO";
    EstadoEquipamiento["USADO"] = "USADO";
    EstadoEquipamiento["EN_REPARACION"] = "EN_REPARACION";
    EstadoEquipamiento["ROTO"] = "ROTO";
    EstadoEquipamiento["DADO_DE_BAJA"] = "DADO_DE_BAJA";
})(EstadoEquipamiento || (exports.EstadoEquipamiento = EstadoEquipamiento = {}));
var HttpStatus;
(function (HttpStatus) {
    HttpStatus[HttpStatus["OK"] = 200] = "OK";
    HttpStatus[HttpStatus["CREATED"] = 201] = "CREATED";
    HttpStatus[HttpStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatus[HttpStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatus[HttpStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatus[HttpStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatus[HttpStatus["CONFLICT"] = 409] = "CONFLICT";
    HttpStatus[HttpStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(HttpStatus || (exports.HttpStatus = HttpStatus = {}));
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
//# sourceMappingURL=enums.js.map