import { Module } from '@nestjs/common';
import { SessionController } from './presentation/controller/session.controller';

@Module({
  controllers: [
    SessionController,
  ],

  providers: [
  ],

  exports: [
  ],
})
export class SessionModule {}