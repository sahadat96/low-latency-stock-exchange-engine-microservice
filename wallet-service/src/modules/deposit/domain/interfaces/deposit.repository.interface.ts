import type {
  Currency,
} from '@prisma/client';

import type {
  DepositResult,
} from '../types/deposit.types';

export interface IDepositRepository {
  executeDeposit(
    userId: string,
    amount: string,
    currency: Currency,
    idempotencyKey: string,
    description?: string,
    referenceId?: string,
  ): Promise<DepositResult>;
}

export const DEPOSIT_REPOSITORY = Symbol(
  'IDepositRepository',
);