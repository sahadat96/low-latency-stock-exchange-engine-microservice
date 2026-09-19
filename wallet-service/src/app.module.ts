import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletModule } from './modules/wallet/wallet.module';
import { TransactionModule } from './modules/transection/transaction.module';
import { DepositModule } from './modules/deposit/deposit.module';
import { KafkaModule } from './modules/withdraw/kafka/kafka.module';
import kafkaConfig from './modules/withdraw/kafka/kafka.config';

@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal: true,

      load: [
        kafkaConfig,
      ],

      cache: true,
    }),
    WalletModule,
    TransactionModule,
    DepositModule,
    KafkaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
