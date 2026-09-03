import type {
  Currency,
  TransactionStatus,
  WalletTransaction,
} from '@prisma/client';

export interface ExecuteWithdrawPayload {
  userId: string;
  amount: string;
  currency: Currency;
  idempotencyKey: string;
  referenceId?: string;
  description?: string;
}

export interface WithdrawResult {
  transaction: WalletTransaction;
  status: TransactionStatus;
  idempotent: boolean;
}