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

}

export const API_KEY_REPOSITORY = Symbol('IApiKeyRepository');