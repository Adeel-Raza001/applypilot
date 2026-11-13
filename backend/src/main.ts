import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { createRequire } from 'node:module';
import { AppModule } from './app.module.js';
import { DatabaseUnavailableFilter } from './common/database-unavailable.filter.js';

// helmet ke types ESM mein masla karte hain, isliye iska CommonJS build load karte hain
const require = createRequire(import.meta.url);
const helmet = require('helmet');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);
  app.use(helmet());

  const origins = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
  app.enableCors({ origin: origins });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new DatabaseUnavailableFilter());

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();