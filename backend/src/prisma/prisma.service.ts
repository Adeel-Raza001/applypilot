import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private keepAliveTimer?: NodeJS.Timeout;

  async onModuleInit() {
    const maxAttempts = 5;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Database connected');
        break;
      } catch (err) {
        this.logger.warn(
          `Database connection failed (attempt ${attempt}/${maxAttempts})`,
        );
        if (attempt === maxAttempts) throw err;
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    // Sirf local development ke liye (.env mein DB_KEEPALIVE="true")
    if (process.env.DB_KEEPALIVE === 'true') {
      this.keepAliveTimer = setInterval(
        () => {
          this.$queryRaw`SELECT 1`.catch(() => undefined);
        },
        4 * 60 * 1000,
      );
      this.logger.log('Database keep-alive enabled');
    }
  }

  async onModuleDestroy() {
    if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
    await this.$disconnect();
  }
}