import { Module } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

import { SESSION_REPOSITORY } from './domain/interfaces/session.repository.interface';
import { SessionRepository } from './infrastructure/repositories/session.repository';
import { 
  AuditLogRepository,
  AUDIT_LOG_REPOSITORY,
 } from '../api-key/domain/interfaces/audit-log.repository.interfacet';

import { SessionService } from './application/session.service';

import { SessionController } from './presentation/controller/session.controller';


@Module({
  controllers: [
    SessionController,
  ],

  providers: [
    PrismaService,
    SessionService,
    {
      provide: SESSION_REPOSITORY,
      useClass: SessionRepository,
    },

    {
      provide: AUDIT_LOG_REPOSITORY,
      useClass: AuditLogRepository,
    },
  ],

  exports: [
    SessionService,
    PrismaService,
  ],
})
export class SessionModule {}