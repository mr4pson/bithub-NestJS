import { NestFactory } from '@nestjs/core';
import { CAppModule } from './app.module';
import { cfg } from './app.config';
import { WsAdapter } from '@nestjs/platform-ws';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(CAppModule, { rawBody: true });
  app.use(json({ limit: '100mb' }));
  app.enableCors({ origin: cfg.corsedUrls });
  app.useWebSocketAdapter(new WsAdapter(app)); // чтобы Gateway использовали библиотеку ws
  await app.listen(cfg.appPort);
}

bootstrap();
