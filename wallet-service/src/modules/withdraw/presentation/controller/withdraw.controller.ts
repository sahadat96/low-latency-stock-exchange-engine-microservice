import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { CurrentUser } from 'src/common/decorators/current.user.decorato';

import type { JwtPayload } from 'src/common/decorators/current.user.decorato';
import {
  WithdrawService,
} from '../../application/withdraw.service';

import {
  CreateWithdrawDto,
} from '../dto/create-withdraw.dto';

import { WithdrawResponseDto } from '../dto/withdraw-response.dto';

@Controller('wallets')
export class WithdrawController {
  constructor(
    private readonly withdrawService: WithdrawService,
  ) {}

  @Post('me/withdraw')
  @HttpCode(HttpStatus.OK)
  async createWithdrawal(
    @CurrentUser() user: JwtPayload,

    @Body()
    dto: CreateWithdrawDto,
  ): Promise<WithdrawResponseDto> {
    return this.withdrawService.createWithdrawal(
      user.sub,
      dto,
    );
  }
}