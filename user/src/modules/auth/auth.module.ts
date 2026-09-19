import { 
    Module, 
    NestModule, 
    MiddlewareConsumer 
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './application/auth.service';

import { UserRepository } from './infrastructure/repositories/user.repository';
import { AuthController } from './presentation/controller/auth.controller';
import { LoggerMiddleware } from 'src/common/middleware/logger.middleware';
import { KafkaModule } from '../kafka-module/kafka.module';

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

    KafkaModule,

  ],
  controllers:[
    AuthController
  ],
  providers:[
    PrismaService,
    AuthService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
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

