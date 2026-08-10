import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import {
  ISessionRepository,
} from '../../domain/interfaces/session.repository.interface';

import {
  CreateSessionPayload,
  FindSessionByIdFilter,
  ListSessionsFilter,
  RevokeAllSessionsPayload,
  RevokeSessionPayload,
  SessionEntity,
} from '../../domain/types/session.types';

@Injectable()
export class SessionRepository implements ISessionRepository {

  private readonly logger = new Logger(SessionRepository.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    payload: CreateSessionPayload,
  ): Promise<SessionEntity> {

    return this.prisma.session.create({
      data: {
        userId: payload.userId,
        accessTokenJti: payload.accessTokenJti,
        refreshTokenHash: payload.refreshTokenHash,
        ipAddress: payload.ipAddress ?? null,
        userAgent: payload.userAgent ?? null,
        deviceFingerprint:payload.deviceFingerprint ?? null,
        country: payload.country ?? null,
        expiresAt: payload.expiresAt,
      },
    });
  }

  async findById(
    filter: FindSessionByIdFilter,
  ): Promise<SessionEntity | null> {

    return this.prisma.session.findFirst({
      where: {
        id: filter.id,
        userId: filter.userId,

        revokedAt: filter.includeRevoked
          ? undefined
          : null,
      },
    });
  }

  async findAllByUser(
    filter: ListSessionsFilter,
  ): Promise<SessionEntity[]> {

    return this.prisma.session.findMany({
      where: {
        userId: filter.userId,

        revokedAt:
          filter.includeRevoked === false
            ? null
            : undefined,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}