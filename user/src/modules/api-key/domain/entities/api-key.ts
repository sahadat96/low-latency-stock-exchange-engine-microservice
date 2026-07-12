
export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  revokedAt: Date | null;
  expiresAt: Date | null;
}