import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  UseGuards,
  Get,
  Query,
  Delete,
  Param,
} from '@nestjs/common';

import { ApiKeyService } from '../../application/api-key.service';

import { 
  CreateApiKeyDto,
  ListApiKeysQueryDto,
 } from '../dto/api-key.dto';

import { 
  CreateApiKeyResponseDto,
  ApiKeyListResponseDto
 } from '../dto/api-key.response.dto';

import type { JwtPayload } from '@/common/decorators/current.user.decorato';
import { CurrentUser } from '@/common/decorators/current.user.decorato';

@Controller('api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createApiKey(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateApiKeyDto,
    @Ip() ip: string,
  ): Promise<CreateApiKeyResponseDto> {
    return this.apiKeyService.createApiKey(user.sub, dto, ip);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listApiKeys(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListApiKeysQueryDto,
  ): Promise<ApiKeyListResponseDto> {
    return this.apiKeyService.listApiKeys(user.sub, query);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeApiKey(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Ip() ip: string,
  ): Promise<void> {
    await this.apiKeyService.revokeApiKey(
      user.sub,
      id,
      ip,
    );
  }
}