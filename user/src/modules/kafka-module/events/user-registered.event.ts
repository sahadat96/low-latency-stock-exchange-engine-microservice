import { KafkaEvent } from '../kafka.types';

export interface UserRegisteredPayload {
  userId: string;
  email: string;
}

export type UserRegisteredEvent = KafkaEvent<UserRegisteredPayload>;