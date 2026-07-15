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
}

export const API_KEY_REPOSITORY = Symbol('IApiKeyRepository');