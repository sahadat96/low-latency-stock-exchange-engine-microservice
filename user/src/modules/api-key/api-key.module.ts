import { Module } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

import { API_KEY_REPOSITORY } from './domain/interfaces/api-key.repository.interface';
import { AUDIT_LOG_REPOSITORY } from './domain/interfaces/audit-log.repository.interfacet';

import { ApiKeyRepository } from './infrastructure/repositories/api-key.repository';
import { AuditLogRepository } from './domain/interfaces/audit-log.repository.interfacet';
import { ApiKeyService } from './application/api-key.service';
import { ApiKeyController } from './presentation/controller/api-key.controller';

@Module({
  controllers: [ApiKeyController],
  providers: [
    PrismaService,
    ApiKeyService,
    {
      provide: API_KEY_REPOSITORY,
      useClass: ApiKeyRepository,
    },
    {
      provide: AUDIT_LOG_REPOSITORY,
      useClass: AuditLogRepository,
    },
  ],
  exports: [
      PrismaService,
  ],
})
export class ApiKeyModule {}