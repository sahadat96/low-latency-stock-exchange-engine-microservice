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

import { 
  SwaggerModule, 
  DocumentBuilder,
} from '@nestjs/swagger';

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    { rawBody: true },
  );

  const configService = app.get(ConfigService);

  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  if (nodeEnv !== 'production') {
      app.use(helmet({ contentSecurityPolicy: false }));
    } else {
      app.use(helmet());
  }

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL') || '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

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

  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('User Service API')
      .setDescription('API documentation for user service backend')
      .setVersion('1.0')
      .addServer('http://10.10.33.9:3000')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get<number>('PORT') || 3000;
  const host = configService.get<string>('HOST') || '10.10.33.9';

  await app.listen(
    port,
    host,
  );

  console.log(`API: ${host}:${port}/api/v1`);
  if (nodeEnv !== 'production') {
    console.log(`Docs: ${host}:${port}/api/docs`);;
  }
  
}
bootstrap();
