// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { ConflictoHorario } from '@/dto/actividad-aula.dto';

export interface Horario {
  diaSemanaId: number;
  horaInicio: string;
  horaFin: string;
}

export interface ConflictoDetallado {
  tipo: 'ACTIVIDAD' | 'RESERVA' | 'SECCION';
  id: number;
  nombre: string;
  diaSemana: string;
  diaSemanaId: number;
  horaInicio: string;
  horaFin: string;
  aulaId: number;
  aulaNombre: string;
}

/**
 * Valida si dos horarios se solapan
 * @param horario1 Primer horario
 * @param horario2 Segundo horario
 * @returns true si hay solapamiento, false si no
 */
export function validarSolapamientoHorarios(horario1: Horario, horario2: Horario): boolean {
  // Si no es el mismo día de la semana, no hay conflicto
  if (horario1.diaSemanaId !== horario2.diaSemanaId) {
    return false;
  }

  // Convertir horas a minutos para comparación más fácil
  const [h1InicioH, h1InicioM] = horario1.horaInicio.split(':').map(Number);
  const [h1FinH, h1FinM] = horario1.horaFin.split(':').map(Number);
  const [h2InicioH, h2InicioM] = horario2.horaInicio.split(':').map(Number);
  const [h2FinH, h2FinM] = horario2.horaFin.split(':').map(Number);

  const h1InicioMinutos = h1InicioH * 60 + h1InicioM;
  const h1FinMinutos = h1FinH * 60 + h1FinM;
  const h2InicioMinutos = h2InicioH * 60 + h2InicioM;
  const h2FinMinutos = h2FinH * 60 + h2FinM;

  // Verificar overlap: (inicio1 < fin2) AND (fin1 > inicio2)
  return h1InicioMinutos < h2FinMinutos && h1FinMinutos > h2InicioMinutos;
}

/**
 * Detecta TODOS los conflictos horarios para una actividad en un aula específica
 * Revisa: actividades_aulas, reserva_aulas, reservas_aulas_secciones
 *
 * @param prisma Cliente de Prisma
 * @param aulaId ID del aula a verificar
 * @param horariosActividad Horarios de la actividad
 * @param actividadIdExcluir ID de actividad a excluir (para edición)
 * @returns Array de conflictos detallados
 */
export async function detectarConflictosHorarios(
  prisma: PrismaClient,
  aulaId: number,
  horariosActividad: Horario[],
  actividadIdExcluir?: number
): Promise<ConflictoDetallado[]> {
  const conflictos: ConflictoDetallado[] = [];

  // Para cada horario de la actividad
  for (const horario of horariosActividad) {
    // 1. CONFLICTOS CON OTRAS ACTIVIDADES (actividades_aulas)
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

    // Verificar solapamiento con horarios de cada actividad
    for (const asignacion of asignacionesOtrasActividades) {
      for (const horarioActividad of asignacion.actividades.horarios_actividades) {
        if (validarSolapamientoHorarios(horario, {
          diaSemanaId: horarioActividad.diaSemanaId,
          horaInicio: horarioActividad.horaInicio,
          horaFin: horarioActividad.horaFin
        })) {
          // Obtener nombre del día
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

    // 2. CONFLICTOS CON RESERVAS PUNTUALES (reserva_aulas)
    // Obtener el nombre del día para mapeo
    const diaSemanaData = await prisma.dias_semana.findUnique({
      where: { id: horario.diaSemanaId }
    });

    if (diaSemanaData) {
      // Buscar reservas en ese día de la semana
      // Nota: esto es una simplificación, en producción deberías buscar por fechas específicas
      const reservasPuntuales = await prisma.reserva_aulas.findMany({
        where: {
          aulaId,
          activa: true,
          fechaFin: { gte: new Date() } // Solo reservas futuras
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

      // Filtrar por día y hora
      for (const reserva of reservasPuntuales) {
        // Obtener día de la semana de la reserva
        const diaReserva = reserva.fechaInicio.getDay(); // 0=Domingo, 1=Lunes, etc.

        // Mapeo: dia JS (0-6) a dias_semana.orden
        if (diaReserva + 1 === diaSemanaData.orden) { // Asumiendo que orden empieza en 1
          // Extraer hora de la fecha
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

    // 3. CONFLICTOS CON SECCIONES (reservas_aulas_secciones)
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

/**
 * Sugiere aulas disponibles para una actividad según criterios
 *
 * @param prisma Cliente de Prisma
 * @param actividadId ID de la actividad
 * @param criterios Criterios opcionales de filtrado
 * @returns Array de aulas sugeridas con información de disponibilidad
 */
export async function sugerirAulasDisponibles(
  prisma: PrismaClient,
  actividadId: number,
  criterios?: {
    capacidadMinima?: number;
    tipoAulaId?: number;
    equipamientoRequerido?: number[];
  }
): Promise<any[]> {
  // 1. Obtener la actividad con sus horarios y participantes
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

  // 2. Buscar aulas que cumplan criterios básicos
  const where: any = {
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
      { capacidad: 'asc' } // Priorizar aulas más pequeñas que cumplan requisitos
    ]
  });

  // 3. Para cada aula, verificar disponibilidad horaria
  const aulasDisponibles: any[] = [];

  for (const aula of aulas) {
    const conflictos = await detectarConflictosHorarios(
      prisma,
      aula.id,
      actividad.horarios_actividades.map(h => ({
        diaSemanaId: h.diaSemanaId,
        horaInicio: h.horaInicio,
        horaFin: h.horaFin
      })),
      actividadId
    );

    // 4. Verificar equipamiento requerido (opcional)
    let tieneEquipamientoRequerido = true;
    if (criterios?.equipamientoRequerido && criterios.equipamientoRequerido.length > 0) {
      const equipamientosAula = aula.aulas_equipamientos.map(ae => ae.equipamientoId);
      tieneEquipamientoRequerido = criterios.equipamientoRequerido.every(
        eq => equipamientosAula.includes(eq)
      );
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

  // 5. Ordenar por score (mejores primero)
  return aulasDisponibles.sort((a, b) => b.score - a.score);
}

/**
 * Calcula un score para ordenar aulas sugeridas
 * Score más alto = mejor opción
 */
function calcularScoreAula(
  aula: any,
  participantesActuales: number,
  numConflictos: number,
  tieneEquipamiento: boolean
): number {
  let score = 100;

  // Penalizar conflictos horarios (muy importante)
  score -= numConflictos * 50;

  // Penalizar capacidad excesiva (preferir aulas que se ajusten bien)
  const capacidadExtra = aula.capacidad - participantesActuales;
  if (capacidadExtra > 20) {
    score -= capacidadExtra * 0.5;
  }

  // Bonus por tener equipamiento requerido
  if (tieneEquipamiento) {
    score += 20;
  }

  // Bonus por ubicación (opcional - aquí puedes agregar lógica de preferencias)

  return Math.max(0, score);
}

/**
 * Valida que una actividad tenga horarios definidos
 * @param prisma Cliente de Prisma
 * @param actividadId ID de la actividad
 * @returns true si tiene horarios, false si no
 */
export async function actividadTieneHorarios(
  prisma: PrismaClient,
  actividadId: number
): Promise<boolean> {
  const count = await prisma.horarios_actividades.count({
    where: {
      actividadId,
      activo: true
    }
  });

  return count > 0;
}

/**
 * Obtiene resumen de ocupación de un aula
 * @param prisma Cliente de Prisma
 * @param aulaId ID del aula
 * @returns Resumen con estadísticas de uso
 */
export async function getResumenOcupacionAula(
  prisma: PrismaClient,
  aulaId: number
): Promise<any> {
  const [
    actividadesActivas,
    totalActividades,
    reservasPuntuales,
    seccionesActivas
  ] = await Promise.all([
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
