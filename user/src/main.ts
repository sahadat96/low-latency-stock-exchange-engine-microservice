import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { 
  ValidationPipe,
  VersioningType 
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

import helmet from 'helmet';
import morgan from 'morgan'; 
import cookieParser from 'cookie-parser';

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    { rawBody: true },
  );

  const configService = app.get(ConfigService);

  app.use(helmet());

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL') || '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  if (nodeEnv === 'development') {
    app.use(morgan('dev')); 
  } else {
    app.use(morgan('combined')); 
  }

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1', 
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true, 
      transform: true, 
    }),
  );

  app.enableShutdownHooks();

  app.use(cookieParser());

  const port = configService.get<number>('PORT') || 3000;
  const host = configService.get<string>('HOST') || '10.10.33.9';

  await app.listen(
    port,
    host,
  );

  console.log(`API: ${host}:${port}/api/v1`);
  if (nodeEnv !== 'production') {
    console.log(`Docs: ${host}:${port}/docs`);
  }
  
}
bootstrap();
