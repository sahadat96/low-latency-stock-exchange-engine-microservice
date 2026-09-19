import { SessionEntity } from '../../domain/types/session.types';

import {
  SessionDto,
  SessionListResponseDto,
  CreateSessionResponseDto,
} from '../../presentation/dto/session.response.dto';

export class SessionMapper {

  static toDto(
    session: SessionEntity,
    currentSessionId?: string,
  ): SessionDto {
    const now = new Date();

    return {
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      country: session.country,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,

      isActive:
        session.revokedAt === null &&
        session.expiresAt > now,

      isCurrent:
        currentSessionId !== undefined &&
        session.id === currentSessionId,
    };
  }

  static toListResponseDto(
    allSessions: SessionEntity[],
    filteredSessions: SessionEntity[],
    currentSessionId?: string,
  ): SessionListResponseDto {

    const sessions = filteredSessions.map((session) =>
      this.toDto(session, currentSessionId),
    );

    return {
      sessions,

      total: allSessions.length,

      active: allSessions.filter(
        (session) =>
          session.revokedAt === null &&
          session.expiresAt > new Date(),
      ).length,

      revoked: allSessions.filter(
        (session) =>
          session.revokedAt !== null ||
          session.expiresAt <= new Date(),
      ).length,
    };
  }

  static toCreateResponseDto(
    session: SessionEntity,
  ): CreateSessionResponseDto {

    return this.toDto(session);
  }
}