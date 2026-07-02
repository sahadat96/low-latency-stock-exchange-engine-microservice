import { 
    Module, 
    NestModule, 
    MiddlewareConsumer 
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { LoggerMiddleware } from 'src/common/middleware/logger.middleware';
import { AuthController } from './presentation/controller/auth.controller';


@Module({
  imports:[
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService], 
      useFactory: (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),
      signOptions: { 
        expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h') as any, 
      },
      }),
    }),
  ],
  controllers:[
    AuthController
  ],
  providers:[
    PrismaService,
  ],
  exports: [
    JwtModule,
    PassportModule,
  ],
})

export class AuthModule implements NestModule {

   configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(LoggerMiddleware)
  //.exclude('health')
    .forRoutes(AuthController);
  }
}