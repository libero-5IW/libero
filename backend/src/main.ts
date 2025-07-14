import { config as loadEnv } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import frontendUrl from './config/config';

import * as Sentry from '@sentry/node';


const envFile =
  process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.local';
loadEnv({ path: envFile });
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});



async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: frontendUrl,
    credentials: false,
  });

  const config = new DocumentBuilder()
    .setTitle('Libéro API')
    .setDescription('API pour la gestion RH des freelances.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();