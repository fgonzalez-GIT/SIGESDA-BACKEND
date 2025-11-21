"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
class DatabaseService {
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new client_1.PrismaClient({
                log: process.env.NODE_ENV === 'development'
                    ? ['warn', 'error']
                    : ['error'],
            });
            process.on('beforeExit', async () => {
                await DatabaseService.instance.$disconnect();
            });
        }
        return DatabaseService.instance;
    }
    static async connect() {
        try {
            const prisma = this.getInstance();
            await prisma.$connect();
            console.log('✅ Conexión a base de datos establecida');
        }
        catch (error) {
            console.error('❌ Error conectando a base de datos:', error);
            throw error;
        }
    }
    static async disconnect() {
        if (DatabaseService.instance) {
            await DatabaseService.instance.$disconnect();
            console.log('🔌 Desconectado de base de datos');
        }
    }
    static async healthCheck() {
        try {
            const prisma = this.getInstance();
            await prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            console.error('❌ Health check falló:', error);
            return false;
        }
    }
}
exports.prisma = DatabaseService.getInstance();
exports.default = DatabaseService;
//# sourceMappingURL=database.js.map