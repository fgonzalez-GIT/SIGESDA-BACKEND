"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarConflictoHorarioSchema = exports.queryActividadesPorDiaYHoraSchema = exports.queryHorariosSchema = exports.createMultiplesHorariosSchema = exports.updateHorarioActividadSchema = exports.createHorarioActividadSchema = void 0;
const zod_1 = require("zod");
const horarioActividadBaseSchema = zod_1.z.object({
    actividadId: zod_1.z.number()
        .int('El ID de actividad debe ser un número entero')
        .positive('El ID de actividad debe ser positivo'),
    diaSemanaId: zod_1.z.number()
        .int('El ID de día de semana debe ser un número entero')
        .positive('El ID de día de semana debe ser positivo'),
    horaInicio: zod_1.z.string()
        .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
        message: 'Formato de hora inválido. Use HH:MM o HH:MM:SS (ej: 09:00 o 09:00:00)'
    }),
    horaFin: zod_1.z.string()
        .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
        message: 'Formato de hora inválido. Use HH:MM o HH:MM:SS (ej: 11:00 o 11:00:00)'
    }),
    activo: zod_1.z.boolean().default(true)
});
exports.createHorarioActividadSchema = horarioActividadBaseSchema.refine((data) => {
    const horaInicio = data.horaInicio.length === 5 ? `${data.horaInicio}:00` : data.horaInicio;
    const horaFin = data.horaFin.length === 5 ? `${data.horaFin}:00` : data.horaFin;
    const [inicioHora, inicioMin] = horaInicio.split(':').map(Number);
    const [finHora, finMin] = horaFin.split(':').map(Number);
    const inicioMinutos = inicioHora * 60 + inicioMin;
    const finMinutos = finHora * 60 + finMin;
    return finMinutos > inicioMinutos;
}, {
    message: 'La hora de fin debe ser posterior a la hora de inicio'
});
exports.updateHorarioActividadSchema = horarioActividadBaseSchema
    .omit({ actividadId: true })
    .partial()
    .refine((data) => {
    if (!data.horaInicio || !data.horaFin)
        return true;
    const horaInicio = data.horaInicio.length === 5 ? `${data.horaInicio}:00` : data.horaInicio;
    const horaFin = data.horaFin.length === 5 ? `${data.horaFin}:00` : data.horaFin;
    const [inicioHora, inicioMin] = horaInicio.split(':').map(Number);
    const [finHora, finMin] = horaFin.split(':').map(Number);
    const inicioMinutos = inicioHora * 60 + inicioMin;
    const finMinutos = finHora * 60 + finMin;
    return finMinutos > inicioMinutos;
}, {
    message: 'La hora de fin debe ser posterior a la hora de inicio'
});
exports.createMultiplesHorariosSchema = zod_1.z.object({
    actividadId: zod_1.z.number().int().positive(),
    horarios: zod_1.z.array(horarioActividadBaseSchema.omit({ actividadId: true }).refine((data) => {
        const horaInicio = data.horaInicio.length === 5 ? `${data.horaInicio}:00` : data.horaInicio;
        const horaFin = data.horaFin.length === 5 ? `${data.horaFin}:00` : data.horaFin;
        const [inicioHora, inicioMin] = horaInicio.split(':').map(Number);
        const [finHora, finMin] = horaFin.split(':').map(Number);
        const inicioMinutos = inicioHora * 60 + inicioMin;
        const finMinutos = finHora * 60 + finMin;
        return finMinutos > inicioMinutos;
    }, {
        message: 'La hora de fin debe ser posterior a la hora de inicio'
    })).min(1, 'Debe proporcionar al menos un horario')
});
exports.queryHorariosSchema = zod_1.z.object({
    actividadId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    diaSemanaId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().min(1).max(7).optional()),
    activo: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().optional()),
    page: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 1 : parsed;
    }, zod_1.z.number().int().positive().default(1)),
    limit: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 50 : parsed;
    }, zod_1.z.number().int().positive().max(100).default(50))
});
exports.queryActividadesPorDiaYHoraSchema = zod_1.z.object({
    diaSemanaId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().min(1).max(7)),
    horaInicio: zod_1.z.string()
        .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .optional(),
    horaFin: zod_1.z.string()
        .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .optional(),
    soloActivas: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().default(true))
});
exports.verificarConflictoHorarioSchema = zod_1.z.object({
    actividadId: zod_1.z.number().int().positive().optional(),
    diaSemanaId: zod_1.z.number().int().positive().min(1).max(7),
    horaInicio: zod_1.z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
    horaFin: zod_1.z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
    aulaId: zod_1.z.string().optional(),
    docenteId: zod_1.z.string().optional()
}).refine((data) => {
    const horaInicio = data.horaInicio.length === 5 ? `${data.horaInicio}:00` : data.horaInicio;
    const horaFin = data.horaFin.length === 5 ? `${data.horaFin}:00` : data.horaFin;
    const [inicioHora, inicioMin] = horaInicio.split(':').map(Number);
    const [finHora, finMin] = horaFin.split(':').map(Number);
    const inicioMinutos = inicioHora * 60 + inicioMin;
    const finMinutos = finHora * 60 + finMin;
    return finMinutos > inicioMinutos;
}, {
    message: 'La hora de fin debe ser posterior a la hora de inicio'
});
//# sourceMappingURL=horario-actividad.dto.js.map