import { ApiKey } from '@prisma/client';
import { 
    ApiKeyDto,
    CreateApiKeyResponseDto
} from '../../presentation/dto/api-key.response.dto';

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
}