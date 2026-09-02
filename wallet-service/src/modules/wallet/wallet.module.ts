import { Module } from '@nestjs/common';

import { WALLET_REPOSITORY } from './domain/interfaces/wallet.repository.interface';
import { WalletService } from './application/wallet.service';
import { WalletController } from './presentation/controller/wallet.controller';
import { WalletRepository } from './infrastructure/wallet.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [
  ],

  controllers: [
    WalletController,
  ],

  providers: [
    WalletService,
    PrismaService,
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
