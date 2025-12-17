import { PrismaClient } from '@prisma/client';
interface ItemCuotaData {
    id: number;
    tipoItemId: number;
    concepto: string;
    monto: number;
    tipoItem: {
        codigo: string;
        categoriaItem: {
            codigo: string;
        };
    };
}
interface ResultadoAplicacion {
    itemsDescuento: ItemCuotaCreado[];
    aplicaciones: AplicacionReglaCreada[];
    totalDescuento: number;
    porcentajeTotalAplicado: number;
}
interface ItemCuotaCreado {
    tipoItemId: number;
    concepto: string;
    monto: number;
    cantidad: number;
    porcentaje: number | null;
    esAutomatico: boolean;
    esEditable: boolean;
    metadata: any;
}
interface AplicacionReglaCreada {
    reglaId: number;
    porcentajeAplicado: number;
    montoDescuento: number;
    metadata: any;
}
export declare class MotorReglasDescuentos {
    private prisma;
    constructor(prismaClient?: PrismaClient);
    aplicarReglas(cuotaId: number, personaId: number, itemsCuota: ItemCuotaData[]): Promise<ResultadoAplicacion>;
    private getConfiguracionActiva;
    private getReglasActivas;
    private evaluarCondiciones;
    private evaluarCondicionCategoria;
    private evaluarCondicionFamiliar;
    private evaluarCondicionActividades;
    private evaluarCondicionAntiguedad;
    private evaluarCondicionPersonalizada;
    private calcularDescuento;
    private obtenerPorcentajeDesdeDB;
    private calcularDescuentoEscalado;
    private ejecutarFuncionPersonalizada;
    private calcularMaximoDescuentoFamiliar;
    private calcularDescuentoPorAntiguedad;
    private calcularMontoBase;
    private resolverConflictos;
    private agruparPorModo;
    private getItemsAfectados;
    private crearItemsDescuento;
}
export default MotorReglasDescuentos;
//# sourceMappingURL=motor-reglas-descuentos.service.d.ts.map