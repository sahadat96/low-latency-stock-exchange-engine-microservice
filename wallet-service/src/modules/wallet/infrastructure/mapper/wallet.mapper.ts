import type { WalletEntity } from '../../domain/types/wallet.types';

import type { WalletDto } from '../../presentation/dto/wallet.dto';

export class WalletMapper {
  static toDto(
    wallet: WalletEntity,
  ): WalletDto {
    return {
      id: wallet.id,
      userId: wallet.userId,
      currency: wallet.currency as WalletDto['currency'],

      availableBalance:
        wallet.availableBalance.toString(),

      lockedBalance:
        wallet.lockedBalance.toString(),

      status:
        wallet.status as WalletDto['status'],

      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }
}