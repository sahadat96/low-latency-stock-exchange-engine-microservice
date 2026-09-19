export const KAFKA_TOPICS = {
  USER_REGISTERED: 'user.registered',
  USER_SUSPENDED: 'user.suspended',

  WALLET_CREATED: 'wallet.created',
  WALLET_FUNDED: 'wallet.funded',
  WALLET_WITHDRAWAL_REQUESTED: 'wallet.withdrawal.requested',
  WALLET_WITHDRAWN: 'wallet.withdrawn',
  WALLET_FROZEN: 'wallet.frozen',

  TRANSACTION_CREATED: 'wallet.transaction.created',
  TRANSACTION_COMPLETED: 'wallet.transaction.completed',
  TRANSACTION_FAILED: 'wallet.transaction.failed',
} as const;

export type KafkaTopic =
  (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];

export const KAFKA_GROUPS = {
  WALLET_SERVICE: 'wallet-service-group',
  WALLET_USER_EVENTS: 'wallet-user-events-group',
} as const;

export const KAFKA_CLIENT_ID = 'wallet-service';