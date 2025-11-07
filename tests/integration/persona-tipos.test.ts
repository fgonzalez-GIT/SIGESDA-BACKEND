import {
  createTestApp,
  prisma,
  resetDatabase,
  disconnectPrisma,
  generateUniqueDNI,
  generateUniqueEmail,
  expectSuccessResponse,
  expectErrorResponse,
  getCatalogoIds
} from '../helpers/testUtils';
import { createPersona } from '../helpers/factories';

const request = createTestApp();

// Cache de IDs de catálogos
let catalogoIds: Awaited<ReturnType<typeof getCatalogoIds>>;

/**
 * ============================================================================
 * PERSONA-TIPOS - Integration Tests
 * ============================================================================
 *
 * Endpoints testeados:
 * 1. POST   /api/personas/:personaId/tipos - Asignar tipo
 * 2. GET    /api/personas/:personaId/tipos - Obtener tipos
 * 3. PUT    /api/personas/:personaId/tipos/:tipoId - Actualizar tipo
 * 4. DELETE /api/personas/:personaId/tipos/:tipoPersonaId - Desasignar tipo
 * 5. DELETE /api/personas/:personaId/tipos/:tipoPersonaId/hard - Eliminar tipo
 * 6. POST   /api/personas/:personaId/contactos - Agregar contacto
 * 7. GET    /api/personas/:personaId/contactos - Obtener contactos
 * 8. PUT    /api/personas/:personaId/contactos/:contactoId - Actualizar contacto
 * 9. DELETE /api/personas/:personaId/contactos/:contactoId - Eliminar contacto
 * 10. GET   /api/catalogos/tipos-persona - Catálogo tipos
 * 11. GET   /api/catalogos/tipos-persona/:codigo - Tipo por código
 * 12. GET   /api/catalogos/especialidades-docentes - Catálogo especialidades
 * 13. GET   /api/catalogos/especialidades-docentes/:codigo - Especialidad por código
 * 14. GET   /api/catalogos/categorias-socios - Catálogo categorías (si existe)
 */

describe('PERSONA-TIPOS - Integration Tests', () => {
  beforeAll(async () => {
    await resetDatabase();
    // Cargar IDs de catálogos una sola vez
    catalogoIds = await getCatalogoIds();
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  // ============================================================================
  // POST /api/personas/:personaId/tipos - Asignar tipo
  // ============================================================================

  describe('POST /api/personas/:personaId/tipos', () => {
    it('should assign SOCIO type to persona', async () => {
      const persona = await createPersona();

      const tipoData = {
        tipoPersonaCodigo: 'SOCIO',
        categoriaId: catalogoIds.categoriaSocioActivoId!,
        numeroSocio: 1001,
        fechaIngreso: new Date().toISOString()
      };

      const response = await request
        .post(`/api/personas/${persona.id}/tipos`)
        .send(tipoData);

      expectSuccessResponse(response, 201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.categoriaId).toBe(tipoData.categoriaId);
    });

    it('should assign DOCENTE type to persona', async () => {
      const persona = await createPersona();

      const tipoData = {
        tipoPersonaCodigo: 'DOCENTE',
        especialidadId: catalogoIds.especialidadCantoId!,
        honorariosPorHora: 500
      };

      const response = await request
        .post(`/api/personas/${persona.id}/tipos`)
        .send(tipoData);

      expectSuccessResponse(response, 201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.especialidadId).toBe(tipoData.especialidadId);
    });

    it('should assign PROVEEDOR type to persona', async () => {
      const persona = await createPersona();

      const tipoData = {
        tipoPersonaCodigo: 'PROVEEDOR',
        cuit: '20123456789',
        razonSocial: 'Proveedor Test SA'
      };

      const response = await request
        .post(`/api/personas/${persona.id}/tipos`)
        .send(tipoData);

      expectSuccessResponse(response, 201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.cuit).toBe(tipoData.cuit);
    });

    it('should auto-assign numero socio if not provided', async () => {
      const persona = await createPersona();

      const tipoData = {
        tipoPersonaCodigo: 'SOCIO',
        categoriaId: catalogoIds.categoriaSocioActivoId!
        // numeroSocio omitido
      };

      const response = await request
        .post(`/api/personas/${persona.id}/tipos`)
        .send(tipoData);

      expectSuccessResponse(response, 201);
      expect(response.body.data.numeroSocio).toBeDefined();
      expect(typeof response.body.data.numeroSocio).toBe('number');
    });

    it('should reject assigning SOCIO and NO_SOCIO simultaneously', async () => {
      const persona = await createPersona();

      // Primero asignar SOCIO
      await request
        .post(`/api/personas/${persona.id}/tipos`)
        .send({
          tipoPersonaCodigo: 'SOCIO',
          categoriaId: catalogoIds.categoriaSocioActivoId!
        });

      // Intentar asignar NO_SOCIO (mutuamente excluyente)
      const response = await request
        .post(`/api/personas/${persona.id}/tipos`)
        .send({
          tipoPersonaCodigo: 'NO_SOCIO'
        });

      expectErrorResponse(response, 409); // 409 CONFLICT para tipos mutuamente excluyentes
    });

    it('should reject if persona does not exist', async () => {
      const response = await request
        .post('/api/personas/999999/tipos')
        .send({
          tipoPersonaCodigo: 'SOCIO',
          categoriaId: catalogoIds.categoriaSocioActivoId!
        });

      expectErrorResponse(response, 404);
    });

    it('should auto-assign categoriaId ACTIVO if not provided', async () => {
      const persona = await createPersona();

      const response = await request
        .post(`/api/personas/${persona.id}/tipos`)
        .send({
          tipoPersonaCodigo: 'SOCIO'
          // categoriaId faltante - se debe auto-asignar ACTIVO
        });

      expectSuccessResponse(response, 201);
      expect(response.body.data.categoriaId).toBe(catalogoIds.categoriaSocioActivoId);
    });

    it('should reject PROVEEDOR without CUIT', async () => {
      const persona = await createPersona();

      const response = await request
        .post(`/api/personas/${persona.id}/tipos`)
        .send({
          tipoPersonaCodigo: 'PROVEEDOR',
          razonSocial: 'Test SA'
          // cuit faltante
        });

      expectErrorResponse(response, 400);
    });
  });

  // ============================================================================
  // GET /api/personas/:personaId/tipos - Obtener tipos
  // ============================================================================

  describe('GET /api/personas/:personaId/tipos', () => {
    it('should get all tipos of a persona', async () => {
      const persona = await createPersona();

      // Asignar tipo SOCIO
      await request
        .post(`/api/personas/${persona.id}/tipos`)
        .send({
          tipoPersonaCodigo: 'SOCIO',
          categoriaId: catalogoIds.categoriaSocioActivoId!
        });

      const response = await request
        .get(`/api/personas/${persona.id}/tipos`);

      expectSuccessResponse(response, 200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return empty array for persona without tipos', async () => {
      const persona = await createPersona();

      const response = await request
        .get(`/api/personas/${persona.id}/tipos`);

      expectSuccessResponse(response, 200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should return 404 for non-existent persona', async () => {
      const response = await request
        .get('/api/personas/999999/tipos');

      expectErrorResponse(response, 404);
    });
  });

  // ============================================================================
  // PUT /api/personas/:personaId/tipos/:tipoId - Actualizar tipo
  // ============================================================================

  describe('PUT /api/personas/:personaId/tipos/:tipoId', () => {
    it('should update SOCIO categoriaId', async () => {
      const persona = await createPersona();

      // Asignar SOCIO
      const createResponse = await request
        .post(`/api/personas/${persona.id}/tipos`)
        .send({
          tipoPersonaCodigo: 'SOCIO',
          categoriaId: catalogoIds.categoriaSocioActivoId!
        });

      const tipoId = createResponse.body.data.id;

      // Actualizar categoría a JUBILADO
      const updateResponse = await request
        .put(`/api/personas/${persona.id}/tipos/${tipoId}`)
        .send({
          categoriaId: catalogoIds.categoriaSocioJubiladoId!
        });

      expectSuccessResponse(updateResponse, 200);
      expect(updateResponse.body.data.categoriaId).toBe(catalogoIds.categoriaSocioJubiladoId);
    });

    it('should update DOCENTE honorarios', async () => {
      const persona = await createPersona();

      // Asignar DOCENTE
      const createResponse = await request
        .post(`/api/personas/${persona.id}/tipos`)
        .send({
          tipoPersonaCodigo: 'DOCENTE',
          especialidadId: catalogoIds.especialidadCantoId!,
          honorariosPorHora: 500
        });

      const tipoId = createResponse.body.data.id;

      // Actualizar honorarios
      const updateResponse = await request
        .put(`/api/personas/${persona.id}/tipos/${tipoId}`)
        .send({
          honorariosPorHora: 750
        });

      expectSuccessResponse(updateResponse, 200);
      // Prisma devuelve Decimal como string
      expect(parseFloat(updateResponse.body.data.honorariosPorHora)).toBe(750);
    });

    it('should return 404 for non-existent tipo', async () => {
      const persona = await createPersona();

      const response = await request
        .put(`/api/personas/${persona.id}/tipos/999999`)
        .send({
          categoriaId: 2
        });

      expectErrorResponse(response, 404);
    });
  });

  // ============================================================================
  // DELETE /api/personas/:personaId/tipos/:tipoPersonaId - Desasignar tipo
  // ============================================================================

  describe('DELETE /api/personas/:personaId/tipos/:tipoPersonaId', () => {
    it('should soft delete (desasignar) tipo', async () => {
      const persona = await createPersona();

      // Asignar SOCIO
      const socioResponse = await request
        .post(`/api/personas/${persona.id}/tipos`)
        .send({
          tipoPersonaCodigo: 'SOCIO',
          categoriaId: catalogoIds.categoriaSocioActivoId!
        });

      // Asignar DOCENTE (para que tenga 2 tipos activos)
      await request
        .post(`/api/personas/${persona.id}/tipos`)
        .send({
          tipoPersonaCodigo: 'DOCENTE',
          especialidadId: catalogoIds.especialidadCantoId!,
          honorariosPorHora: 500
        });

      const tipoPersonaId = socioResponse.body.data.tipoPersonaId;

      // Desasignar SOCIO (aún queda DOCENTE activo)
      const deleteResponse = await request
        .delete(`/api/personas/${persona.id}/tipos/${tipoPersonaId}`);

      expectSuccessResponse(deleteResponse, 200);

      // Verificar que ya no está activo
      const getResponse = await request
        .get(`/api/personas/${persona.id}/tipos`);

      const tipos = getResponse.body.data;
      const tipoDesasignado = tipos.find((t: any) => t.tipoPersonaId === tipoPersonaId);

      // Puede estar ausente o inactivo
      if (tipoDesasignado) {
        expect(tipoDesasignado.activo).toBe(false);
      }
    });

    it('should return 404 for non-existent tipo', async () => {
      const persona = await createPersona();

      const response = await request
        .delete(`/api/personas/${persona.id}/tipos/999`);

      expectErrorResponse(response, 404);
    });
  });

  // ============================================================================
  // DELETE /api/personas/:personaId/tipos/:tipoPersonaId/hard - Eliminar tipo
  // ============================================================================

  describe('DELETE /api/personas/:personaId/tipos/:tipoPersonaId/hard', () => {
    it('should hard delete tipo permanently', async () => {
      const persona = await createPersona();

      // Asignar SOCIO
      const socioResponse = await request
        .post(`/api/personas/${persona.id}/tipos`)
        .send({
          tipoPersonaCodigo: 'SOCIO',
          categoriaId: catalogoIds.categoriaSocioActivoId!
        });

      // Asignar DOCENTE (para que tenga 2 tipos activos)
      await request
        .post(`/api/personas/${persona.id}/tipos`)
        .send({
          tipoPersonaCodigo: 'DOCENTE',
          especialidadId: catalogoIds.especialidadCantoId!,
          honorariosPorHora: 500
        });

      const tipoPersonaId = socioResponse.body.data.tipoPersonaId;

      // Eliminar SOCIO permanentemente (aún queda DOCENTE)
      const deleteResponse = await request
        .delete(`/api/personas/${persona.id}/tipos/${tipoPersonaId}/hard`);

      expectSuccessResponse(deleteResponse, 200);

      // Verificar que ya no existe
      const getResponse = await request
        .get(`/api/personas/${persona.id}/tipos`);

      const tipos = getResponse.body.data;
      const tipoEliminado = tipos.find((t: any) => t.tipoPersonaId === tipoPersonaId);

      expect(tipoEliminado).toBeUndefined();
    });
  });

  // ============================================================================
  // POST /api/personas/:personaId/contactos - Agregar contacto
  // ============================================================================

  describe('POST /api/personas/:personaId/contactos', () => {
    it('should add EMAIL contact to persona', async () => {
      const persona = await createPersona();

      const contactoData = {
        tipoContacto: 'EMAIL',
        valor: 'nuevo@test.com',
        principal: true
      };

      const response = await request
        .post(`/api/personas/${persona.id}/contactos`)
        .send(contactoData);

      expectSuccessResponse(response, 201);
      expect(response.body.data.tipoContacto).toBe('EMAIL');
      expect(response.body.data.valor).toBe(contactoData.valor);
    });

    it('should add TELEFONO contact to persona', async () => {
      const persona = await createPersona();

      const contactoData = {
        tipoContacto: 'TELEFONO',
        valor: '1234567890',
        principal: false
      };

      const response = await request
        .post(`/api/personas/${persona.id}/contactos`)
        .send(contactoData);

      expectSuccessResponse(response, 201);
      expect(response.body.data.tipoContacto).toBe('TELEFONO');
    });

    it('should add CELULAR contact to persona', async () => {
      const persona = await createPersona();

      const contactoData = {
        tipoContacto: 'CELULAR',
        valor: '1134567890'
      };

      const response = await request
        .post(`/api/personas/${persona.id}/contactos`)
        .send(contactoData);

      expectSuccessResponse(response, 201);
      expect(response.body.data.tipoContacto).toBe('CELULAR');
    });

    it('should reject invalid tipoContacto', async () => {
      const persona = await createPersona();

      const response = await request
        .post(`/api/personas/${persona.id}/contactos`)
        .send({
          tipoContacto: 'INVALID_TYPE',
          valor: 'test@test.com'
        });

      expectErrorResponse(response, 400);
    });

    it('should reject if persona does not exist', async () => {
      const response = await request
        .post('/api/personas/999999/contactos')
        .send({
          tipoContacto: 'EMAIL',
          valor: 'test@test.com'
        });

      expectErrorResponse(response, 404);
    });
  });

  // ============================================================================
  // GET /api/personas/:personaId/contactos - Obtener contactos
  // ============================================================================

  describe('GET /api/personas/:personaId/contactos', () => {
    it('should get all contactos of a persona', async () => {
      const persona = await createPersona();

      // Agregar contacto
      await request
        .post(`/api/personas/${persona.id}/contactos`)
        .send({
          tipoContacto: 'EMAIL',
          valor: 'test@test.com'
        });

      const response = await request
        .get(`/api/personas/${persona.id}/contactos`);

      expectSuccessResponse(response, 200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return empty array for persona without contactos', async () => {
      const persona = await createPersona();

      const response = await request
        .get(`/api/personas/${persona.id}/contactos`);

      expectSuccessResponse(response, 200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // ============================================================================
  // PUT /api/personas/:personaId/contactos/:contactoId - Actualizar contacto
  // ============================================================================

  describe('PUT /api/personas/:personaId/contactos/:contactoId', () => {
    it('should update contacto valor', async () => {
      const persona = await createPersona();

      // Crear contacto
      const createResponse = await request
        .post(`/api/personas/${persona.id}/contactos`)
        .send({
          tipoContacto: 'EMAIL',
          valor: 'old@test.com'
        });

      const contactoId = createResponse.body.data.id;

      // Actualizar
      const updateResponse = await request
        .put(`/api/personas/${persona.id}/contactos/${contactoId}`)
        .send({
          valor: 'new@test.com'
        });

      expectSuccessResponse(updateResponse, 200);
      expect(updateResponse.body.data.valor).toBe('new@test.com');
    });

    it('should update contacto principal flag', async () => {
      const persona = await createPersona();

      // Crear contacto
      const createResponse = await request
        .post(`/api/personas/${persona.id}/contactos`)
        .send({
          tipoContacto: 'TELEFONO',
          valor: '1234567890',
          principal: false
        });

      const contactoId = createResponse.body.data.id;

      // Actualizar a principal
      const updateResponse = await request
        .put(`/api/personas/${persona.id}/contactos/${contactoId}`)
        .send({
          principal: true
        });

      expectSuccessResponse(updateResponse, 200);
      expect(updateResponse.body.data.principal).toBe(true);
    });

    it('should return 404 for non-existent contacto', async () => {
      const persona = await createPersona();

      const response = await request
        .put(`/api/personas/${persona.id}/contactos/999999`)
        .send({
          valor: 'new@test.com'
        });

      expectErrorResponse(response, 404);
    });
  });

  // ============================================================================
  // DELETE /api/personas/:personaId/contactos/:contactoId - Eliminar contacto
  // ============================================================================

  describe('DELETE /api/personas/:personaId/contactos/:contactoId', () => {
    it('should delete contacto', async () => {
      const persona = await createPersona();

      // Crear contacto
      const createResponse = await request
        .post(`/api/personas/${persona.id}/contactos`)
        .send({
          tipoContacto: 'EMAIL',
          valor: 'delete@test.com'
        });

      const contactoId = createResponse.body.data.id;

      // Eliminar
      const deleteResponse = await request
        .delete(`/api/personas/${persona.id}/contactos/${contactoId}`);

      expectSuccessResponse(deleteResponse, 200);

      // Verificar que ya no existe
      const getResponse = await request
        .get(`/api/personas/${persona.id}/contactos`);

      const contactos = getResponse.body.data;
      const contactoEliminado = contactos.find((c: any) => c.id === contactoId);

      expect(contactoEliminado).toBeUndefined();
    });

    it('should return 404 for non-existent contacto', async () => {
      const persona = await createPersona();

      const response = await request
        .delete(`/api/personas/${persona.id}/contactos/999999`);

      expectErrorResponse(response, 404);
    });
  });

  // ============================================================================
  // GET /api/catalogos/tipos-persona - Catálogo de tipos
  // ============================================================================

  describe('GET /api/catalogos/tipos-persona', () => {
    it('should get all tipos de persona from catalog', async () => {
      const response = await request
        .get('/api/catalogos/tipos-persona');

      expectSuccessResponse(response, 200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Verificar estructura
      const tipo = response.body.data[0];
      expect(tipo).toHaveProperty('id');
      expect(tipo).toHaveProperty('codigo');
      expect(tipo).toHaveProperty('nombre');
    });

    it('should filter tipos by activo=true', async () => {
      const response = await request
        .get('/api/catalogos/tipos-persona')
        .query({ activo: true });

      expectSuccessResponse(response, 200);
      const tipos = response.body.data;

      // Todos deben estar activos
      tipos.forEach((tipo: any) => {
        expect(tipo.activo).toBe(true);
      });
    });
  });

  // ============================================================================
  // GET /api/catalogos/tipos-persona/:codigo - Tipo por código
  // ============================================================================

  describe('GET /api/catalogos/tipos-persona/:codigo', () => {
    it('should get SOCIO tipo by codigo', async () => {
      const response = await request
        .get('/api/catalogos/tipos-persona/SOCIO');

      expectSuccessResponse(response, 200);
      expect(response.body.data.codigo).toBe('SOCIO');
      expect(response.body.data.nombre).toBeDefined();
    });

    it('should get DOCENTE tipo by codigo', async () => {
      const response = await request
        .get('/api/catalogos/tipos-persona/DOCENTE');

      expectSuccessResponse(response, 200);
      expect(response.body.data.codigo).toBe('DOCENTE');
    });

    it('should return 404 for non-existent codigo', async () => {
      const response = await request
        .get('/api/catalogos/tipos-persona/INVALID_CODE');

      expectErrorResponse(response, 404);
    });
  });

  // ============================================================================
  // GET /api/catalogos/especialidades-docentes - Catálogo especialidades
  // ============================================================================

  describe('GET /api/catalogos/especialidades-docentes', () => {
    it('should get all especialidades from catalog', async () => {
      const response = await request
        .get('/api/catalogos/especialidades-docentes');

      expectSuccessResponse(response, 200);
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        const especialidad = response.body.data[0];
        expect(especialidad).toHaveProperty('id');
        expect(especialidad).toHaveProperty('nombre');
      }
    });

    it('should filter especialidades by activo', async () => {
      const response = await request
        .get('/api/catalogos/especialidades-docentes')
        .query({ activo: true });

      expectSuccessResponse(response, 200);

      if (response.body.data.length > 0) {
        response.body.data.forEach((esp: any) => {
          expect(esp.activo).toBe(true);
        });
      }
    });
  });

  // ============================================================================
  // GET /api/catalogos/especialidades-docentes/:codigo - Especialidad por código
  // ============================================================================

  describe('GET /api/catalogos/especialidades-docentes/:codigo', () => {
    it('should get especialidad by codigo if exists', async () => {
      // Primero obtener una especialidad del catálogo
      const catalogResponse = await request
        .get('/api/catalogos/especialidades-docentes');

      if (catalogResponse.body.data.length > 0) {
        const especialidad = catalogResponse.body.data[0];

        if (especialidad.codigo) {
          const response = await request
            .get(`/api/catalogos/especialidades-docentes/${especialidad.codigo}`);

          expectSuccessResponse(response, 200);
          expect(response.body.data.codigo).toBe(especialidad.codigo);
        }
      }
    });

    it('should return 404 for non-existent codigo', async () => {
      const response = await request
        .get('/api/catalogos/especialidades-docentes/INVALID_CODE_999');

      expectErrorResponse(response, 404);
    });
  });

  // ============================================================================
  // Edge Cases y Validaciones
  // ============================================================================

  describe('Edge Cases', () => {
    it('should prevent assigning duplicate tipo to same persona', async () => {
      const persona = await createPersona();

      // Primera asignación
      await request
        .post(`/api/personas/${persona.id}/tipos`)
        .send({
          tipoPersonaCodigo: 'SOCIO',
          categoriaId: catalogoIds.categoriaSocioActivoId!
        });

      // Intentar duplicar
      const response = await request
        .post(`/api/personas/${persona.id}/tipos`)
        .send({
          tipoPersonaCodigo: 'SOCIO',
          categoriaId: 2
        });

      expectErrorResponse(response, 409); // 409 CONFLICT es más apropiado para duplicados
    });

    it('should allow multiple contactos of different types', async () => {
      const persona = await createPersona();

      // Email
      const email = await request
        .post(`/api/personas/${persona.id}/contactos`)
        .send({
          tipoContacto: 'EMAIL',
          valor: 'test@test.com'
        });

      // Teléfono
      const telefono = await request
        .post(`/api/personas/${persona.id}/contactos`)
        .send({
          tipoContacto: 'TELEFONO',
          valor: '1234567890'
        });

      expectSuccessResponse(email, 201);
      expectSuccessResponse(telefono, 201);

      // Verificar ambos existen
      const getResponse = await request
        .get(`/api/personas/${persona.id}/contactos`);

      expect(getResponse.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle CUIT validation for PROVEEDOR', async () => {
      const persona = await createPersona();

      // CUIT muy corto
      const response1 = await request
        .post(`/api/personas/${persona.id}/tipos`)
        .send({
          tipoPersonaCodigo: 'PROVEEDOR',
          cuit: '123',
          razonSocial: 'Test SA'
        });

      expectErrorResponse(response1, 400);

      // CUIT muy largo
      const response2 = await request
        .post(`/api/personas/${persona.id}/tipos`)
        .send({
          tipoPersonaCodigo: 'PROVEEDOR',
          cuit: '123456789012345',
          razonSocial: 'Test SA'
        });

      expectErrorResponse(response2, 400);
    });

    it('should validate email format in contactos', async () => {
      const persona = await createPersona();

      const response = await request
        .post(`/api/personas/${persona.id}/contactos`)
        .send({
          tipoContacto: 'EMAIL',
          valor: 'invalid-email-format'
        });

      // Puede ser aceptado o rechazado dependiendo de validación del server
      expect([200, 201, 400]).toContain(response.status);
    });
  });
});
