import { ConfiguracionRepository } from '@/repositories/configuracion.repository';
import { CreateConfiguracionDto, UpdateConfiguracionDto, ConfiguracionQueryDto, ImportarConfiguracionesDto, TipoConfiguracion, parsearValor } from '@/dto/configuracion.dto';
import { ConfiguracionSistema } from '@prisma/client';
export declare class ConfiguracionService {
    private configuracionRepository;
    constructor(configuracionRepository: ConfiguracionRepository);
    create(data: CreateConfiguracionDto): Promise<ConfiguracionSistema>;
    findAll(query: ConfiguracionQueryDto): Promise<{
        data: ConfiguracionSistema[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findById(id: string): Promise<ConfiguracionSistema>;
    findByClave(clave: string): Promise<ConfiguracionSistema>;
    findByTipo(tipo: TipoConfiguracion): Promise<ConfiguracionSistema[]>;
    findByCategoria(categoria: string): Promise<ConfiguracionSistema[]>;
    update(id: string, data: UpdateConfiguracionDto): Promise<ConfiguracionSistema>;
    updateByClave(clave: string, data: UpdateConfiguracionDto): Promise<ConfiguracionSistema>;
    delete(id: string): Promise<ConfiguracionSistema>;
    deleteByClave(clave: string): Promise<ConfiguracionSistema>;
    upsert(clave: string, data: CreateConfiguracionDto): Promise<ConfiguracionSistema>;
    bulkUpsert(data: ImportarConfiguracionesDto): Promise<{
        procesadas: number;
        errores: string[];
        configuraciones: ConfiguracionSistema[];
    }>;
    exportarTodas(): Promise<ConfiguracionSistema[]>;
    getConfiguracionesPorPrefijo(prefijo: string): Promise<ConfiguracionSistema[]>;
    contarPorTipo(): Promise<{
        tipo: string;
        count: number;
    }[]>;
    buscarPorValor(valor: string): Promise<ConfiguracionSistema[]>;
    getConfiguracionesModificadasRecientemente(dias?: number): Promise<ConfiguracionSistema[]>;
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
        configuracinosFaltantes: string[];
    }>;
    getValorTipado<T extends keyof typeof TipoConfiguracion>(clave: string, tipoEsperado: T): Promise<ReturnType<typeof parsearValor<T>>>;
    setValorTipado(clave: string, valor: any, tipo: TipoConfiguracion): Promise<ConfiguracionSistema>;
    inicializarConfiguracionesSistema(): Promise<{
        creadas: number;
        errores: string[];
    }>;
    private validarValorPorTipo;
}
//# sourceMappingURL=configuracion.service.d.ts.map