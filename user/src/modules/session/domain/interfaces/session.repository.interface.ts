import {
  SessionEntity,
  FindSessionByIdFilter,
  ListSessionsFilter,
  RevokeSessionPayload,
  RevokeAllSessionsPayload,
} from '../types/session.types';

export interface ISessionRepository {
  findById(
    filter: FindSessionByIdFilter,
  ): Promise<SessionEntity | null>;

  findAllByUser(
    filter: ListSessionsFilter,
  ): Promise<SessionEntity[]>;

  revoke(
    payload: RevokeSessionPayload,
  ): Promise<SessionEntity | null>;

  revokeAll(
    payload: RevokeAllSessionsPayload,
  ): Promise<number>;
}

export const SESSION_REPOSITORY = Symbol('ISessionRepository');