import { PrismaClient, ConfiguracionSistema } from '@prisma/client';
import { CreateConfiguracionDto, ConfiguracionQueryDto, TipoConfiguracion } from '@/dto/configuracion.dto';
export declare class ConfiguracionRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateConfiguracionDto): Promise<ConfiguracionSistema>;
    findAll(query: ConfiguracionQueryDto): Promise<{
        data: ConfiguracionSistema[];
        total: number;
    }>;
    findById(id: string): Promise<ConfiguracionSistema | null>;
    findByClave(clave: string): Promise<ConfiguracionSistema | null>;
    findByTipo(tipo: TipoConfiguracion): Promise<ConfiguracionSistema[]>;
    findByCategoria(categoria: string): Promise<ConfiguracionSistema[]>;
    update(id: string, data: Partial<CreateConfiguracionDto>): Promise<ConfiguracionSistema>;
    updateByClave(clave: string, data: Partial<CreateConfiguracionDto>): Promise<ConfiguracionSistema>;
    delete(id: string): Promise<ConfiguracionSistema>;
    deleteByClave(clave: string): Promise<ConfiguracionSistema>;
    upsert(clave: string, data: CreateConfiguracionDto): Promise<ConfiguracionSistema>;
    bulkUpsert(configuraciones: CreateConfiguracionDto[]): Promise<number>;
    getConfiguracionesPorPrefijo(prefijo: string): Promise<ConfiguracionSistema[]>;
    exportarTodas(): Promise<ConfiguracionSistema[]>;
    contarPorTipo(): Promise<{
        tipo: string;
        count: number;
    }[]>;
    buscarPorValor(valor: string): Promise<ConfiguracionSistema[]>;
    getConfiguracionesModificadasRecientmente(dias?: number): Promise<ConfiguracionSistema[]>;
    validarIntegridad(): Promise<{
        totalConfiguraciones: number;
        porTipo: {
            [key: string]: number;
        };
        clavesConflictivas: string[];
        valoresInvalidos: {
            clave: string;
            error: string;
        }[];
    }>;
}
//# sourceMappingURL=configuracion.repository.d.ts.map