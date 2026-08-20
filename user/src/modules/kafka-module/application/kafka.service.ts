import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(KafkaService.name);

  private readonly kafka: Kafka;

  private readonly producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID ?? 'user-service',
      brokers: (
        process.env.KAFKA_BROKERS ?? 'localhost:9092'
      ).split(','),
    });

    this.producer = this.kafka.producer();
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  private async connect(): Promise<void> {
    try {
      await this.producer.connect();

      this.logger.log(
        'Kafka producer connected successfully',
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
}