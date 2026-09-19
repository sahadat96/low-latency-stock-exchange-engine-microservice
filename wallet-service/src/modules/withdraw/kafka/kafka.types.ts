export interface KafkaEvent<T = unknown> {
  eventId: string;
  eventType: string;
  version: number;
  occurredAt: string;
  producer: string;
  correlationId?: string;
  data: T;
}

export interface UserRegisteredEvent {
  userId: string;
  email: string;
}

export interface UserSuspendedEvent {
  userId: string;
  reason?: string;
}

export interface WalletCreatedEvent {
  walletId: string;
  userId: string;
  currency: string;
}

export interface WalletFundedEvent {
  walletId: string;
  userId: string;
  transactionId: string;
  amount: string;
  currency: string;
}

export interface WalletWithdrawalRequestedEvent {
  walletId: string;
  userId: string;
  transactionId: string;
  amount: string;
  currency: string;
}

export interface WalletWithdrawnEvent {
  walletId: string;
  userId: string;
  transactionId: string;
  amount: string;
  currency: string;
}