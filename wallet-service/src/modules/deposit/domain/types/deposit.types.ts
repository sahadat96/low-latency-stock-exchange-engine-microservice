import type {
  Currency,
  TransactionStatus,
  WalletTransaction,
} from '@prisma/client';

export interface CreateDepositPayload {
  userId: string;
  amount: string;
  currency: Currency;
  idempotencyKey: string;
}

export interface DepositResult {
  transaction: WalletTransaction;
  status: TransactionStatus;
}

export interface ExecuteDepositPayload {
  userId: string;
  amount: string;
  currency: Currency;
  idempotencyKey: string;
  description?: string;
  referenceId?: string;
}

export interface IdempotencyRecord {
  id: string;
  userId: string;
  key: string;
  operation: string;
  responseStatus: number | null;
  responseBody: unknown;
  createdAt: Date;
  expiresAt: Date | null;
}

export const DEPOSIT_OPERATION = 'DEPOSIT';