#!/usr/bin/env tsx
/**
 * Prueba End-to-End Completa del Módulo de Actividades V2.0
 *
 * Simula un flujo completo de usuario desde la creación hasta la eliminación:
 * 1. Crear actividad con horarios
 * 2. Consultar actividad
 * 3. Agregar horarios adicionales
 * 4. Actualizar datos de actividad
 * 5. Cambiar estado
 * 6. Consultar estadísticas
 * 7. Consultar reportes
 * 8. Duplicar actividad
 * 9. Eliminar actividad duplicada
 */

const BASE_URL = 'http://localhost:8000/api/actividades';

interface StepResult {
  step: number;
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message?: string;
  duration: number;
}

const results: StepResult[] = [];
let actividadId: number;
let actividadDuplicadaId: number;

async function fetchJSON(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();
  return { response, data };
}

async function step(stepNumber: number, name: string, fn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    results.push({ step: stepNumber, name, status: 'PASS', duration });
    console.log(`✅ PASO ${stepNumber}: ${name} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - start;
    const message = error instanceof Error ? error.message : String(error);
    results.push({ step: stepNumber, name, status: 'FAIL', message, duration });
    console.log(`❌ PASO ${stepNumber}: ${name} (${duration}ms)`);
    console.log(`   Error: ${message}`);
    throw error; // Stop execution on error
  }
}

async function main() {
  console.log('\n🎯 PRUEBA END-TO-END - MÓDULO DE ACTIVIDADES V2.0\n');
  console.log('═'.repeat(70));
  console.log('\nSimulando flujo completo de administración de actividades\n');

  try {
    // ========== PASO 1: Obtener catálogos necesarios ==========
    await step(1, 'Obtener catálogos (tipos, categorías, estados, días, roles)', async () => {
      const { response, data } = await fetchJSON(`${BASE_URL}/catalogos/todos`);

      if (response.status !== 200 || !data.success) {
        throw new Error('No se pudieron obtener los catálogos');
      }

      if (!data.data.tipos || data.data.tipos.length === 0) {
        throw new Error('No hay tipos de actividades disponibles');
      }

      console.log(`   → ${data.data.tipos.length} tipos, ${data.data.categorias.length} categorías, ${data.data.estados.length} estados`);
    });

    // ========== PASO 2: Crear actividad con horarios ==========
    await step(2, 'Crear actividad completa con horarios', async () => {
      const { data: catalogosData } = await fetchJSON(`${BASE_URL}/catalogos/todos`);
      const catalogos = catalogosData.data;

      const payload = {
        codigoActividad: `E2E-TEST-${Date.now()}`,
        nombre: 'Taller de Teatro E2E',
        tipoActividadId: catalogos.tipos[0].id,
        categoriaId: catalogos.categorias[0].id,
        estadoId: catalogos.estados[0].id,
        descripcion: 'Taller de teatro para adultos mayores - Prueba E2E',
        fechaDesde: new Date().toISOString(),
        fechaHasta: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 días después
        cupoMaximo: 25,
        costo: 1500,
        horarios: [
          {
            diaSemanaId: catalogos.diasSemana[1].id, // Martes
            horaInicio: '10:00',
            horaFin: '12:00',
            activo: true
          },
          {
            diaSemanaId: catalogos.diasSemana[3].id, // Jueves
            horaInicio: '10:00',
            horaFin: '12:00',
            activo: true
          }
        ]
      };

      const { response, data } = await fetchJSON(BASE_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response.status !== 201 || !data.success || !data.data.id) {
        throw new Error('No se pudo crear la actividad');
      }

      actividadId = data.data.id;
      console.log(`   → Actividad creada con ID: ${actividadId}`);
      console.log(`   → Código: ${data.data.codigo_actividad}`);
      console.log(`   → ${data.data.horarios_actividades?.length || 0} horarios agregados`);
    });

    // ========== PASO 3: Consultar actividad creada ==========
    await step(3, 'Consultar actividad por ID', async () => {
      const { response, data } = await fetchJSON(`${BASE_URL}/${actividadId}`);

      if (response.status !== 200 || !data.success) {
        throw new Error('No se pudo consultar la actividad');
      }

      if (data.data.nombre !== 'Taller de Teatro E2E') {
        throw new Error('El nombre de la actividad no coincide');
      }

      console.log(`   → Nombre: ${data.data.nombre}`);
      console.log(`   → Estado: ${data.data.estados_actividades.nombre}`);
      console.log(`   → Cupo: ${data.data.cupo_maximo} personas`);
    });

    // ========== PASO 4: Agregar horario adicional ==========
    await step(4, 'Agregar horario adicional (Viernes)', async () => {
      const { data: catalogosData } = await fetchJSON(`${BASE_URL}/catalogos/todos`);
      const diasSemana = catalogosData.data.diasSemana;

      const payload = {
        diaSemanaId: diasSemana[4].id, // Viernes
        horaInicio: '15:00',
        horaFin: '17:00',
        activo: true
      };

      const { response, data } = await fetchJSON(`${BASE_URL}/${actividadId}/horarios`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response.status !== 201 || !data.success) {
        throw new Error('No se pudo agregar el horario');
      }

      console.log(`   → Nuevo horario agregado: Viernes 15:00-17:00`);
    });

    // ========== PASO 5: Verificar horarios ==========
    await step(5, 'Verificar horarios de la actividad', async () => {
      const { response, data } = await fetchJSON(`${BASE_URL}/${actividadId}/horarios`);

      if (response.status !== 200 || !data.success) {
        throw new Error('No se pudieron consultar los horarios');
      }

      if (!Array.isArray(data.data) || data.data.length !== 3) {
        throw new Error(`Se esperaban 3 horarios, se encontraron ${data.data.length}`);
      }

      console.log(`   → ${data.data.length} horarios confirmados`);
    });

    // ========== PASO 6: Actualizar datos de actividad ==========
    await step(6, 'Actualizar datos de actividad', async () => {
      const payload = {
        descripcion: 'Taller de teatro para adultos mayores - ACTUALIZADO - Incluye presentación final',
        costo: 1800,
        cupoMaximo: 30
      };

      const { response, data } = await fetchJSON(`${BASE_URL}/${actividadId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      if (response.status !== 200 || !data.success) {
        throw new Error('No se pudo actualizar la actividad');
      }

      console.log(`   → Descripción actualizada`);
      console.log(`   → Nuevo costo: $${data.data.costo}`);
      console.log(`   → Nuevo cupo: ${data.data.cupo_maximo}`);
    });

    // ========== PASO 7: Consultar estadísticas ==========
    await step(7, 'Consultar estadísticas de actividad', async () => {
      const { response, data } = await fetchJSON(`${BASE_URL}/${actividadId}/estadisticas`);

      if (response.status !== 200 || !data.success) {
        throw new Error('No se pudieron consultar las estadísticas');
      }

      console.log(`   → Total participantes: ${data.data.totalParticipantes}`);
      console.log(`   → Total horarios: ${data.data.totalHorarios}`);
      console.log(`   → Total docentes: ${data.data.totalDocentes}`);
    });

    // ========== PASO 8: Consultar resumen por tipo ==========
    await step(8, 'Consultar reporte de resumen por tipo', async () => {
      const { response, data } = await fetchJSON(`${BASE_URL}/reportes/por-tipo`);

      if (response.status !== 200 || !data.success) {
        throw new Error('No se pudo consultar el reporte');
      }

      const tipos = data.data.length;
      const totalActividades = data.data.reduce((sum: number, t: any) => sum + t.totalActividades, 0);

      console.log(`   → ${tipos} tipos de actividades`);
      console.log(`   → ${totalActividades} actividades totales`);
    });

    // ========== PASO 9: Consultar horario semanal ==========
    await step(9, 'Consultar horario semanal completo', async () => {
      const { response, data } = await fetchJSON(`${BASE_URL}/reportes/horario-semanal`);

      if (response.status !== 200 || !data.success) {
        throw new Error('No se pudo consultar el horario semanal');
      }

      console.log(`   → Horario semanal generado exitosamente`);
      console.log(`   → Fecha generación: ${data.data.generadoEn}`);
    });

    // ========== PASO 10: Cambiar estado de actividad ==========
    await step(10, 'Cambiar estado de actividad a INACTIVA', async () => {
      const { data: catalogosData } = await fetchJSON(`${BASE_URL}/catalogos/estados`);
      const estados = catalogosData.data;
      const estadoInactivo = estados.find((e: any) => e.codigo === 'INACTIVA');

      if (!estadoInactivo) {
        throw new Error('No se encontró el estado INACTIVA');
      }

      const payload = {
        nuevoEstadoId: estadoInactivo.id,
        observaciones: 'Actividad pausada temporalmente - Prueba E2E'
      };

      const { response, data } = await fetchJSON(`${BASE_URL}/${actividadId}/estado`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      if (response.status !== 200 || !data.success) {
        throw new Error('No se pudo cambiar el estado');
      }

      console.log(`   → Estado cambiado: ${data.data.estados_actividades.nombre}`);
    });

    // ========== PASO 11: Duplicar actividad ==========
    await step(11, 'Duplicar actividad para nueva edición', async () => {
      const payload = {
        nuevoCodigoActividad: `E2E-DUP-${Date.now()}`,
        nuevoNombre: 'Taller de Teatro E2E - Edición 2',
        nuevaFechaDesde: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 días después
        nuevaFechaHasta: new Date(Date.now() + 210 * 24 * 60 * 60 * 1000).toISOString(), // 210 días después
        copiarHorarios: true,
        copiarDocentes: false
      };

      const { response, data } = await fetchJSON(`${BASE_URL}/${actividadId}/duplicar`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response.status !== 201 || !data.success || !data.data.id) {
        throw new Error('No se pudo duplicar la actividad');
      }

      actividadDuplicadaId = data.data.id;
      console.log(`   → Actividad duplicada con ID: ${actividadDuplicadaId}`);
      console.log(`   → Nuevo código: ${data.data.codigo_actividad}`);
    });

    // ========== PASO 12: Verificar duplicación de horarios ==========
    await step(12, 'Verificar que los horarios se copiaron', async () => {
      const { response, data } = await fetchJSON(`${BASE_URL}/${actividadDuplicadaId}/horarios`);

      if (response.status !== 200 || !data.success) {
        throw new Error('No se pudieron consultar los horarios de la duplicación');
      }

      if (!Array.isArray(data.data) || data.data.length !== 3) {
        throw new Error(`Se esperaban 3 horarios copiados, se encontraron ${data.data.length}`);
      }

      console.log(`   → ${data.data.length} horarios copiados correctamente`);
    });

    // ========== PASO 13: Consultar actividad por código ==========
    await step(13, 'Consultar actividad duplicada por código', async () => {
      const { data: actividadData } = await fetchJSON(`${BASE_URL}/${actividadDuplicadaId}`);
      const codigo = actividadData.data.codigo_actividad;

      const { response, data } = await fetchJSON(`${BASE_URL}/codigo/${codigo}`);

      if (response.status !== 200 || !data.success) {
        throw new Error('No se pudo consultar por código');
      }

      if (data.data.id !== actividadDuplicadaId) {
        throw new Error('El ID no coincide con la actividad esperada');
      }

      console.log(`   → Actividad encontrada por código: ${codigo}`);
    });

    // ========== PASO 14: Listar actividades con filtros ==========
    await step(14, 'Listar actividades con filtros y paginación', async () => {
      const { response, data } = await fetchJSON(`${BASE_URL}?page=1&limit=20&incluirRelaciones=true&orderBy=nombre&orderDir=asc`);

      if (response.status !== 200 || !data.success) {
        throw new Error('No se pudieron listar las actividades');
      }

      if (!data.data.data || !Array.isArray(data.data.data)) {
        throw new Error('Formato de respuesta inválido');
      }

      console.log(`   → ${data.data.total} actividades encontradas`);
      console.log(`   → Página ${data.data.page} de ${data.data.pages}`);
    });

    // ========== PASO 15: Eliminar actividad duplicada ==========
    await step(15, 'Eliminar actividad duplicada', async () => {
      const { response, data } = await fetchJSON(`${BASE_URL}/${actividadDuplicadaId}`, {
        method: 'DELETE',
      });

      if (response.status !== 200 || !data.success) {
        throw new Error('No se pudo eliminar la actividad duplicada');
      }

      // Verificar que realmente se eliminó
      const { response: getResponse } = await fetchJSON(`${BASE_URL}/${actividadDuplicadaId}`);

      if (getResponse.status !== 404) {
        throw new Error('La actividad no fue eliminada correctamente');
      }

      console.log(`   → Actividad duplicada eliminada (ID: ${actividadDuplicadaId})`);
    });

    // ========== PASO 16: Volver a activar la actividad original ==========
    await step(16, 'Reactivar actividad original', async () => {
      const { data: catalogosData } = await fetchJSON(`${BASE_URL}/catalogos/estados`);
      const estados = catalogosData.data;
      const estadoActivo = estados.find((e: any) => e.codigo === 'ACTIVA');

      if (!estadoActivo) {
        throw new Error('No se encontró el estado ACTIVA');
      }

      const payload = {
        nuevoEstadoId: estadoActivo.id,
        observaciones: 'Actividad reactivada - Prueba E2E completada'
      };

      const { response, data } = await fetchJSON(`${BASE_URL}/${actividadId}/estado`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      if (response.status !== 200 || !data.success) {
        throw new Error('No se pudo reactivar la actividad');
      }

      console.log(`   → Actividad reactivada exitosamente`);
    });

    // ========== PASO 17: Limpieza - Eliminar actividad de prueba ==========
    await step(17, 'Limpieza: Eliminar actividad de prueba', async () => {
      const { response, data } = await fetchJSON(`${BASE_URL}/${actividadId}`, {
        method: 'DELETE',
      });

      if (response.status !== 200 || !data.success) {
        throw new Error('No se pudo eliminar la actividad de prueba');
      }

      console.log(`   → Actividad de prueba eliminada (ID: ${actividadId})`);
    });

    // ========== RESUMEN ==========
    console.log('\n' + '═'.repeat(70));

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const total = results.length;
    const totalTime = results.reduce((sum, r) => sum + r.duration, 0);

    console.log('\n📊 RESUMEN DE PRUEBA END-TO-END:\n');
    console.log(`  Total de pasos:  ${total}`);
    console.log(`  Exitosos:        ${passed} ✅`);
    console.log(`  Fallidos:        ${failed} ❌`);
    console.log(`  Tiempo total:    ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);

    if (failed === 0) {
      console.log('\n✅ FLUJO END-TO-END COMPLETADO EXITOSAMENTE\n');
      console.log('  El módulo de Actividades V2.0 funciona correctamente:');
      console.log('  ✓ Creación de actividades con horarios');
      console.log('  ✓ Consultas individuales y listados');
      console.log('  ✓ Actualización de datos');
      console.log('  ✓ Gestión de horarios');
      console.log('  ✓ Cambio de estados');
      console.log('  ✓ Consultas de estadísticas y reportes');
      console.log('  ✓ Duplicación de actividades');
      console.log('  ✓ Eliminación de actividades');
      console.log('  ✓ Integridad de datos mantenida\n');
    }

  } catch (error) {
    console.log('\n' + '═'.repeat(70));
    console.error('\n❌ ERROR EN PRUEBA END-TO-END:', error);

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const total = results.length;

    console.log('\n📊 RESUMEN PARCIAL:\n');
    console.log(`  Pasos completados antes del error: ${passed}/${total}`);

    if (failed > 0) {
      console.log('\n❌ PASOS FALLIDOS:\n');
      results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  Paso ${r.step}: ${r.name}`);
        console.log(`  ${r.message}\n`);
      });
    }

    process.exit(1);
  }
}

main();
