import { Wallet } from '@prisma/client';

export type WalletEntity = Wallet;

export interface FindWalletByUserFilter {
  userId: string;
}

export interface CreateWalletPayload {
  userId: string;
  currency: string;
}

export interface UpdateWalletBalancePayload {
  availableBalance?: string;
  lockedBalance?: string;
}

export interface UpdateWalletStatusPayload {
  status: string;
}