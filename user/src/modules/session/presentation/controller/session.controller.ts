import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Post,
  Body,
  Ip,
} from '@nestjs/common';

import {
  ListSessionsQueryDto,
  CreateSessionDto,
} from '../dto/session.dto';

import { 
  SessionListResponseDto,
  CreateSessionResponseDto,
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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSession(
    @Body() dto: CreateSessionDto,
    @Ip() ip: string,
  ): Promise<CreateSessionResponseDto> {

    return this.sessionService.createSession(
      dto,
      ip,
    );
  }

  @Get('list-get')
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