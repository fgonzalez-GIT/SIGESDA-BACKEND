import { PrismaClient } from '@prisma/client';
declare class DatabaseService {
    private static instance;
    static getInstance(): PrismaClient;
    static connect(): Promise<void>;
    static disconnect(): Promise<void>;
    static healthCheck(): Promise<boolean>;
}
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export default DatabaseService;
//# sourceMappingURL=database.d.ts.map