import { PrismaClient } from '@prisma/client';

// Singleton pattern para PrismaClient
class DatabaseService {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
      });

      // Handle graceful shutdown
      process.on('beforeExit', async () => {
        await DatabaseService.instance.$disconnect();
      });
    }

    return DatabaseService.instance;
  }

  public static async connect(): Promise<void> {
    try {
      const prisma = this.getInstance();
      await prisma.$connect();
      console.log('✅ Conexión a base de datos establecida');
    } catch (error) {
      console.error('❌ Error conectando a base de datos:', error);
      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseService.instance) {
      await DatabaseService.instance.$disconnect();
      console.log('🔌 Desconectado de base de datos');
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      const prisma = this.getInstance();
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Health check falló:', error);
      return false;
    }
  }
}

export const prisma = DatabaseService.getInstance();
export default DatabaseService;