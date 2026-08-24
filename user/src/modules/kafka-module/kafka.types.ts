// Common metadata shared by every Kafka event.
export interface KafkaEventMetadata {
  eventId: string;
  eventVersion: number;
  occurredAt: string;
  correlationId?: string;
  causationId?: string;
}

// Generic Kafka event envelope.
export interface KafkaEvent<TPayload> {
  metadata: KafkaEventMetadata;
  payload: TPayload;
}

//user.registered
export interface UserRegisteredPayload {
  userId: string;
  email: string;
}

// user.verified
export interface UserVerifiedPayload {
  userId: string;
  verificationType: 'email' | 'phone';
}

// user.suspended
export interface UserSuspendedPayload {
  userId: string;
  reason?: string;
}

// Typed user events.
export type UserRegisteredEvent =
  KafkaEvent<UserRegisteredPayload>;

export type UserVerifiedEvent =
  KafkaEvent<UserVerifiedPayload>;

export type UserSuspendedEvent =
  KafkaEvent<UserSuspendedPayload>;