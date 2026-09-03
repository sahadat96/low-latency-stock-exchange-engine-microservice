import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { CurrentUser } from 'src/common/decorators/current.user.decorato';

import type { JwtPayload } from 'src/common/decorators/current.user.decorato';
import {
  DepositService,
} from '../../application/deposit.service';

import {
  CreateDepositDto,
} from '../dto/create-deposit.dto';

import {
  DepositResponseDto,
} from '../dto/deposit.response.dto';

@Controller('wallets')
export class DepositController {
  constructor(
    private readonly depositService: DepositService,
  ) {}

  @Post('me/deposit')
  @HttpCode(HttpStatus.OK)
  async createDeposit(
    @CurrentUser() user: JwtPayload,

    @Headers('idempotency-key')
    idempotencyKey: string,

    @Body()
    dto: CreateDepositDto,
  ): Promise<DepositResponseDto> {
    return this.depositService.createDeposit(
      user.sub,
      idempotencyKey,
      dto,
    );
  }
}