import { registerAs } from '@nestjs/config';

//kafka config

export default registerAs('kafka', () => ({
  clientId:
    process.env.KAFKA_CLIENT_ID ??
    'wallet-service',

  brokers:
    process.env.KAFKA_BROKERS
      ?.split(',')
      .map((broker) => broker.trim())
      .filter(Boolean) ??
    ['localhost:9092'],

  groupId:
    process.env.KAFKA_GROUP_ID ?? 'wallet-service-group',

  connectionTimeout: Number(
    process.env.KAFKA_CONNECTION_TIMEOUT ??
      10_000,
  ),

  authenticationTimeout: Number(
    process.env.KAFKA_AUTHENTICATION_TIMEOUT ??
      10_000,
  ),

  requestTimeout: Number(
    process.env.KAFKA_REQUEST_TIMEOUT ??
      30_000,
  ),

  retry: {
    initialRetryTime: Number(
      process.env.KAFKA_RETRY_INITIAL_TIME ??
        300,
    ),

    retries: Number(
      process.env.KAFKA_RETRY_COUNT ??
        8,
    ),
  },

  ssl:
    process.env.KAFKA_SSL === 'true',

  sasl:
    process.env.KAFKA_USERNAME &&
    process.env.KAFKA_PASSWORD
      ? {
          mechanism:
            (process.env.KAFKA_SASL_MECHANISM ??
              'scram-sha-256') as
              | 'plain'
              | 'scram-sha-256'
              | 'scram-sha-512',

          username:
            process.env.KAFKA_USERNAME,

          password:
            process.env.KAFKA_PASSWORD,
        }
      : undefined,
}));