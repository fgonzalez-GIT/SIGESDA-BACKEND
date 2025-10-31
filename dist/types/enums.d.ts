export { TipoRecibo, MedioPagoTipo, TipoParentesco, EstadoRecibo } from '@prisma/client';
export declare enum TipoPersona {
    SOCIO = "SOCIO",
    NO_SOCIO = "NO_SOCIO",
    DOCENTE = "DOCENTE",
    PROVEEDOR = "PROVEEDOR"
}
export declare enum TipoActividad {
    CORO = "CORO",
    CLASE_CANTO = "CLASE_CANTO",
    CLASE_INSTRUMENTO = "CLASE_INSTRUMENTO"
}
export declare enum DiaSemana {
    LUNES = "LUNES",
    MARTES = "MARTES",
    MIERCOLES = "MIERCOLES",
    JUEVES = "JUEVES",
    VIERNES = "VIERNES",
    SABADO = "SABADO",
    DOMINGO = "DOMINGO"
}
export declare enum HttpStatus {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    INTERNAL_SERVER_ERROR = 500
}
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug"
}
//# sourceMappingURL=enums.d.ts.map