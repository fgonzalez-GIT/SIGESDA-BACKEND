import { z } from 'zod';
import { TipoPersona, TipoActividad } from '@/types/enums';
export declare const commonValidations: {
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    dni: z.ZodString;
    cuit: z.ZodOptional<z.ZodString>;
    decimal: z.ZodEffects<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodString, number, string>]>, number, string | number>;
    positiveInt: z.ZodNumber;
    dateString: z.ZodString;
};
export declare const personaSchemas: {
    create: z.ZodEffects<z.ZodObject<{
        tipo: z.ZodNativeEnum<typeof TipoPersona>;
        nombre: z.ZodString;
        apellido: z.ZodString;
        dni: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
        telefono: z.ZodOptional<z.ZodString>;
        direccion: z.ZodOptional<z.ZodString>;
        fechaNacimiento: z.ZodOptional<z.ZodString>;
        categoria: z.ZodOptional<z.ZodNativeEnum<any>>;
        fechaIngreso: z.ZodOptional<z.ZodString>;
        especialidad: z.ZodOptional<z.ZodString>;
        honorariosPorHora: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodString, number, string>]>, number, string | number>>;
        cuit: z.ZodOptional<z.ZodString>;
        razonSocial: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        [x: string]: any;
        tipo?: unknown;
        nombre?: unknown;
        apellido?: unknown;
        dni?: unknown;
        email?: unknown;
        telefono?: unknown;
        direccion?: unknown;
        fechaNacimiento?: unknown;
        categoria?: unknown;
        fechaIngreso?: unknown;
        especialidad?: unknown;
        honorariosPorHora?: unknown;
        cuit?: unknown;
        razonSocial?: unknown;
    }, {
        [x: string]: any;
        tipo?: unknown;
        nombre?: unknown;
        apellido?: unknown;
        dni?: unknown;
        email?: unknown;
        telefono?: unknown;
        direccion?: unknown;
        fechaNacimiento?: unknown;
        categoria?: unknown;
        fechaIngreso?: unknown;
        especialidad?: unknown;
        honorariosPorHora?: unknown;
        cuit?: unknown;
        razonSocial?: unknown;
    }>, {
        [x: string]: any;
        tipo?: unknown;
        nombre?: unknown;
        apellido?: unknown;
        dni?: unknown;
        email?: unknown;
        telefono?: unknown;
        direccion?: unknown;
        fechaNacimiento?: unknown;
        categoria?: unknown;
        fechaIngreso?: unknown;
        especialidad?: unknown;
        honorariosPorHora?: unknown;
        cuit?: unknown;
        razonSocial?: unknown;
    }, {
        [x: string]: any;
        tipo?: unknown;
        nombre?: unknown;
        apellido?: unknown;
        dni?: unknown;
        email?: unknown;
        telefono?: unknown;
        direccion?: unknown;
        fechaNacimiento?: unknown;
        categoria?: unknown;
        fechaIngreso?: unknown;
        especialidad?: unknown;
        honorariosPorHora?: unknown;
        cuit?: unknown;
        razonSocial?: unknown;
    }>;
    update: z.ZodObject<{
        nombre: z.ZodOptional<z.ZodString>;
        apellido: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        telefono: z.ZodOptional<z.ZodString>;
        direccion: z.ZodOptional<z.ZodString>;
        fechaNacimiento: z.ZodOptional<z.ZodString>;
        categoria: z.ZodOptional<z.ZodNativeEnum<any>>;
        fechaBaja: z.ZodOptional<z.ZodString>;
        motivoBaja: z.ZodOptional<z.ZodString>;
        especialidad: z.ZodOptional<z.ZodString>;
        honorariosPorHora: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodString, number, string>]>, number, string | number>>;
        razonSocial: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        [x: string]: any;
        nombre?: unknown;
        apellido?: unknown;
        email?: unknown;
        telefono?: unknown;
        direccion?: unknown;
        fechaNacimiento?: unknown;
        categoria?: unknown;
        fechaBaja?: unknown;
        motivoBaja?: unknown;
        especialidad?: unknown;
        honorariosPorHora?: unknown;
        razonSocial?: unknown;
    }, {
        [x: string]: any;
        nombre?: unknown;
        apellido?: unknown;
        email?: unknown;
        telefono?: unknown;
        direccion?: unknown;
        fechaNacimiento?: unknown;
        categoria?: unknown;
        fechaBaja?: unknown;
        motivoBaja?: unknown;
        especialidad?: unknown;
        honorariosPorHora?: unknown;
        razonSocial?: unknown;
    }>;
    filter: z.ZodObject<{
        tipo: z.ZodOptional<z.ZodNativeEnum<typeof TipoPersona>>;
        categoria: z.ZodOptional<z.ZodNativeEnum<any>>;
        activo: z.ZodOptional<z.ZodBoolean>;
        search: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        [x: string]: any;
        tipo?: unknown;
        categoria?: unknown;
        activo?: unknown;
        search?: unknown;
    }, {
        [x: string]: any;
        tipo?: unknown;
        categoria?: unknown;
        activo?: unknown;
        search?: unknown;
    }>;
};
export declare const actividadSchemas: {
    create: z.ZodObject<{
        nombre: z.ZodString;
        tipo: z.ZodNativeEnum<typeof TipoActividad>;
        descripcion: z.ZodOptional<z.ZodString>;
        precio: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodString, number, string>]>, number, string | number>>;
        duracion: z.ZodOptional<z.ZodNumber>;
        capacidadMaxima: z.ZodOptional<z.ZodNumber>;
        docenteIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        nombre: string;
        tipo: TipoActividad;
        precio: number;
        descripcion?: string | undefined;
        capacidadMaxima?: number | undefined;
        duracion?: number | undefined;
        docenteIds?: string[] | undefined;
    }, {
        nombre: string;
        tipo: TipoActividad;
        descripcion?: string | undefined;
        capacidadMaxima?: number | undefined;
        precio?: string | number | undefined;
        duracion?: number | undefined;
        docenteIds?: string[] | undefined;
    }>;
    update: z.ZodObject<{
        nombre: z.ZodOptional<z.ZodString>;
        descripcion: z.ZodOptional<z.ZodString>;
        precio: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodString, number, string>]>, number, string | number>>;
        duracion: z.ZodOptional<z.ZodNumber>;
        capacidadMaxima: z.ZodOptional<z.ZodNumber>;
        activa: z.ZodOptional<z.ZodBoolean>;
        docenteIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        nombre?: string | undefined;
        descripcion?: string | undefined;
        activa?: boolean | undefined;
        capacidadMaxima?: number | undefined;
        precio?: number | undefined;
        duracion?: number | undefined;
        docenteIds?: string[] | undefined;
    }, {
        nombre?: string | undefined;
        descripcion?: string | undefined;
        activa?: boolean | undefined;
        capacidadMaxima?: number | undefined;
        precio?: string | number | undefined;
        duracion?: number | undefined;
        docenteIds?: string[] | undefined;
    }>;
    filter: z.ZodObject<{
        tipo: z.ZodOptional<z.ZodNativeEnum<typeof TipoActividad>>;
        activa: z.ZodOptional<z.ZodBoolean>;
        conDocente: z.ZodOptional<z.ZodBoolean>;
        search: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        search?: string | undefined;
        tipo?: TipoActividad | undefined;
        activa?: boolean | undefined;
        conDocente?: boolean | undefined;
    }, {
        search?: string | undefined;
        tipo?: TipoActividad | undefined;
        activa?: boolean | undefined;
        conDocente?: boolean | undefined;
    }>;
};
export declare const participacionSchemas: {
    create: z.ZodEffects<z.ZodObject<{
        personaId: z.ZodString;
        actividadId: z.ZodString;
        fechaInicio: z.ZodString;
        fechaFin: z.ZodOptional<z.ZodString>;
        precioEspecial: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodString, number, string>]>, number, string | number>>;
        observaciones: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        personaId: string;
        actividadId: string;
        fechaInicio: string;
        observaciones?: string | undefined;
        fechaFin?: string | undefined;
        precioEspecial?: number | undefined;
    }, {
        personaId: string;
        actividadId: string;
        fechaInicio: string;
        observaciones?: string | undefined;
        fechaFin?: string | undefined;
        precioEspecial?: string | number | undefined;
    }>, {
        personaId: string;
        actividadId: string;
        fechaInicio: string;
        observaciones?: string | undefined;
        fechaFin?: string | undefined;
        precioEspecial?: number | undefined;
    }, {
        personaId: string;
        actividadId: string;
        fechaInicio: string;
        observaciones?: string | undefined;
        fechaFin?: string | undefined;
        precioEspecial?: string | number | undefined;
    }>;
    update: z.ZodObject<{
        fechaFin: z.ZodOptional<z.ZodString>;
        precioEspecial: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodString, number, string>]>, number, string | number>>;
        activa: z.ZodOptional<z.ZodBoolean>;
        observaciones: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        observaciones?: string | undefined;
        fechaFin?: string | undefined;
        precioEspecial?: number | undefined;
        activa?: boolean | undefined;
    }, {
        observaciones?: string | undefined;
        fechaFin?: string | undefined;
        precioEspecial?: string | number | undefined;
        activa?: boolean | undefined;
    }>;
};
export declare const reciboSchemas: {
    create: z.ZodObject<{
        tipo: z.ZodNativeEnum<{
            CUOTA: "CUOTA";
            SUELDO: "SUELDO";
            DEUDA: "DEUDA";
            PAGO_ACTIVIDAD: "PAGO_ACTIVIDAD";
        }>;
        importe: z.ZodEffects<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodString, number, string>]>, number, string | number>;
        fechaVencimiento: z.ZodOptional<z.ZodString>;
        concepto: z.ZodString;
        observaciones: z.ZodOptional<z.ZodString>;
        emisorId: z.ZodOptional<z.ZodString>;
        receptorId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        tipo: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD";
        importe: number;
        concepto: string;
        observaciones?: string | undefined;
        fechaVencimiento?: string | undefined;
        emisorId?: string | undefined;
        receptorId?: string | undefined;
    }, {
        tipo: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD";
        importe: string | number;
        concepto: string;
        observaciones?: string | undefined;
        fechaVencimiento?: string | undefined;
        emisorId?: string | undefined;
        receptorId?: string | undefined;
    }>;
    update: z.ZodObject<{
        fechaVencimiento: z.ZodOptional<z.ZodString>;
        concepto: z.ZodOptional<z.ZodString>;
        observaciones: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        observaciones?: string | undefined;
        fechaVencimiento?: string | undefined;
        concepto?: string | undefined;
    }, {
        observaciones?: string | undefined;
        fechaVencimiento?: string | undefined;
        concepto?: string | undefined;
    }>;
    filter: z.ZodObject<{
        tipo: z.ZodOptional<z.ZodNativeEnum<{
            CUOTA: "CUOTA";
            SUELDO: "SUELDO";
            DEUDA: "DEUDA";
            PAGO_ACTIVIDAD: "PAGO_ACTIVIDAD";
        }>>;
        fechaDesde: z.ZodOptional<z.ZodString>;
        fechaHasta: z.ZodOptional<z.ZodString>;
        personaId: z.ZodOptional<z.ZodString>;
        search: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        search?: string | undefined;
        tipo?: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD" | undefined;
        personaId?: string | undefined;
        fechaDesde?: string | undefined;
        fechaHasta?: string | undefined;
    }, {
        search?: string | undefined;
        tipo?: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD" | undefined;
        personaId?: string | undefined;
        fechaDesde?: string | undefined;
        fechaHasta?: string | undefined;
    }>;
};
export declare const medioPagoSchemas: {
    create: z.ZodObject<{
        reciboId: z.ZodString;
        tipo: z.ZodNativeEnum<{
            EFECTIVO: "EFECTIVO";
            TRANSFERENCIA: "TRANSFERENCIA";
            TARJETA_DEBITO: "TARJETA_DEBITO";
            TARJETA_CREDITO: "TARJETA_CREDITO";
            CHEQUE: "CHEQUE";
        }>;
        importe: z.ZodEffects<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodString, number, string>]>, number, string | number>;
        numero: z.ZodOptional<z.ZodString>;
        banco: z.ZodOptional<z.ZodString>;
        observaciones: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        tipo: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE";
        importe: number;
        reciboId: string;
        observaciones?: string | undefined;
        numero?: string | undefined;
        banco?: string | undefined;
    }, {
        tipo: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE";
        importe: string | number;
        reciboId: string;
        observaciones?: string | undefined;
        numero?: string | undefined;
        banco?: string | undefined;
    }>;
};
export declare const aulaSchemas: {
    create: z.ZodObject<{
        nombre: z.ZodString;
        capacidad: z.ZodNumber;
        ubicacion: z.ZodOptional<z.ZodString>;
        equipamiento: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        nombre: string;
        capacidad: number;
        equipamiento?: string | undefined;
        ubicacion?: string | undefined;
    }, {
        nombre: string;
        capacidad: number;
        equipamiento?: string | undefined;
        ubicacion?: string | undefined;
    }>;
    update: z.ZodObject<{
        nombre: z.ZodOptional<z.ZodString>;
        capacidad: z.ZodOptional<z.ZodNumber>;
        ubicacion: z.ZodOptional<z.ZodString>;
        equipamiento: z.ZodOptional<z.ZodString>;
        activa: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        equipamiento?: string | undefined;
        nombre?: string | undefined;
        activa?: boolean | undefined;
        capacidad?: number | undefined;
        ubicacion?: string | undefined;
    }, {
        equipamiento?: string | undefined;
        nombre?: string | undefined;
        activa?: boolean | undefined;
        capacidad?: number | undefined;
        ubicacion?: string | undefined;
    }>;
};
export declare const reservaSchemas: {
    create: z.ZodEffects<z.ZodEffects<z.ZodObject<{
        aulaId: z.ZodString;
        actividadId: z.ZodOptional<z.ZodString>;
        docenteId: z.ZodString;
        fechaInicio: z.ZodString;
        fechaFin: z.ZodString;
        observaciones: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        docenteId: string;
        fechaInicio: string;
        fechaFin: string;
        aulaId: string;
        observaciones?: string | undefined;
        actividadId?: string | undefined;
    }, {
        docenteId: string;
        fechaInicio: string;
        fechaFin: string;
        aulaId: string;
        observaciones?: string | undefined;
        actividadId?: string | undefined;
    }>, {
        docenteId: string;
        fechaInicio: string;
        fechaFin: string;
        aulaId: string;
        observaciones?: string | undefined;
        actividadId?: string | undefined;
    }, {
        docenteId: string;
        fechaInicio: string;
        fechaFin: string;
        aulaId: string;
        observaciones?: string | undefined;
        actividadId?: string | undefined;
    }>, {
        docenteId: string;
        fechaInicio: string;
        fechaFin: string;
        aulaId: string;
        observaciones?: string | undefined;
        actividadId?: string | undefined;
    }, {
        docenteId: string;
        fechaInicio: string;
        fechaFin: string;
        aulaId: string;
        observaciones?: string | undefined;
        actividadId?: string | undefined;
    }>;
};
//# sourceMappingURL=validators.d.ts.map