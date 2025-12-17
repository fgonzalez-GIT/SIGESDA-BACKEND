/**
 * Date Helper Utilities
 *
 * Funciones reutilizables para manipulación de fechas.
 * Utiliza date-fns para cálculos precisos.
 */

import {
  differenceInMonths,
  differenceInYears,
  addMonths,
  isFuture,
  isPast,
  startOfDay
} from 'date-fns';

/**
 * Nombres de meses en español
 */
const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Obtiene el nombre del mes en español
 *
 * @param mes - Número del mes (1-12)
 * @returns Nombre del mes en español
 *
 * @example
 * getNombreMes(1)  // Returns: 'Enero'
 * getNombreMes(12) // Returns: 'Diciembre'
 */
export function getNombreMes(mes: number): string {
  if (mes < 1 || mes > 12) {
    throw new Error(`Mes inválido: ${mes}. Debe estar entre 1 y 12`);
  }
  return NOMBRES_MESES[mes - 1];
}

/**
 * Calcula la cantidad de meses entre dos fechas
 *
 * @param fecha1 - Fecha de inicio
 * @param fecha2 - Fecha de fin
 * @returns Cantidad de meses de diferencia
 *
 * @example
 * calcularMesesEntreFechas(new Date('2023-01-01'), new Date('2023-06-01'))
 * // Returns: 5
 */
export function calcularMesesEntreFechas(fecha1: Date, fecha2: Date): number {
  return Math.abs(differenceInMonths(fecha2, fecha1));
}

/**
 * Calcula la cantidad de años entre dos fechas
 *
 * @param fecha1 - Fecha de inicio
 * @param fecha2 - Fecha de fin
 * @returns Cantidad de años de diferencia
 *
 * @example
 * calcularAniosEntreFechas(new Date('2020-01-01'), new Date('2023-01-01'))
 * // Returns: 3
 */
export function calcularAniosEntreFechas(fecha1: Date, fecha2: Date): number {
  return Math.abs(differenceInYears(fecha2, fecha1));
}

/**
 * Calcula la fecha de vencimiento de una cuota
 *
 * Por defecto, el vencimiento es el día 15 del mes siguiente
 *
 * @param mes - Mes de la cuota (1-12)
 * @param anio - Año de la cuota
 * @param dia - Día de vencimiento (opcional, por defecto 15)
 * @returns Fecha de vencimiento
 *
 * @example
 * calcularFechaVencimiento(1, 2024)
 * // Returns: Date('2024-02-15')
 *
 * @example
 * calcularFechaVencimiento(12, 2024, 10)
 * // Returns: Date('2025-01-10')
 */
export function calcularFechaVencimiento(mes: number, anio: number, dia = 15): Date {
  if (mes < 1 || mes > 12) {
    throw new Error(`Mes inválido: ${mes}. Debe estar entre 1 y 12`);
  }

  if (dia < 1 || dia > 31) {
    throw new Error(`Día inválido: ${dia}. Debe estar entre 1 y 31`);
  }

  // Crear fecha del mes de la cuota (día 1)
  const fechaCuota = new Date(anio, mes - 1, 1);

  // Sumar 1 mes para obtener el mes de vencimiento
  const fechaVencimiento = addMonths(fechaCuota, 1);

  // Establecer el día de vencimiento
  fechaVencimiento.setDate(dia);

  return fechaVencimiento;
}

/**
 * Verifica si una fecha es futura
 *
 * @param fecha - Fecha a verificar
 * @returns true si la fecha es futura
 *
 * @example
 * esFechaFutura(new Date('2099-01-01'))
 * // Returns: true
 */
export function esFechaFutura(fecha: Date): boolean {
  return isFuture(startOfDay(fecha));
}

/**
 * Verifica si una fecha es pasada
 *
 * @param fecha - Fecha a verificar
 * @returns true si la fecha es pasada
 *
 * @example
 * esFechaPasada(new Date('2000-01-01'))
 * // Returns: true
 */
export function esFechaPasada(fecha: Date): boolean {
  return isPast(startOfDay(fecha));
}

/**
 * Valida que una fecha de fin sea posterior a una fecha de inicio
 *
 * @param fechaInicio - Fecha de inicio
 * @param fechaFin - Fecha de fin (opcional)
 * @throws Error si fechaFin es anterior a fechaInicio
 *
 * @example
 * validateFechaRange(new Date('2024-01-01'), new Date('2024-12-31'))
 * // No error
 *
 * @example
 * validateFechaRange(new Date('2024-12-31'), new Date('2024-01-01'))
 * // Throws: Error('La fecha de fin debe ser posterior a la fecha de inicio')
 */
export function validateFechaRange(fechaInicio: Date, fechaFin?: Date | null): void {
  if (!fechaFin) {
    return; // Si no hay fecha fin, no validar
  }

  if (fechaFin < fechaInicio) {
    throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
  }
}

/**
 * Formatea una fecha en formato DD/MM/YYYY
 *
 * @param fecha - Fecha a formatear
 * @returns Fecha formateada
 *
 * @example
 * formatearFecha(new Date('2024-01-15'))
 * // Returns: '15/01/2024'
 */
export function formatearFecha(fecha: Date): string {
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

/**
 * Crea una fecha desde mes y año
 *
 * @param mes - Mes (1-12)
 * @param anio - Año
 * @param dia - Día (opcional, por defecto 1)
 * @returns Fecha creada
 *
 * @example
 * crearFechaDesdePeriodo(1, 2024)
 * // Returns: Date('2024-01-01')
 */
export function crearFechaDesdePeriodo(mes: number, anio: number, dia = 1): Date {
  if (mes < 1 || mes > 12) {
    throw new Error(`Mes inválido: ${mes}. Debe estar entre 1 y 12`);
  }

  return new Date(anio, mes - 1, dia);
}
