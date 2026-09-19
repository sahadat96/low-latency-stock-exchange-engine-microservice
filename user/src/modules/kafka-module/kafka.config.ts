import { registerAs } from '@nestjs/config';

export interface KafkaConfig {
  clientId: string;
  brokers: string[];
}

// kafka config
export default registerAs(
  'kafka',
  (): KafkaConfig => ({
    clientId:
      process.env.KAFKA_CLIENT_ID ?? 'user-service',

    brokers: (
      process.env.KAFKA_BROKERS ?? 'localhost:9092'
    )
      .split(',')
      .map((broker) => broker.trim())
      .filter(Boolean),
  }),
);