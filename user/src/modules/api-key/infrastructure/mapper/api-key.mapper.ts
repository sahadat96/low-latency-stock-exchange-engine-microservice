import { ApiKey } from '@prisma/client';

import { ListApiKeysQueryDto } from '../../presentation/dto/api-key.dto';

import { 
    ApiKeyDto,
    CreateApiKeyResponseDto,
    ApiKeyListResponseDto,
} from '../../presentation/dto/api-key.response.dto';

const MAX_KEYS_PER_USER = 10;

export class ApiKeyMapper {

  static toDto(apiKey: ApiKey): ApiKeyDto {
    const now = new Date();

    return {
      id:          apiKey.id,
      name:        apiKey.name,
      keyPrefix:   apiKey.keyPrefix,
      ipWhitelist: apiKey.ipWhitelist,
      expiresAt:   apiKey.expiresAt,
      lastUsedAt:  apiKey.lastUsedAt,
      createdAt:   apiKey.createdAt,
      revokedAt:   apiKey.revokedAt,
      isActive:
        !apiKey.revokedAt &&
        (!apiKey.expiresAt || apiKey.expiresAt > now),
    };
  }

  static toCreateResponseDto(
    apiKey: ApiKey,
    rawKey: string,
  ): CreateApiKeyResponseDto {
    return {
      ...ApiKeyMapper.toDto(apiKey),
      rawKey,
      warning: 'Store this key securely. It will not be shown again.',
    };
  }

  static toDtoList(
    allKeys: ApiKey[],             
    filteredKeys: ApiKey[],         
    query: ListApiKeysQueryDto,
  ): ApiKeyListResponseDto {
    const now = new Date();
 
    const isActive = (k: ApiKey) =>
      !k.revokedAt && (!k.expiresAt || k.expiresAt > now);
 
    const activeCount  = allKeys.filter(isActive).length;
    const revokedCount = allKeys.length - activeCount;
 
    return {
      data: filteredKeys.map(ApiKeyMapper.toDto),
      meta: {
        total:   filteredKeys.length,
        active:  activeCount,
        revoked: revokedCount,
        limit:   MAX_KEYS_PER_USER,
        filters: {
          ...(query.active !== undefined && { active: query.active }),
        },
      },
    };
  }
}