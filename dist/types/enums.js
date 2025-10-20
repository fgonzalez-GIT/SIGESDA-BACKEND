"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = exports.HttpStatus = exports.EstadoRecibo = exports.TipoParentesco = exports.MedioPagoTipo = exports.TipoRecibo = exports.TipoActividad = exports.TipoPersona = void 0;
var client_1 = require("@prisma/client");
Object.defineProperty(exports, "TipoPersona", { enumerable: true, get: function () { return client_1.TipoPersona; } });
Object.defineProperty(exports, "TipoActividad", { enumerable: true, get: function () { return client_1.TipoActividad; } });
Object.defineProperty(exports, "TipoRecibo", { enumerable: true, get: function () { return client_1.TipoRecibo; } });
Object.defineProperty(exports, "MedioPagoTipo", { enumerable: true, get: function () { return client_1.MedioPagoTipo; } });
Object.defineProperty(exports, "TipoParentesco", { enumerable: true, get: function () { return client_1.TipoParentesco; } });
Object.defineProperty(exports, "EstadoRecibo", { enumerable: true, get: function () { return client_1.EstadoRecibo; } });
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