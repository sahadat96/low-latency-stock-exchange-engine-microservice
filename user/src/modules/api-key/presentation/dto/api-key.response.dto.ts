export class ApiKeyDto {
  id!: string;
  name!: string;
  keyPrefix!: string;       
  ipWhitelist!: string[];
  expiresAt!: Date | null;
  lastUsedAt!: Date | null;
  createdAt!: Date;
  revokedAt!: Date | null;
  isActive!: boolean;  
}


export class CreateApiKeyResponseDto extends ApiKeyDto {
  rawKey!: string;         
  warning!: string;  
}