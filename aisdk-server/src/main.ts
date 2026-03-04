import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

// Load .env before NestJS initialises services (no extra deps needed)
const envFile = resolve(process.cwd(), '.env');
if (existsSync(envFile)) {
  readFileSync(envFile, 'utf8')
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx < 1) return;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(express.json({ limit: '20mb' })); // allow large base64 file attachments
  app.enableCors();
  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
