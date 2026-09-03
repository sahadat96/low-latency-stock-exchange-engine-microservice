import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import type {
  Consumer,
  EachMessagePayload,
} from 'kafkajs';

import {
  KafkaService,
} from '../kafka.service';

import {
  KAFKA_GROUPS,
  KAFKA_TOPICS,
} from '../kafka.constants';

import type {
  KafkaEvent,
  UserRegisteredEvent,
  UserSuspendedEvent,
} from '../kafka.types';

@Injectable()
export class UserEventsConsumer
  implements
    OnModuleInit,
    OnModuleDestroy
{
  private readonly logger =
    new Logger(
      UserEventsConsumer.name,
    );

  private consumer?: Consumer;

  constructor(
    private readonly kafkaService: KafkaService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.consumer =
      await this.kafkaService.createConsumer(
        KAFKA_GROUPS.WALLET_USER_EVENTS,
      );

    await this.consumer.subscribe({
      topics: [
        KAFKA_TOPICS.USER_REGISTERED,
        KAFKA_TOPICS.USER_SUSPENDED,
      ],

      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async (
        payload,
      ) => {
        await this.handleMessage(
          payload,
        );
      },
    });

    this.logger.log(
      'User event consumer started',
    );
  }

  async onModuleDestroy(): Promise<void> {}

  private async handleMessage(
    payload: EachMessagePayload,
  ): Promise<void> {
    const topic =
      payload.topic;

    const rawValue =
      payload.message.value?.toString();

    if (!rawValue) {
      this.logger.warn(
        `Received empty Kafka message topic=${topic}`,
      );

      return;
    }

    try {
      const event =
        JSON.parse(
          rawValue,
        ) as KafkaEvent;

      this.logger.debug(
        `Received event topic=${topic} eventId=${event.eventId}`,
      );

      switch (topic) {
        case KAFKA_TOPICS.USER_REGISTERED:
          await this.handleUserRegistered(
            event as KafkaEvent<UserRegisteredEvent>,
          );
          break;

        case KAFKA_TOPICS.USER_SUSPENDED:
          await this.handleUserSuspended(
            event as KafkaEvent<UserSuspendedEvent>,
          );
          break;

        default:
          this.logger.warn(
            `Unhandled Kafka topic=${topic}`,
          );
      }
    } catch (error) {
      this.logger.error(
        `Failed to process Kafka message topic=${topic}`,
        error instanceof Error
          ? error.stack
          : String(error),
      );

      throw error;
    }
  }

  private async handleUserRegistered(
    event: KafkaEvent<UserRegisteredEvent>,
  ): Promise<void> {
    const {
      userId,
      email,
    } = event.data;

    this.logger.log(
      `User registered userId=${userId} email=${email}`,
    );

  }

  private async handleUserSuspended(
    event: KafkaEvent<UserSuspendedEvent>,
  ): Promise<void> {
    const {
      userId,
      reason,
    } = event.data;

    this.logger.log(
      `User suspended userId=${userId} reason=${reason ?? 'N/A'}`,
    );
  }
}