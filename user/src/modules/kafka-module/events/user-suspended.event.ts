import { KafkaEvent } from '../kafka.types';

export interface UserSuspendedPayload {
  userId: string;
  reason?: string;
}

export type UserSuspendedEvent = KafkaEvent<UserSuspendedPayload>;