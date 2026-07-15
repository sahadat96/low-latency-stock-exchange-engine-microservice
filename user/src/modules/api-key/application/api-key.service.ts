import * as crypto from 'crypto';

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import type {
    IAuditLogRepository
} from '../domain/interfaces/audit-log.repository.interfacet';
import { AUDIT_LOG_REPOSITORY } from '../domain/interfaces/audit-log.repository.interfacet';
import type {
    IApiKeyRepository
} from '../domain/interfaces/api-key.repository.interface';
import { API_KEY_REPOSITORY } from '../domain/interfaces/api-key.repository.interface';

import { ApiKeyMapper } from '../infrastructure/mapper/api-key.mapper';

import { CreateApiKeyDto } from '../presentation/dto/api-key.dto';
import { 
    CreateApiKeyResponseDto,
    ApiKeyDto 
} from '../presentation/dto/api-key.response.dto';

const MAX_KEYS_PER_USER    = 10;
const KEY_PREFIX_HEADER    = 'tg_live_';
const BCRYPT_ROUNDS        = 10;
const PREFIX_RANDOM_BYTES  = 4;   
const SECRET_RANDOM_BYTES  = 32; 
const MAX_PREFIX_ATTEMPTS  = 3;

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

  constructor(
    @Inject(API_KEY_REPOSITORY)
    private readonly apiKeyRepository: IApiKeyRepository,

    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async createApiKey(
    userId: string,
    dto: CreateApiKeyDto,
    ipAddress?: string,
  ): Promise<CreateApiKeyResponseDto> {

    const activeCount = await this.apiKeyRepository.count({
      userId,
      activeOnly: true,
    });

    if (activeCount >= MAX_KEYS_PER_USER) {
      throw new BadRequestException(
        `Maximum of ${MAX_KEYS_PER_USER} active API keys allowed. ` +
        `Revoke an existing key before creating a new one.`,
      );
    }

    const expiresAt = this.parseAndValidateExpiry(dto.expiresAt);

    const { rawKey, keyPrefix } = await this.generateUniqueKeyPrefix();

    const keyHash = await bcrypt.hash(rawKey, BCRYPT_ROUNDS);

    const apiKey = await this.apiKeyRepository.create({
      userId,
      name:        dto.name,
      keyHash,
      keyPrefix,
      ipWhitelist: dto.ipWhitelist ?? [],
      expiresAt,
    });

    this.fireAuditLog({
      userId,
      action:     AuditAction.API_KEY_CREATED,
      resource:   'api_key',
      resourceId: apiKey.id,
      ipAddress,
      metadata: {
        keyPrefix,
        keyName:     dto.name,
        ipWhitelist: dto.ipWhitelist ?? [],
        expiresAt:   expiresAt?.toISOString() ?? null,
      },
    });

    this.logger.log(
      `API key created: user=${userId} prefix=${keyPrefix} name="${dto.name}"`,
    );

    return ApiKeyMapper.toCreateResponseDto(apiKey, rawKey);
  }

  private parseAndValidateExpiry(raw?: string): Date | undefined {
    if (!raw) return undefined;
 
    const date           = new Date(raw);
    const oneMinuteAhead = new Date(Date.now() + 60_000);
 
    if (isNaN(date.getTime())) {
      throw new BadRequestException('expiresAt is not a valid date.');
    }
 
    if (date <= oneMinuteAhead) {
      throw new BadRequestException(
        'expiresAt must be at least 1 minute in the future.',
      );
    }
 
    return date;
  }

  private async generateUniqueKeyPrefix(
    attempt = 0,
  ): Promise<{ rawKey: string; keyPrefix: string }> {
    if (attempt >= MAX_PREFIX_ATTEMPTS) {
      throw new Error(
        `Could not generate a unique API key prefix after ${MAX_PREFIX_ATTEMPTS} attempts.`,
      );
    }
 
    const prefixRandom = crypto
      .randomBytes(PREFIX_RANDOM_BYTES)
      .toString('hex');                             
 
    const secret = crypto
      .randomBytes(SECRET_RANDOM_BYTES)
      .toString('hex');                             
 
    const keyPrefix = `${KEY_PREFIX_HEADER}${prefixRandom}`;
    const rawKey    = `${keyPrefix}.${secret}`;
 
    const collision = await this.apiKeyRepository.findByPrefix({
      keyPrefix,
      includeRevoked: true, 
    });
 
    if (collision) {
      this.logger.warn(
        `Key prefix collision on attempt ${attempt + 1}, retrying...`,
      );
      return this.generateUniqueKeyPrefix(attempt + 1);
    }
 
    return { rawKey, keyPrefix };
  }

  private fireAuditLog(
    payload: Parameters<IAuditLogRepository['create']>[0],
  ): void {
    this.auditLogRepository
      .create(payload)
      .catch((err: Error) => {
        this.logger.error(`Audit log failed [${payload.action}]: ${err.message}`);
      });
  }
}