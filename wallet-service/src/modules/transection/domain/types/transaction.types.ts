import type {
  TransactionStatus,
  TransactionType,
  WalletTransaction,
} from '@prisma/client';

export type TransactionEntity = WalletTransaction;

export interface ListTransactionsFilter {
  userId: string;
  page: number;
  perPage: number;
  type?: TransactionType;
  status?: TransactionStatus;
  fromDate?: Date;
  toDate?: Date;
}

export interface TransactionListResult {
  transactions: TransactionEntity[];

  total: number;
}