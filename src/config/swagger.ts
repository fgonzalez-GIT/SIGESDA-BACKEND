/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Configuración de Swagger/OpenAPI para SIGESDA Backend
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Documentación automática de API REST usando OpenAPI 3.0
 *
 * @author SIGESDA Development Team
 * @date 2025-12-15
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SIGESDA Backend API',
      version: '2.0.0',
      description: `
# SIGESDA - Sistema de Gestión de Asociación Musical

Backend API REST para gestión integral de conservatorio/asociación musical.

## Características principales

- 📋 **Gestión de Socios**: CRUD completo con arquitectura multi-tipo
- 🎵 **Actividades Musicales**: Coros, clases, talleres con horarios
- 💰 **Sistema de Cuotas V2**: Items configurables, descuentos automáticos, ajustes manuales
- 👨‍👩‍👧‍👦 **Relaciones Familiares**: 20 tipos de parentesco con descuentos
- 📊 **Reportes y Analytics**: Dashboard, estadísticas, comparativas
- 🎫 **Exenciones**: Workflow de solicitud/aprobación, seguimiento
- 🧾 **Recibos**: Generación automática, estados, historial

## Módulos

### Core
- **Personas**: Gestión de socios, docentes, proveedores
- **Actividades**: Inscripciones, horarios, participaciones
- **Cuotas**: Generación, recálculo, regeneración

### Sistema de Cuotas V2 (FASE 4)
- **Items de Cuota**: Configurables, fórmulas, duplicación
- **Ajustes Manuales**: Descuentos/recargos por socio
- **Exenciones**: Temporales, workflow de aprobación
- **Reportes**: Dashboard, categorías, descuentos, recaudación

### Catálogos
- Categorías de socio, tipos de actividad, estados
- Especialidades docentes, medios de pago
- Tipos de items, fórmulas de cálculo

## Arquitectura

**Patrón:** Repository Pattern + Service Layer + DTOs (Zod validation)

**Stack:**
- Node.js 20+
- TypeScript 5.3.3
- Express 4.21.1
- PostgreSQL 16+
- Prisma ORM 5.6.0

**Estructura:**
\`\`\`
/api
  /personas           # Socios, docentes, proveedores
  /actividades        # Actividades musicales
  /cuotas             # Sistema de cuotas V2
  /reportes/cuotas    # Reportes y estadísticas
  /ajustes-cuota      # Ajustes manuales
  /exenciones-cuota   # Exenciones temporales
  /items-cuota        # Items configurables
  /catalogos          # Catálogos del sistema
\`\`\`

## Autenticación

🚧 **En desarrollo**: Sistema de autenticación JWT

Actualmente la API está en modo desarrollo sin autenticación.

## Códigos de Estado

- \`200 OK\` - Operación exitosa
- \`201 Created\` - Recurso creado
- \`400 Bad Request\` - Validación fallida
- \`404 Not Found\` - Recurso no encontrado
- \`409 Conflict\` - Conflicto de estado
- \`500 Internal Server Error\` - Error del servidor

## Formato de Respuestas

Todas las respuestas siguen este formato:

\`\`\`json
{
  "success": true,
  "message": "Mensaje descriptivo",
  "data": { ... },
  "meta": { ... }
}
\`\`\`

En caso de error:

\`\`\`json
{
  "success": false,
  "error": "Mensaje de error",
  "details": { ... }
}
\`\`\`
      `,
      contact: {
        name: 'SIGESDA Development Team',
        email: 'dev@sigesda.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.sigesda.com',
        description: 'Servidor de producción (futuro)'
      }
    ],
    tags: [
      {
        name: 'Cuotas',
        description: 'Endpoints para gestión de cuotas (generación, recálculo, regeneración)'
      },
      {
        name: 'Reportes',
        description: 'Reportes y estadísticas del sistema de cuotas'
      },
      {
        name: 'Ajustes Manuales',
        description: 'Ajustes y modificaciones manuales a cuotas de socios'
      },
      {
        name: 'Exenciones',
        description: 'Sistema de exenciones temporales con workflow de aprobación'
      },
      {
        name: 'Items de Cuota',
        description: 'Gestión de items configurables dentro de cuotas'
      },
      {
        name: 'Catálogos',
        description: 'Catálogos y configuraciones del sistema'
      },
      {
        name: 'Personas',
        description: 'Gestión de personas (socios, docentes, proveedores)'
      },
      {
        name: 'Actividades',
        description: 'Gestión de actividades musicales e inscripciones'
      },
      {
        name: 'Recibos',
        description: 'Gestión de recibos y comprobantes'
      }
    ],
    components: {
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica si la operación fue exitosa'
            },
            message: {
              type: 'string',
              description: 'Mensaje descriptivo de la operación'
            },
            data: {
              type: 'object',
              description: 'Datos de respuesta'
            },
            meta: {
              type: 'object',
              description: 'Metadata adicional (paginación, estadísticas, etc.)'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Mensaje de error'
            },
            details: {
              type: 'object',
              description: 'Detalles adicionales del error'
            }
          }
        },
        Cuota: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la cuota'
            },
            reciboId: {
              type: 'integer',
              description: 'ID del recibo asociado'
            },
            categoriaId: {
              type: 'integer',
              description: 'ID de la categoría de socio'
            },
            mes: {
              type: 'integer',
              minimum: 1,
              maximum: 12,
              description: 'Mes de la cuota (1-12)'
            },
            anio: {
              type: 'integer',
              minimum: 2020,
              description: 'Año de la cuota'
            },
            montoBase: {
              type: 'number',
              format: 'decimal',
              description: 'Monto base según categoría'
            },
            montoActividades: {
              type: 'number',
              format: 'decimal',
              description: 'Monto por actividades adicionales'
            },
            montoTotal: {
              type: 'number',
              format: 'decimal',
              description: 'Monto total de la cuota'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ItemCuota: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            cuotaId: {
              type: 'integer'
            },
            tipoItemId: {
              type: 'integer'
            },
            concepto: {
              type: 'string'
            },
            monto: {
              type: 'number',
              format: 'decimal'
            },
            cantidad: {
              type: 'integer',
              default: 1
            },
            esAutomatico: {
              type: 'boolean',
              description: 'Indica si fue generado automáticamente'
            }
          }
        },
        AjusteCuota: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            personaId: {
              type: 'integer'
            },
            tipoAjuste: {
              type: 'string',
              enum: ['DESCUENTO_FIJO', 'DESCUENTO_PORCENTAJE', 'RECARGO_FIJO', 'RECARGO_PORCENTAJE']
            },
            valor: {
              type: 'number',
              format: 'decimal'
            },
            concepto: {
              type: 'string'
            },
            activo: {
              type: 'boolean'
            },
            fechaInicio: {
              type: 'string',
              format: 'date'
            },
            fechaFin: {
              type: 'string',
              format: 'date',
              nullable: true
            }
          }
        },
        ExencionCuota: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            personaId: {
              type: 'integer'
            },
            tipoExencion: {
              type: 'string',
              enum: ['TOTAL', 'PARCIAL']
            },
            motivoExencion: {
              type: 'string',
              enum: ['BECA', 'SOCIO_FUNDADOR', 'SOCIO_HONORARIO', 'SITUACION_ECONOMICA', 'SITUACION_SALUD', 'INTERCAMBIO_SERVICIOS', 'PROMOCION', 'FAMILIAR_DOCENTE', 'OTRO']
            },
            estado: {
              type: 'string',
              enum: ['PENDIENTE_APROBACION', 'APROBADA', 'RECHAZADA', 'VIGENTE', 'VENCIDA', 'REVOCADA']
            },
            porcentajeExencion: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              maximum: 100
            },
            fechaInicio: {
              type: 'string',
              format: 'date'
            },
            fechaFin: {
              type: 'string',
              format: 'date',
              nullable: true
            },
            activa: {
              type: 'boolean'
            }
          }
        }
      }
    }
  },
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../controllers/*.ts')
  ]
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Configura Swagger UI en la aplicación Express
 */
export function setupSwagger(app: Application): void {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SIGESDA API Docs'
  }));

  // Swagger JSON endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Swagger documentation available at http://localhost:3001/api-docs');
}

export { swaggerSpec };
