import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import {
  Kafka,
  Producer,
  RecordMetadata,
  Consumer,
} from 'kafkajs';

import { randomUUID } from 'crypto';

import type {
  KafkaEvent,
} from './kafka.types';

@Injectable()
export class KafkaService
  implements
    OnModuleInit,
    OnModuleDestroy
{
  private readonly logger =
    new Logger(KafkaService.name);

  private readonly kafka: Kafka;

  private readonly producer: Producer;

  private readonly consumers =
    new Set<Consumer>();

  constructor(
    private readonly configService: ConfigService,
  ) {
    const brokers =
      this.configService.get<string[]>(
        'kafka.brokers',
      ) ?? ['localhost:9092'];

    this.kafka = new Kafka({
      clientId:
        this.configService.get<string>(
          'kafka.clientId',
        ) ?? 'wallet-service',

      brokers,

      connectionTimeout:
        this.configService.get<number>(
          'kafka.connectionTimeout',
        ) ?? 10_000,

      authenticationTimeout:
        this.configService.get<number>(
          'kafka.authenticationTimeout',
        ) ?? 10_000,

      requestTimeout:
        this.configService.get<number>(
          'kafka.requestTimeout',
        ) ?? 30_000,

      retry:
        this.configService.get(
          'kafka.retry',
        ) ?? {
          initialRetryTime: 300,
          retries: 8,
        },

      ssl:
        this.configService.get<boolean>(
          'kafka.ssl',
        ) ?? false,

      sasl:
        this.configService.get(
          'kafka.sasl',
        ),
    });

    this.producer =
      this.kafka.producer({
        allowAutoTopicCreation: false,

        idempotent: true,

        maxInFlightRequests: 5,
      });
  }

  async onModuleInit(): Promise<void> {
    await this.connectProducer();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  async connectProducer(): Promise<void> {
    try {
      await this.producer.connect();

      this.logger.log(
        'Kafka producer connected',
      );
    } catch (error) {
      this.logger.error(
        'Failed to connect Kafka producer',
        error instanceof Error
          ? error.stack
          : String(error),
      );

      throw error;
    }
  }

  async publish<T>(
    topic: string,
    data: T,
    options?: {
      key?: string;
      correlationId?: string;
      headers?: Record<string, string>;
    },
  ): Promise<RecordMetadata[]> {
    const event: KafkaEvent<T> = {
      eventId: randomUUID(),

      eventType: topic,

      version: 1,

      occurredAt:
        new Date().toISOString(),

      producer: 'wallet-service',

      correlationId:
        options?.correlationId,

      data,
    };

    this.logger.debug(
      `Publishing Kafka event topic=${topic} eventId=${event.eventId}`,
    );

    return this.producer.send({
      topic,

      messages: [
        {
          key: options?.key,

          value: JSON.stringify(event),

          headers:
            options?.headers,
        },
      ],
    });
  }

  async createConsumer(
    groupId: string,
  ): Promise<Consumer> {
    const consumer =
      this.kafka.consumer({
        groupId,

        allowAutoTopicCreation: false,

        sessionTimeout: 30_000,

        heartbeatInterval: 3_000,

        maxBytesPerPartition:
          1_048_576,
      });

    await consumer.connect();

    this.consumers.add(
      consumer,
    );

    this.logger.log(
      `Kafka consumer connected group=${groupId}`,
    );

    return consumer;
  }

  async disconnect(): Promise<void> {
    for (const consumer of this.consumers) {
      try {
        await consumer.disconnect();
      } catch (error) {
        this.logger.error(
          'Failed to disconnect Kafka consumer',
          error instanceof Error
            ? error.stack
            : String(error),
        );
      }
    }

    this.consumers.clear();

    try {
      await this.producer.disconnect();

      this.logger.log(
        'Kafka producer disconnected',
      );
    } catch (error) {
      this.logger.error(
        'Failed to disconnect Kafka producer',
        error instanceof Error
          ? error.stack
          : String(error),
      );
    }
  }
}