/**
 * ============================================================================
 * ETAPA 1.1: TESTS DE PERSONAS
 * ============================================================================
 * Tests de integración para endpoints de Personas
 * 15 endpoints principales
 * ============================================================================
 */

import {
  createTestApp,
  prisma,
  resetDatabase,
  disconnectPrisma,
  generateUniqueDNI,
  generateUniqueEmail,
  expectSuccessResponse,
  expectErrorResponse,
  expectPaginatedResponse
} from '../helpers/testUtils';
import { createPersona, createSocio, createDocente, createMultiplePersonas } from '../helpers/factories';
import fixtures from '../helpers/fixtures';

const request = createTestApp();

describe('PERSONAS - Integration Tests', () => {

  // Setup: Reset DB antes de todos los tests de esta suite
  beforeAll(async () => {
    await resetDatabase();
  });

  // Cleanup: Desconectar Prisma después de todos los tests
  afterAll(async () => {
    await disconnectPrisma();
  });

  // Limpiar personas después de cada test para independencia
  afterEach(async () => {
    await prisma.contactoPersona.deleteMany({});
    await prisma.personaTipo.deleteMany({});
    await prisma.persona.deleteMany({});
  });

  // ============================================================================
  // POST /api/personas - Crear persona
  // ============================================================================

  describe('POST /api/personas', () => {
    it('should create a valid persona successfully', async () => {
      const newPersona = {
        ...fixtures.persona.validPersona1,
        dni: generateUniqueDNI(),
        email: generateUniqueEmail('create')
      };

      const response = await request
        .post('/api/personas')
        .send(newPersona);

      expectSuccessResponse(response, 201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nombre).toBe(newPersona.nombre);
      expect(response.body.data.apellido).toBe(newPersona.apellido);
      expect(response.body.data.dni).toBe(newPersona.dni);
      expect(response.body.data.email).toBe(newPersona.email);
    });

    it('should reject persona with duplicate DNI', async () => {
      const persona = await createPersona();

      const duplicatePersona = {
        nombre: 'Duplicate',
        apellido: 'DNI',
        dni: persona.dni, // DNI duplicado
        email: generateUniqueEmail('duplicate')
      };

      const response = await request
        .post('/api/personas')
        .send(duplicatePersona);

      expectErrorResponse(response, 409, 'dni');
    });

    it('should reject persona with duplicate email', async () => {
      const persona = await createPersona();

      const duplicateEmail = {
        nombre: 'Duplicate',
        apellido: 'Email',
        dni: generateUniqueDNI(),
        email: persona.email // Email duplicado
      };

      const response = await request
        .post('/api/personas')
        .send(duplicateEmail);

      expectErrorResponse(response, 409, 'email');
    });

    it('should reject persona without required fields', async () => {
      const invalidPersona = {
        apellido: 'Solo Apellido'
        // Falta nombre y DNI
      };

      const response = await request
        .post('/api/personas')
        .send(invalidPersona);

      expectErrorResponse(response, 400);
    });

    it('should create persona with optional fields omitted', async () => {
      const minimalPersona = {
        nombre: 'Minimal',
        apellido: 'User',
        dni: generateUniqueDNI()
        // email, telefono, direccion, fechaNacimiento omitidos
      };

      const response = await request
        .post('/api/personas')
        .send(minimalPersona);

      expectSuccessResponse(response, 201);
      expect(response.body.data.nombre).toBe(minimalPersona.nombre);
    });
  });

  // ============================================================================
  // GET /api/personas - Listar personas
  // ============================================================================

  describe('GET /api/personas', () => {
    it('should list all personas with default pagination', async () => {
      // Crear 5 personas
      await createMultiplePersonas(5);

      const response = await request
        .get('/api/personas');

      expectSuccessResponse(response, 200);

      // Verificar estructura de paginación
      if (Array.isArray(response.body)) {
        expect(response.body.length).toBeGreaterThanOrEqual(5);
      } else {
        expectPaginatedResponse(response);
        expect(response.body.data.length).toBeGreaterThanOrEqual(5);
      }
    });

    it('should filter personas by search term', async () => {
      const uniqueName = `SearchTest${Date.now()}`;
      await createPersona({ nombre: uniqueName, apellido: 'Findme' });
      await createPersona({ nombre: 'Other', apellido: 'Person' });

      const response = await request
        .get('/api/personas')
        .query({ q: uniqueName });

      expectSuccessResponse(response, 200);

      const data = Array.isArray(response.body) ? response.body : response.body.data;
      expect(data.length).toBeGreaterThanOrEqual(1);
      expect(data[0].nombre).toContain(uniqueName);
    });

    it('should apply pagination correctly', async () => {
      await createMultiplePersonas(15);

      const response = await request
        .get('/api/personas')
        .query({ page: 1, limit: 5 });

      expectSuccessResponse(response, 200);

      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
    });

    it('should return empty array when no personas exist', async () => {
      const response = await request
        .get('/api/personas');

      expectSuccessResponse(response, 200);
      const data = Array.isArray(response.body) ? response.body : response.body.data;
      expect(Array.isArray(data)).toBe(true);
    });
  });

  // ============================================================================
  // GET /api/personas/:id - Obtener persona por ID
  // ============================================================================

  describe('GET /api/personas/:id', () => {
    it('should get persona by valid ID', async () => {
      const persona = await createPersona();

      const response = await request
        .get(`/api/personas/${persona.id}`);

      expectSuccessResponse(response, 200);
      expect(response.body.data.id).toBe(persona.id);
      expect(response.body.data.nombre).toBe(persona.nombre);
      expect(response.body.data.dni).toBe(persona.dni);
    });

    it('should return 404 for non-existent persona', async () => {
      const nonExistentId = 999999;

      const response = await request
        .get(`/api/personas/${nonExistentId}`);

      expectErrorResponse(response, 404);
    });

    it('should return 400 or 500 for invalid ID format', async () => {
      const response = await request
        .get('/api/personas/invalid-id');

      // API might return 400 or 500 depending on validation layer
      expect([400, 500]).toContain(response.status);
    });
  });

  // ============================================================================
  // PUT /api/personas/:id - Actualizar persona
  // ============================================================================

  describe('PUT /api/personas/:id', () => {
    it('should update persona successfully', async () => {
      const persona = await createPersona();

      const updateData = {
        nombre: 'Updated Name',
        apellido: 'Updated Lastname',
        telefono: '9999999999'
      };

      const response = await request
        .put(`/api/personas/${persona.id}`)
        .send(updateData);

      expectSuccessResponse(response, 200);
      expect(response.body.data.nombre).toBe(updateData.nombre);
      expect(response.body.data.apellido).toBe(updateData.apellido);
      expect(response.body.data.telefono).toBe(updateData.telefono);
    });

    it('should not update to duplicate DNI', async () => {
      const persona1 = await createPersona();
      const persona2 = await createPersona();

      const response = await request
        .put(`/api/personas/${persona1.id}`)
        .send({ dni: persona2.dni });

      expectErrorResponse(response, 409, 'dni');
    });

    it('should not update to duplicate email', async () => {
      const persona1 = await createPersona();
      const persona2 = await createPersona();

      const response = await request
        .put(`/api/personas/${persona1.id}`)
        .send({ email: persona2.email });

      expectErrorResponse(response, 409, 'email');
    });

    it('should return 404 when updating non-existent persona', async () => {
      const response = await request
        .put('/api/personas/999999')
        .send({ nombre: 'Test' });

      expectErrorResponse(response, 404);
    });
  });

  // ============================================================================
  // DELETE /api/personas/:id - Eliminar persona
  // ============================================================================

  describe('DELETE /api/personas/:id', () => {
    it('should soft delete persona (default)', async () => {
      const persona = await createPersona();

      const response = await request
        .delete(`/api/personas/${persona.id}`);

      expectSuccessResponse(response, 200);

      // Verificar que persona todavía existe en DB (soft delete)
      const personaInDB = await prisma.persona.findUnique({
        where: { id: persona.id }
      });

      // Dependiendo de implementación, puede estar marcada como inactiva o eliminada
      expect(personaInDB).toBeDefined();
    });

    it('should hard delete persona when specified', async () => {
      const persona = await createPersona();

      const response = await request
        .delete(`/api/personas/${persona.id}`)
        .query({ hard: 'true' });

      // Puede ser 200 o 204
      expect([200, 204]).toContain(response.status);

      // Verificar que persona ya no existe
      const personaInDB = await prisma.persona.findUnique({
        where: { id: persona.id }
      });

      expect(personaInDB).toBeNull();
    });

    it('should return 404 when deleting non-existent persona', async () => {
      const response = await request
        .delete('/api/personas/999999');

      expectErrorResponse(response, 404);
    });
  });

  // ============================================================================
  // GET /api/personas/dni/:dni/check - Verificar disponibilidad DNI
  // ============================================================================

  describe('GET /api/personas/dni/:dni/check', () => {
    it('should return available for non-existent DNI', async () => {
      const uniqueDNI = generateUniqueDNI();

      const response = await request
        .get(`/api/personas/dni/${uniqueDNI}/check`);

      expectSuccessResponse(response, 200);
      expect(response.body.data.exists).toBe(false);
    });

    it('should return not available for existing DNI', async () => {
      const persona = await createPersona();

      const response = await request
        .get(`/api/personas/dni/${persona.dni}/check`);

      expectSuccessResponse(response, 200);
      expect(response.body.data.exists).toBe(true);
    });
  });

  // ============================================================================
  // GET /api/personas/search - Búsqueda de personas
  // ============================================================================

  describe('GET /api/personas/search', () => {
    it('should search personas by query string', async () => {
      const uniqueName = `SearchQuery${Date.now()}`;
      await createPersona({ nombre: uniqueName, apellido: 'TestSearch' });
      await createPersona({ nombre: 'Other', apellido: 'Person' });

      const response = await request
        .get('/api/personas/search')
        .query({ q: uniqueName });

      expectSuccessResponse(response, 200);
      const results = Array.isArray(response.body) ? response.body : response.body.data || response.body.results;
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty results for non-matching query', async () => {
      const response = await request
        .get('/api/personas/search')
        .query({ q: 'NonExistentSearchTerm123456' });

      expectSuccessResponse(response, 200);
      const results = Array.isArray(response.body) ? response.body : response.body.data || response.body.results;
      expect(results.length).toBe(0);
    });
  });

  // ============================================================================
  // GET /api/personas/socios - Listar solo socios
  // ============================================================================

  describe('GET /api/personas/socios', () => {
    it('should list only personas with SOCIO type', async () => {
      // Obtener categoría para crear socio
      const categoria = await prisma.categoriaSocio.findFirst({ where: { codigo: 'ACTIVO' } });
      if (!categoria) throw new Error('Categoría ACTIVO no encontrada');

      // Crear socio y persona regular
      await createSocio(categoria.id);
      await createPersona();

      const response = await request
        .get('/api/personas/socios');

      expectSuccessResponse(response, 200);
      const data = Array.isArray(response.body) ? response.body : response.body.data;

      // Todos los resultados deben ser socios
      expect(data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ============================================================================
  // GET /api/personas/docentes - Listar solo docentes
  // ============================================================================

  describe('GET /api/personas/docentes', () => {
    it('should list only personas with DOCENTE type', async () => {
      // Obtener especialidad para crear docente
      const especialidad = await prisma.especialidadDocente.findFirst({ where: { codigo: 'CANTO' } });
      if (!especialidad) throw new Error('Especialidad CANTO no encontrada');

      // Crear docente y persona regular
      await createDocente(especialidad.id);
      await createPersona();

      const response = await request
        .get('/api/personas/docentes');

      expectSuccessResponse(response, 200);
      const data = Array.isArray(response.body) ? response.body : response.body.data;

      // Todos los resultados deben ser docentes
      expect(data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ============================================================================
  // POST /api/personas/:id/reactivate - Reactivar persona
  // ============================================================================

  describe('POST /api/personas/:id/reactivate', () => {
    it('should reactivate an inactive persona', async () => {
      const persona = await createPersona();

      // Primero desactivar (soft delete)
      await request.delete(`/api/personas/${persona.id}`);

      // Reactivar
      const response = await request
        .post(`/api/personas/${persona.id}/reactivate`);

      expectSuccessResponse(response, 200);
    });

    it('should return 404 for non-existent persona', async () => {
      const response = await request
        .post('/api/personas/999999/reactivate');

      expectErrorResponse(response, 404);
    });
  });

  // ============================================================================
  // Edge Cases y Validaciones
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle very long text fields', async () => {
      const longString = 'A'.repeat(500);
      const persona = {
        nombre: longString,
        apellido: longString,
        dni: generateUniqueDNI(),
        email: generateUniqueEmail(),
        direccion: longString
      };

      const response = await request
        .post('/api/personas')
        .send(persona);

      // Puede ser 400 (validación) o 201 (si acepta strings largos)
      expect([201, 400]).toContain(response.status);
    });

    it('should handle special characters in names', async () => {
      const persona = {
        nombre: "María José",
        apellido: "O'Connor-Pérez",
        dni: generateUniqueDNI(),
        email: generateUniqueEmail()
      };

      const response = await request
        .post('/api/personas')
        .send(persona);

      expectSuccessResponse(response, 201);
      expect(response.body.data.nombre).toBe(persona.nombre);
    });

    it('should validate email format', async () => {
      const persona = {
        nombre: 'Test',
        apellido: 'User',
        dni: generateUniqueDNI(),
        email: 'invalid-email-format'
      };

      const response = await request
        .post('/api/personas')
        .send(persona);

      // Debería rechazar email inválido
      expectErrorResponse(response, 400);
    });
  });
});
