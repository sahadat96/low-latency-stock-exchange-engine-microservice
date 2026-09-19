import type {
  FindWalletByUserFilter,
  WalletEntity,
} from '../types/wallet.types';

export interface IWalletRepository {
  findByUser(
    filter: FindWalletByUserFilter,
  ): Promise<WalletEntity | null>;
}

export const WALLET_REPOSITORY = Symbol('IWalletRepository');