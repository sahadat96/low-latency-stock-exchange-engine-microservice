import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import kafkaConfig from './kafka.config';

import {
  KafkaService,
} from './kafka.service';

import {
  WalletEventsProducer,
} from './producers/wallet-events.producer';

import {
  UserEventsConsumer,
} from './consumers/user-events.consumer';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(
      kafkaConfig,
    ),
  ],

  providers: [
    KafkaService,
    WalletEventsProducer,
    UserEventsConsumer,
  ],

  exports: [
    KafkaService,

    WalletEventsProducer,
  ],
})
export class KafkaModule {}