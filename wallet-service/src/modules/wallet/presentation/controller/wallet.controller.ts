import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { WalletService } from '../../application/wallet.service';

import { WalletDto } from '../dto/wallet.dto';

import { CurrentUser } from 'src/common/decorators/current.user.decorato';

import type { JwtPayload } from 'src/common/decorators/current.user.decorato';

@Controller('wallets')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
  ) {}
  
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyWallet(
    @CurrentUser() user: JwtPayload,
  ): Promise<WalletDto> {
    return this.walletService.getMyWallet(
      user.sub,
    );
  }
}

