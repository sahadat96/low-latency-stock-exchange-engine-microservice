import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletModule } from './modules/wallet/wallet.module';
import { TransactionModule } from './modules/transection/transaction.module';

@Module({
  imports: [
    WalletModule,
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
