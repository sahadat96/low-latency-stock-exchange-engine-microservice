import { Module } from '@nestjs/common';

import { WALLET_REPOSITORY } from './domain/interfaces/wallet.repository.interface';
import { WalletService } from './application/wallet.service';
import { WalletController } from './presentation/controller/wallet.controller';
import { WalletRepository } from './infrastructure/wallet.repository';

@Module({
  imports: [
  ],

  controllers: [
    WalletController,
  ],

  providers: [
    WalletService,
    {
      provide: WALLET_REPOSITORY,
      useClass: WalletRepository,
    },
  ],

  exports: [
    WalletService
  ],
})
export class WalletModule {}
