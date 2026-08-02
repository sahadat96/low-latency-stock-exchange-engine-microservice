import { 
  ApiKeyEntity,
  CountApiKeysFilter,
  CreateApiKeyPayload,
  FindApiKeyByIdFilter,
  FindApiKeyByPrefixFilter,
  ListApiKeysFilter,
  UpdateApiKeyPayload,
} from "../types/api-key.types";

export interface IApiKeyRepository {

  create(payload: CreateApiKeyPayload): Promise<ApiKeyEntity>;

  count(filter: CountApiKeysFilter): Promise<number>;

  findByPrefix(filter: FindApiKeyByPrefixFilter): Promise<ApiKeyEntity | null>;

  findAllByUser(filter: ListApiKeysFilter): Promise<ApiKeyEntity[]>;

  revoke(userId: string, apiKeyId: string): Promise<ApiKeyEntity | null>;
  
  revokeAll(userId: string): Promise<number>;
}

export const API_KEY_REPOSITORY = Symbol('IApiKeyRepository');