import { KafkaEvent } from '../kafka.types';

export interface UserVerifiedPayload {
  userId: string;
  verificationType: 'email' | 'phone';
}

export type UserVerifiedEvent = KafkaEvent<UserVerifiedPayload>;