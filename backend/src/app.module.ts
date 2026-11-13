import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AiModule } from './ai/ai.module.js';
import { ApplicationsModule } from './applications/applications.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { RateLimitGuard } from './common/rate-limit.guard.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ResumeModule } from './resume/resume.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ResumeModule,
    ApplicationsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Har route par default 100 requests per minute per IP
    { provide: APP_GUARD, useClass: RateLimitGuard },
  ],
})
export class AppModule {}