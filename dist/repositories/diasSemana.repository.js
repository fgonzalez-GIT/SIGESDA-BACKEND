"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiasSemanaRepository = void 0;
class DiasSemanaRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.dias_semana.findMany({
            orderBy: { orden: 'asc' }
        });
    }
    async findById(id) {
        const dia = await this.prisma.dias_semana.findUnique({
            where: { id }
        });
        if (!dia) {
            throw new Error(`Día de la semana con ID ${id} no encontrado`);
        }
        return dia;
    }
    async findByCodigo(codigo) {
        const dia = await this.prisma.dias_semana.findUnique({
            where: { codigo }
        });
        if (!dia) {
            throw new Error(`Día de la semana con código ${codigo} no encontrado`);
        }
        return dia;
    }
}
exports.DiasSemanaRepository = DiasSemanaRepository;
//# sourceMappingURL=diasSemana.repository.js.map