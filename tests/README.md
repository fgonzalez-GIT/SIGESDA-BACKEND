# Tests - SIGESDA Backend

## Configuración del Entorno de Testing

### Prerrequisitos

1. **Base de datos de testing**:
   ```bash
   # Crear base de datos de testing
   createdb -h localhost -U sigesda_user asociacion_musical_test
   ```

2. **Variables de entorno**:
   - Archivo `.env.test` configurado (ver `.env.test` en raíz del proyecto)
   - `NODE_ENV=test` durante ejecución de tests

### Estructura de Tests

```
tests/
├── integration/          # Tests de integración (API E2E)
│   ├── cuotas.test.ts
│   ├── personas.test.ts
│   └── persona-tipos.test.ts
├── unit/                 # Tests unitarios (pendiente)
├── helpers/              # Helpers para tests
├── manual/               # Scripts de testing manual
├── setup.ts              # Setup global (ejecuta antes de todos los tests)
├── jest.setup.ts         # Setup por archivo (ejecuta antes de cada suite)
└── README.md             # Este archivo
```

## Comandos de Testing

### Ejecutar Todos los Tests

```bash
npm test
```

### Ejecutar Tests por Tipo

```bash
# Solo tests de integración
npm run test:integration

# Solo tests unitarios
npm run test:unit
```

### Otras Opciones

```bash
# Modo watch (re-ejecuta al cambiar archivos)
npm run test:watch

# Con reporte de cobertura
npm run test:coverage

# Modo verbose (más información)
npm run test:verbose

# Modo debug (para debugging)
npm run test:debug
```

## Configuración de Jest

El archivo `jest.config.js` contiene la configuración completa:

- **Preset**: `ts-jest` (soporte TypeScript)
- **Timeout**: 120 segundos por test
- **Cobertura mínima**: 60% (branches, functions, lines, statements)
- **Setup global**: Resetea y seedea la DB antes de todos los tests
- **Path aliases**: Soporta `@/`, `@services/`, etc.

## Escribir Nuevos Tests

### Test de Integración (API E2E)

```typescript
import request from 'supertest';
import app from '@/app';

describe('POST /api/cuotas/generar', () => {
  it('debe generar cuotas para el período especificado', async () => {
    const response = await request(app)
      .post('/api/cuotas/generar')
      .send({ mes: 3, anio: 2025 })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.generated).toBeGreaterThan(0);
  });
});
```

### Test Unitario (Service/Repository)

```typescript
import { CuotaService } from '@services/cuota.service';

describe('CuotaService.calcularMontoCuota', () => {
  let cuotaService: CuotaService;

  beforeEach(() => {
    cuotaService = new CuotaService(/* dependencies */);
  });

  it('debe calcular correctamente el descuento para ESTUDIANTE', async () => {
    const resultado = await cuotaService.calcularMontoCuota({
      categoria: 'ESTUDIANTE',
      mes: 3,
      anio: 2025,
      socioId: 1,
      aplicarDescuentos: true
    });

    expect(resultado.descuentos).toBe(4000); // 40% de 10000
    expect(resultado.montoTotal).toBe(6000);
  });
});
```

## Datos de Prueba

### Seed Automático

Antes de cada ejecución de tests, el sistema:
1. Resetea la base de datos de testing
2. Ejecuta las migraciones
3. Ejecuta el seed (`prisma/seed.ts`)

### Seed de Cuotas

Para tests específicos de cuotas, existe un seed adicional:

```bash
npx ts-node prisma/seed-test-cuotas.ts
```

Este seed crea:
- 52 socios de prueba (25 ACTIVO, 15 ESTUDIANTE, 7 FAMILIAR, 3 JUBILADO, 2 GENERAL)
- 4 actividades
- 42 participaciones
- 15 relaciones familiares

## Troubleshooting

### Error: "Port 8000 already in use"

El servidor de desarrollo está corriendo. Detenerlo o cambiar el puerto en `.env.test`.

### Error: "Database connection failed"

Verificar que:
1. PostgreSQL está corriendo
2. La base de datos `asociacion_musical_test` existe
3. Las credenciales en `.env.test` son correctas

### Tests fallan por timeout

Aumentar el timeout en `jest.config.js`:
```javascript
testTimeout: 240000  // 4 minutos
```

### Limpiar base de datos de testing manualmente

```bash
# Resetear BD de testing
NODE_ENV=test npx prisma migrate reset --force
```

## Reporte de Cobertura

Después de ejecutar `npm run test:coverage`, el reporte HTML está disponible en:

```
coverage/index.html
```

Abrir en navegador para ver cobertura detallada por archivo.

## CI/CD

Los tests se ejecutan automáticamente en el pipeline de CI/CD antes de cada merge.

**Umbral mínimo para aprobar**: 60% de cobertura en todas las métricas.

---

**Última actualización**: 2025-12-12
