import { Module } from '@nestjs/common';

import { WalletController } from './presentation/controller/wallet.controller';

@Module({
  imports: [
  ],

  controllers: [
    WalletController,
  ],

  providers: [],

  exports: [],
})
export class WalletModule {}
