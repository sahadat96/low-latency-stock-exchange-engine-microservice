import { Module } from '@nestjs/common';

import { ApiKeyRepository } from './infrastructure/repositories/api-key.repository';
import { ApiKeyService } from './application/api-key.service';
import { ApiKeyController } from './presentation/controller/api-key.controller';

@Module({
  controllers: [ApiKeyController],
  providers: [
    ApiKeyService,
    {
      provide: 'IApiKeyRepository',
      useClass: ApiKeyRepository,
    },
  ],
})
export class ApiKeyModule {}