import { TransactionStatus, TransactionType, Currency } from '@prisma/client';

export class TransactionDto {
  id!: string;
  walletId!: string;
  type!: TransactionType;
  status!: TransactionStatus;
  amount!: string;
  currency!: Currency;
  balanceBefore!: string;
  balanceAfter!: string;
  referenceId!: string | null;
  description!: string | null;
  createdAt!: Date;
  completedAt!: Date | null;
}