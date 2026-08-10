import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import {
  AuditAction,
} from '@prisma/client';

import {
  IAuditLogRepository,
} from '../domain/interfaces/audit-log.repository.interface';

import {
  AUDIT_LOG_REPOSITORY,
} from '../domain/interfaces/audit-log.repository.interface';

import {
  ISessionRepository,
} from '../domain/interfaces/session.repository.interface';

import {
  SESSION_REPOSITORY,
} from '../domain/interfaces/session.repository.interface';

import {
  CreateSessionDto,
  ListSessionsQueryDto,
} from '../presentation/dto/session.dto';

import {
  CreateSessionResponseDto,
  SessionListResponseDto,
} from '../presentation/dto/session.response.dto';

import {
  SessionMapper,
} from '../infrastructure/mapper/session.mapper';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class SessionService {

  private readonly logger =
    new Logger(SessionService.name);

  constructor(

    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,

    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: IAuditLogRepository,

  ) {}

  /**
   * Create authentication session.
   *
   * Raw refresh token is NEVER persisted.
   */
  async createSession(
    dto: CreateSessionDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<CreateSessionResponseDto> {

    const expiresAt = new Date(dto.expiresAt);

    if (isNaN(expiresAt.getTime())) {
      throw new BadRequestException(
        'expiresAt must be a valid date.',
      );
    }

    if (expiresAt <= new Date()) {
      throw new BadRequestException(
        'expiresAt must be in the future.',
      );
    }

    /**
     * Hash refresh token before persistence.
     *
     * NEVER store the raw refresh token in PostgreSQL.
     */
    const refreshTokenHash = await bcrypt.hash(
      dto.refreshToken,
      BCRYPT_ROUNDS,
    );

    const session =
      await this.sessionRepository.create({

        userId: dto.userId,

        accessTokenJti:
          dto.accessTokenJti,

        refreshTokenHash,

        ipAddress:
          ipAddress ?? dto.ipAddress,

        userAgent:
          userAgent ?? dto.userAgent,

        deviceFingerprint:
          dto.deviceFingerprint,

        country:
          dto.country,

        expiresAt,
      });

    this.fireAuditLog({
      userId: session.userId,

      action:
        AuditAction.SESSION_CREATED,

      resource: 'session',

      resourceId: session.id,

      ipAddress:
        ipAddress ?? dto.ipAddress,

      userAgent:
        userAgent ?? dto.userAgent,

      metadata: {
        sessionId: session.id,
        expiresAt: session.expiresAt.toISOString(),
      },
    });

    this.logger.log(
      `Session created: user=${session.userId} session=${session.id}`,
    );

    return SessionMapper.toCreateResponseDto(
      session,
    );
  }

  /**
   * List sessions belonging to authenticated user.
   */

  private fireAuditLog(
    payload: Parameters<
      IAuditLogRepository['create']
    >[0],
  ): void {

    this.auditLogRepository
      .create(payload)
      .catch((err: Error) => {

        this.logger.error(
          `Audit log failed [${payload.action}]: ${err.message}`,
        );

      });
  }
}