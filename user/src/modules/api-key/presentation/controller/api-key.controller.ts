import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ApiKeyService } from '../../application/api-key.service';

import { CreateApiKeyDto } from '../dto/api-key.dto';
import { CreateApiKeyResponseDto } from '../dto/api-key.response.dto';

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
}