import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import type {
  IWalletRepository,
} from '../domain/interfaces/wallet.repository.interface';

import {
  WALLET_REPOSITORY,
} from '../domain/interfaces/wallet.repository.interface';

import type { WalletDto } from '../presentation/dto/wallet.dto';

import { WalletMapper } from '../infrastructure/mapper/wallet.mapper';

@Injectable()
export class WalletService {
  private readonly logger =
    new Logger(WalletService.name);

  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
  ) {}

  async getMyWallet(
    userId: string,
  ): Promise<WalletDto> {

    const wallet =
      await this.walletRepository.findByUser({
        userId,
      });

    if (!wallet) {
      this.logger.warn(
        `Wallet not found for user=${userId}`,
      );

      throw new NotFoundException(
        'Wallet not found.',
      );
    }

    return WalletMapper.toDto(wallet);
  }
}