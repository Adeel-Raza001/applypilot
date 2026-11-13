import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AiModule } from './ai/ai.module.js';
import { ApplicationsModule } from './applications/applications.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ResumeModule } from './resume/resume.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Har IP ke liye: 100 requests per minute (sab routes par)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    ResumeModule,
    ApplicationsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}