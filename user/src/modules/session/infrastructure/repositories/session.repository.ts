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

  async revoke(
    payload: RevokeSessionPayload,
  ): Promise<SessionEntity | null> {

    const session = await this.prisma.session.findFirst({
      where: {
        id: payload.id,
        userId: payload.userId,
        revokedAt: null,
      },
    });

    if (!session) {
      return null;
    }

    return this.prisma.session.update({
      where: {
        id: session.id,
      },

      data: {
        revokedAt: new Date(),
      },
    });
  }

  async revokeAll(
    payload: RevokeAllSessionsPayload,
  ): Promise<number> {

    const result = await this.prisma.session.updateMany({
      where: {
        userId: payload.userId,

        revokedAt: null,

        ...(payload.exceptSessionId ? {
              id: {
                not: payload.exceptSessionId,
              },
            }
          : {}),
      },

      data: {
        revokedAt: new Date(),
      },
    });

    return result.count;
  }
}