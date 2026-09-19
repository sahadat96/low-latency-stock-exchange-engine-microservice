import type { Currency } from '@prisma/client';

import type {
  WithdrawResult,
} from '../types/withdraw.types';

export interface IWithdrawRepository {
  executeWithdrawal(
    userId: string,
    amount: string,
    currency: Currency,
    idempotencyKey: string,
    referenceId?: string,
    description?: string,
  ): Promise<WithdrawResult>;
}

export const WITHDRAW_REPOSITORY = Symbol(
  'IWithdrawRepository',
);