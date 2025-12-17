/**
 * Categoria Helper Utilities
 *
 * Funciones reutilizables para trabajar con categorías de socio.
 */

import { PrismaClient } from '@prisma/client';

// Singleton de Prisma para evitar múltiples instancias
let prismaInstance: PrismaClient | null = null;

function getPrismaInstance(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

/**
 * Obtiene el ID de una categoría por su código
 *
 * @param codigo - Código de la categoría (ej: 'ACTIVO', 'ESTUDIANTE')
 * @param prisma - Instancia de PrismaClient (opcional)
 * @returns ID de la categoría
 * @throws Error si la categoría no existe
 *
 * @example
 * const categoriaId = await getCategoriaIdByCodigo('ACTIVO');
 * // Returns: 1
 */
export async function getCategoriaIdByCodigo(
  codigo: string,
  prisma?: PrismaClient
): Promise<number> {
  const client = prisma || getPrismaInstance();

  const categoria = await client.categoriaSocio.findFirst({
    where: { codigo }
  });

  if (!categoria) {
    throw new Error(`Categoría con código ${codigo} no encontrada`);
  }

  return categoria.id;
}

/**
 * Obtiene el código de una categoría por su ID
 *
 * @param categoriaId - ID de la categoría
 * @param prisma - Instancia de PrismaClient (opcional)
 * @returns Código de la categoría
 * @throws Error si la categoría no existe
 *
 * @example
 * const codigo = await getCategoriaCodigoByCategoriaId(1);
 * // Returns: 'ACTIVO'
 */
export async function getCategoriaCodigoByCategoriaId(
  categoriaId: number,
  prisma?: PrismaClient
): Promise<string> {
  const client = prisma || getPrismaInstance();

  const categoria = await client.categoriaSocio.findUnique({
    where: { id: categoriaId }
  });

  if (!categoria) {
    throw new Error(`Categoría con ID ${categoriaId} no encontrada`);
  }

  return categoria.codigo;
}

/**
 * Obtiene el monto de cuota base de una categoría
 *
 * @param categoriaId - ID de la categoría
 * @param prisma - Instancia de PrismaClient (opcional)
 * @returns Monto de cuota de la categoría
 * @throws Error si la categoría no existe
 *
 * @example
 * const monto = await getMontoCuotaPorCategoria(1);
 * // Returns: 500
 */
export async function getMontoCuotaPorCategoria(
  categoriaId: number,
  prisma?: PrismaClient
): Promise<number> {
  const client = prisma || getPrismaInstance();

  const categoria = await client.categoriaSocio.findUnique({
    where: { id: categoriaId },
    select: { montoCuota: true }
  });

  if (!categoria) {
    throw new Error(`Categoría con ID ${categoriaId} no encontrada`);
  }

  return Number(categoria.montoCuota || 0);
}

/**
 * Obtiene toda la información de una categoría por su código
 *
 * @param codigo - Código de la categoría
 * @param prisma - Instancia de PrismaClient (opcional)
 * @returns Categoría completa
 * @throws Error si la categoría no existe
 *
 * @example
 * const categoria = await getCategoriaByCodigo('ACTIVO');
 * // Returns: { id: 1, codigo: 'ACTIVO', nombre: 'Activo', montoCuota: 500, ... }
 */
export async function getCategoriaByCodigo(
  codigo: string,
  prisma?: PrismaClient
): Promise<any> {
  const client = prisma || getPrismaInstance();

  const categoria = await client.categoriaSocio.findFirst({
    where: { codigo }
  });

  if (!categoria) {
    throw new Error(`Categoría con código ${codigo} no encontrada`);
  }

  return categoria;
}

/**
 * Verifica si una categoría existe
 *
 * @param codigo - Código de la categoría
 * @param prisma - Instancia de PrismaClient (opcional)
 * @returns true si la categoría existe
 *
 * @example
 * const existe = await existeCategoria('ACTIVO');
 * // Returns: true
 */
export async function existeCategoria(
  codigo: string,
  prisma?: PrismaClient
): Promise<boolean> {
  const client = prisma || getPrismaInstance();

  const count = await client.categoriaSocio.count({
    where: { codigo }
  });

  return count > 0;
}

/**
 * Obtiene todas las categorías activas
 *
 * @param prisma - Instancia de PrismaClient (opcional)
 * @returns Lista de categorías activas
 *
 * @example
 * const categorias = await getCategoriasActivas();
 * // Returns: [{ id: 1, codigo: 'ACTIVO', ... }, { id: 2, codigo: 'ESTUDIANTE', ... }]
 */
export async function getCategoriasActivas(prisma?: PrismaClient): Promise<any[]> {
  const client = prisma || getPrismaInstance();

  return client.categoriaSocio.findMany({
    where: { activa: true },
    orderBy: { orden: 'asc' }
  });
}
