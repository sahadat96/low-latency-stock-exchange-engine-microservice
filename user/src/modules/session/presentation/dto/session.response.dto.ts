export class SessionDto {
  id!: string;
  ipAddress!: string | null;
  userAgent!: string | null;
  country!: string | null;
  createdAt!: Date;
  expiresAt!: Date;
  revokedAt!: Date | null;
  isActive!: boolean;
  isCurrent!: boolean;
}

export class SessionListResponseDto {
  sessions!: SessionDto[];
  total!: number;
  active!: number;
  revoked!: number;
}