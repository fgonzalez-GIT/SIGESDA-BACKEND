"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarSolapamientoHorarios = validarSolapamientoHorarios;
exports.detectarConflictosHorarios = detectarConflictosHorarios;
exports.sugerirAulasDisponibles = sugerirAulasDisponibles;
exports.actividadTieneHorarios = actividadTieneHorarios;
exports.getResumenOcupacionAula = getResumenOcupacionAula;
function validarSolapamientoHorarios(horario1, horario2) {
    if (horario1.diaSemanaId !== horario2.diaSemanaId) {
        return false;
    }
    const [h1InicioH, h1InicioM] = horario1.horaInicio.split(':').map(Number);
    const [h1FinH, h1FinM] = horario1.horaFin.split(':').map(Number);
    const [h2InicioH, h2InicioM] = horario2.horaInicio.split(':').map(Number);
    const [h2FinH, h2FinM] = horario2.horaFin.split(':').map(Number);
    const h1InicioMinutos = h1InicioH * 60 + h1InicioM;
    const h1FinMinutos = h1FinH * 60 + h1FinM;
    const h2InicioMinutos = h2InicioH * 60 + h2InicioM;
    const h2FinMinutos = h2FinH * 60 + h2FinM;
    return h1InicioMinutos < h2FinMinutos && h1FinMinutos > h2InicioMinutos;
}
async function detectarConflictosHorarios(prisma, aulaId, horariosActividad, actividadIdExcluir) {
    const conflictos = [];
    for (const horario of horariosActividad) {
        const asignacionesOtrasActividades = await prisma.actividades_aulas.findMany({
            where: {
                aulaId,
                activa: true,
                ...(actividadIdExcluir && {
                    actividadId: { not: actividadIdExcluir }
                })
            },
            include: {
                actividades: {
                    include: {
                        horarios_actividades: {
                            where: {
                                activo: true,
                                diaSemanaId: horario.diaSemanaId
                            }
                        }
                    }
                },
                aulas: {
                    select: {
                        id: true,
                        nombre: true
                    }
                }
            }
        });
        for (const asignacion of asignacionesOtrasActividades) {
            for (const horarioActividad of asignacion.actividades.horarios_actividades) {
                if (validarSolapamientoHorarios(horario, {
                    diaSemanaId: horarioActividad.diaSemanaId,
                    horaInicio: horarioActividad.horaInicio,
                    horaFin: horarioActividad.horaFin
                })) {
                    const diaSemana = await prisma.dias_semana.findUnique({
                        where: { id: horario.diaSemanaId }
                    });
                    conflictos.push({
                        tipo: 'ACTIVIDAD',
                        id: asignacion.actividadId,
                        nombre: asignacion.actividades.nombre,
                        diaSemana: diaSemana?.nombre || 'N/A',
                        diaSemanaId: horario.diaSemanaId,
                        horaInicio: horarioActividad.horaInicio,
                        horaFin: horarioActividad.horaFin,
                        aulaId: asignacion.aulaId,
                        aulaNombre: asignacion.aulas.nombre
                    });
                }
            }
        }
        const diaSemanaData = await prisma.dias_semana.findUnique({
            where: { id: horario.diaSemanaId }
        });
        if (diaSemanaData) {
            const reservasPuntuales = await prisma.reserva_aulas.findMany({
                where: {
                    aulaId,
                    activa: true,
                    fechaFin: { gte: new Date() }
                },
                include: {
                    aulas: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    },
                    actividades: {
                        select: {
                            nombre: true
                        }
                    }
                }
            });
            for (const reserva of reservasPuntuales) {
                const diaReserva = reserva.fechaInicio.getDay();
                if (diaReserva + 1 === diaSemanaData.orden) {
                    const horaInicioReserva = `${reserva.fechaInicio.getHours().toString().padStart(2, '0')}:${reserva.fechaInicio.getMinutes().toString().padStart(2, '0')}`;
                    const horaFinReserva = `${reserva.fechaFin.getHours().toString().padStart(2, '0')}:${reserva.fechaFin.getMinutes().toString().padStart(2, '0')}`;
                    if (validarSolapamientoHorarios(horario, {
                        diaSemanaId: horario.diaSemanaId,
                        horaInicio: horaInicioReserva,
                        horaFin: horaFinReserva
                    })) {
                        conflictos.push({
                            tipo: 'RESERVA',
                            id: reserva.id,
                            nombre: reserva.actividades?.nombre || 'Reserva puntual',
                            diaSemana: diaSemanaData.nombre,
                            diaSemanaId: horario.diaSemanaId,
                            horaInicio: horaInicioReserva,
                            horaFin: horaFinReserva,
                            aulaId: reserva.aulaId,
                            aulaNombre: reserva.aulas.nombre
                        });
                    }
                }
            }
        }
        const reservasSecciones = await prisma.reservas_aulas_secciones.findMany({
            where: {
                aulaId,
                diaSemana: diaSemanaData?.nombre || ''
            },
            include: {
                aulas: {
                    select: {
                        id: true,
                        nombre: true
                    }
                },
                secciones_actividades: {
                    select: {
                        nombre: true
                    }
                }
            }
        });
        for (const reservaSeccion of reservasSecciones) {
            if (validarSolapamientoHorarios(horario, {
                diaSemanaId: horario.diaSemanaId,
                horaInicio: reservaSeccion.horaInicio,
                horaFin: reservaSeccion.horaFin
            })) {
                conflictos.push({
                    tipo: 'SECCION',
                    id: reservaSeccion.id,
                    nombre: reservaSeccion.secciones_actividades.nombre,
                    diaSemana: reservaSeccion.diaSemana,
                    diaSemanaId: horario.diaSemanaId,
                    horaInicio: reservaSeccion.horaInicio,
                    horaFin: reservaSeccion.horaFin,
                    aulaId: reservaSeccion.aulaId,
                    aulaNombre: reservaSeccion.aulas.nombre
                });
            }
        }
    }
    return conflictos;
}
async function sugerirAulasDisponibles(prisma, actividadId, criterios) {
    const actividad = await prisma.actividades.findUnique({
        where: { id: actividadId },
        include: {
            horarios_actividades: {
                where: { activo: true }
            },
            participacion_actividades: {
                where: { activa: true }
            }
        }
    });
    if (!actividad) {
        throw new Error(`Actividad con ID ${actividadId} no encontrada`);
    }
    const participantesActuales = actividad.participacion_actividades.length;
    const capacidadRequerida = criterios?.capacidadMinima || participantesActuales || actividad.capacidadMaxima || 1;
    const where = {
        activa: true,
        capacidad: { gte: capacidadRequerida }
    };
    if (criterios?.tipoAulaId) {
        where.tipoAulaId = criterios.tipoAulaId;
    }
    const aulas = await prisma.aula.findMany({
        where,
        include: {
            tipoAula: true,
            aulas_equipamientos: {
                include: {
                    equipamiento: true
                }
            }
        },
        orderBy: [
            { capacidad: 'asc' }
        ]
    });
    const aulasDisponibles = [];
    for (const aula of aulas) {
        const conflictos = await detectarConflictosHorarios(prisma, aula.id, actividad.horarios_actividades.map(h => ({
            diaSemanaId: h.diaSemanaId,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin
        })), actividadId);
        let tieneEquipamientoRequerido = true;
        if (criterios?.equipamientoRequerido && criterios.equipamientoRequerido.length > 0) {
            const equipamientosAula = aula.aulas_equipamientos.map(ae => ae.equipamientoId);
            tieneEquipamientoRequerido = criterios.equipamientoRequerido.every(eq => equipamientosAula.includes(eq));
        }
        aulasDisponibles.push({
            aula: {
                id: aula.id,
                nombre: aula.nombre,
                capacidad: aula.capacidad,
                ubicacion: aula.ubicacion,
                tipoAula: aula.tipoAula
            },
            disponible: conflictos.length === 0,
            conflictos: conflictos.length > 0 ? conflictos : undefined,
            capacidadSuficiente: aula.capacidad >= capacidadRequerida,
            tieneEquipamientoRequerido,
            score: calcularScoreAula(aula, participantesActuales, conflictos.length, tieneEquipamientoRequerido)
        });
    }
    return aulasDisponibles.sort((a, b) => b.score - a.score);
}
function calcularScoreAula(aula, participantesActuales, numConflictos, tieneEquipamiento) {
    let score = 100;
    score -= numConflictos * 50;
    const capacidadExtra = aula.capacidad - participantesActuales;
    if (capacidadExtra > 20) {
        score -= capacidadExtra * 0.5;
    }
    if (tieneEquipamiento) {
        score += 20;
    }
    return Math.max(0, score);
}
async function actividadTieneHorarios(prisma, actividadId) {
    const count = await prisma.horarios_actividades.count({
        where: {
            actividadId,
            activo: true
        }
    });
    return count > 0;
}
async function getResumenOcupacionAula(prisma, aulaId) {
    const [actividadesActivas, totalActividades, reservasPuntuales, seccionesActivas] = await Promise.all([
        prisma.actividades_aulas.count({
            where: { aulaId, activa: true }
        }),
        prisma.actividades_aulas.count({
            where: { aulaId }
        }),
        prisma.reserva_aulas.count({
            where: {
                aulaId,
                activa: true,
                fechaFin: { gte: new Date() }
            }
        }),
        prisma.reservas_aulas_secciones.count({
            where: { aulaId }
        })
    ]);
    return {
        actividadesActivas,
        totalActividades,
        reservasPuntuales,
        seccionesActivas,
        totalAsignaciones: actividadesActivas + reservasPuntuales + seccionesActivas
    };
}
//# sourceMappingURL=actividad-aula.helper.js.map