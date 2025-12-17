import { PrismaClient } from '@prisma/client';
export declare function getCategoriaIdByCodigo(codigo: string, prisma?: PrismaClient): Promise<number>;
export declare function getCategoriaCodigoByCategoriaId(categoriaId: number, prisma?: PrismaClient): Promise<string>;
export declare function getMontoCuotaPorCategoria(categoriaId: number, prisma?: PrismaClient): Promise<number>;
export declare function getCategoriaByCodigo(codigo: string, prisma?: PrismaClient): Promise<any>;
export declare function existeCategoria(codigo: string, prisma?: PrismaClient): Promise<boolean>;
export declare function getCategoriasActivas(prisma?: PrismaClient): Promise<any[]>;
//# sourceMappingURL=categoria.helper.d.ts.map