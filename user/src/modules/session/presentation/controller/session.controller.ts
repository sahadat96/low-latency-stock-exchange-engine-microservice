import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { SessionService }

import {
  ListSessionsQueryDto,
} from '../dto/session.dto';

import {
  SessionListResponseDto,
} from '../dto/session.response.dto';

import {
  CurrentUser,
} from '@/common/decorators/current.user.decorato';

import type {
  JwtPayload,
} from '@/common/decorators/current.user.decorato';

@Controller('sessions')
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async listSessions(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListSessionsQueryDto,
  ): Promise<SessionListResponseDto> {
    return this.sessionService.listSessions(
      user.sub,
      query,
    );
  }
}