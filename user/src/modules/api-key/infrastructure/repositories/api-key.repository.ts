import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

import { IApiKeyRepository } from '../../domain/interfaces/api-key.repository.interface';
import { 
  ApiKeyEntity,
  CountApiKeysFilter,
  CreateApiKeyPayload,
  FindApiKeyByIdFilter,
  FindApiKeyByPrefixFilter,
  ListApiKeysFilter,
  UpdateApiKeyPayload,
} from '../../domain/types/api-key.types';

@Injectable()
export class ApiKeyRepository implements IApiKeyRepository {
  private readonly logger = new Logger(ApiKeyRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateApiKeyPayload): Promise<ApiKeyEntity> {
    return this.prisma.apiKey.create({
      data: {
        userId:      payload.userId,
        name:        payload.name,
        keyHash:     payload.keyHash,
        keyPrefix:   payload.keyPrefix,
        ipWhitelist: payload.ipWhitelist,
        expiresAt:   payload.expiresAt ?? null,
      },
    });
  }
}