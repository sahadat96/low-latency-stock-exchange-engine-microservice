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

  async findByPrefix(
    filter: FindApiKeyByPrefixFilter,
  ): Promise<ApiKeyEntity | null> {
    return this.prisma.apiKey.findFirst({
      where: {
        keyPrefix:  filter.keyPrefix,
        revokedAt:  filter.includeRevoked ? undefined : null,
      },
    });
  }

  async count(filter: CountApiKeysFilter): Promise<number> {
    return this.prisma.apiKey.count({
      where: {
        userId:    filter.userId,
        revokedAt: filter.activeOnly ? null : undefined,
      },
    });
  }

  async findAllByUser(
    filter: ListApiKeysFilter,
  ): Promise<ApiKeyEntity[]> {
    return this.prisma.apiKey.findMany({
      where: {
        userId:    filter.userId,
        revokedAt: filter.includeRevoked === false ? null : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}