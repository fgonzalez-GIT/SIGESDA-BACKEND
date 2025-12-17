"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoriaIdByCodigo = getCategoriaIdByCodigo;
exports.getCategoriaCodigoByCategoriaId = getCategoriaCodigoByCategoriaId;
exports.getMontoCuotaPorCategoria = getMontoCuotaPorCategoria;
exports.getCategoriaByCodigo = getCategoriaByCodigo;
exports.existeCategoria = existeCategoria;
exports.getCategoriasActivas = getCategoriasActivas;
const client_1 = require("@prisma/client");
let prismaInstance = null;
function getPrismaInstance() {
    if (!prismaInstance) {
        prismaInstance = new client_1.PrismaClient();
    }
    return prismaInstance;
}
async function getCategoriaIdByCodigo(codigo, prisma) {
    const client = prisma || getPrismaInstance();
    const categoria = await client.categoriaSocio.findFirst({
        where: { codigo }
    });
    if (!categoria) {
        throw new Error(`Categoría con código ${codigo} no encontrada`);
    }
    return categoria.id;
}
async function getCategoriaCodigoByCategoriaId(categoriaId, prisma) {
    const client = prisma || getPrismaInstance();
    const categoria = await client.categoriaSocio.findUnique({
        where: { id: categoriaId }
    });
    if (!categoria) {
        throw new Error(`Categoría con ID ${categoriaId} no encontrada`);
    }
    return categoria.codigo;
}
async function getMontoCuotaPorCategoria(categoriaId, prisma) {
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
async function getCategoriaByCodigo(codigo, prisma) {
    const client = prisma || getPrismaInstance();
    const categoria = await client.categoriaSocio.findFirst({
        where: { codigo }
    });
    if (!categoria) {
        throw new Error(`Categoría con código ${codigo} no encontrada`);
    }
    return categoria;
}
async function existeCategoria(codigo, prisma) {
    const client = prisma || getPrismaInstance();
    const count = await client.categoriaSocio.count({
        where: { codigo }
    });
    return count > 0;
}
async function getCategoriasActivas(prisma) {
    const client = prisma || getPrismaInstance();
    return client.categoriaSocio.findMany({
        where: { activa: true },
        orderBy: { orden: 'asc' }
    });
}
//# sourceMappingURL=categoria.helper.js.map