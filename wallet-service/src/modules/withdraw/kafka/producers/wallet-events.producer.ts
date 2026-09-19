import {
  Injectable,
} from '@nestjs/common';

import {
  KafkaService,
} from '../kafka.service';

import {
  KAFKA_TOPICS,
} from '../kafka.constants';

import type {
  WalletCreatedEvent,
  WalletFundedEvent,
  WalletWithdrawalRequestedEvent,
  WalletWithdrawnEvent,
} from '../kafka.types';

@Injectable()
export class WalletEventsProducer {
  constructor(
    private readonly kafkaService: KafkaService,
  ) {}

  async publishWalletCreated(
    event: WalletCreatedEvent,
    correlationId?: string,
  ): Promise<void> {
    await this.kafkaService.publish(
      KAFKA_TOPICS.WALLET_CREATED,
      event,
      {
        key: event.userId,
        correlationId,
      },
    );
  }

  async publishWalletFunded(
    event: WalletFundedEvent,
    correlationId?: string,
  ): Promise<void> {
    await this.kafkaService.publish(
      KAFKA_TOPICS.WALLET_FUNDED,
      event,
      {
        key: event.userId,
        correlationId,
      },
    );
  }

  async publishWithdrawalRequested(
    event: WalletWithdrawalRequestedEvent,
    correlationId?: string,
  ): Promise<void> {
    await this.kafkaService.publish(
      KAFKA_TOPICS.WALLET_WITHDRAWAL_REQUESTED,
      event,
      {
        key: event.userId,
        correlationId,
      },
    );
  }

  async publishWalletWithdrawn(
    event: WalletWithdrawnEvent,
    correlationId?: string,
  ): Promise<void> {
    await this.kafkaService.publish(
      KAFKA_TOPICS.WALLET_WITHDRAWN,
      event,
      {
        key: event.userId,
        correlationId,
      },
    );
  }
}