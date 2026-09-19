import type {
  IdempotencyRecord,
} from '../types/deposit.types';

export interface IIdempotencyRepository {
  find(
    userId: string,
    key: string,
    operation: string,
  ): Promise<IdempotencyRecord | null>;
}

export const IDEMPOTENCY_REPOSITORY = Symbol(
  'IIdempotencyRepository',
);