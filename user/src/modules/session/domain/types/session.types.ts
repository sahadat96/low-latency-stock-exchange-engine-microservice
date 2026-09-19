import { Session } from '@prisma/client';

export type SessionEntity = Session;

export interface CreateSessionPayload {
  userId: string;
  accessTokenJti: string;
  refreshTokenHash: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  country?: string;
  expiresAt: Date;
}

export interface FindSessionByIdFilter {
  id: string;
  userId: string;
  includeRevoked?: boolean;
}

export interface ListSessionsFilter {
  userId: string;
  includeRevoked?: boolean;
}

export interface RevokeSessionPayload {
  id: string;
  userId: string;
}

export interface RevokeAllSessionsPayload {
  userId: string;
  exceptSessionId?: string;
}