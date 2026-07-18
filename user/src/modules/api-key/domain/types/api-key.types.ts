import { ApiKey } from "@prisma/client";

export type ApiKeyEntity = ApiKey;


export interface FindApiKeyByPrefixFilter {
  keyPrefix: string;
  includeRevoked?: boolean;   
}

export interface FindApiKeyByIdFilter {
  id: string;
  userId: string;             
  includeRevoked?: boolean;
}

export interface ListApiKeysFilter {
  userId: string;
  includeRevoked?: boolean;  
}

export interface CreateApiKeyPayload {
  userId: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  ipWhitelist: string[];
  expiresAt?: Date;
}

export interface UpdateApiKeyPayload {
  name?: string;
  ipWhitelist?: string[];
  expiresAt?: Date | null;
}

export interface CountApiKeysFilter {
  userId: string;
  activeOnly: boolean; 
}