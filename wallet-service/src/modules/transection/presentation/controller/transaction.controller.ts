import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';

import { CurrentUser } from 'src/common/decorators/current.user.decorato';
import type { JwtPayload } from 'src/common/decorators/current.user.decorato';

import { TransactionService } from '../../application/transaction.service';

import {
  ListTransactionsQueryDto,
} from '../dto/list-transactions.query.dto';

import type {
  TransactionListResponseDto,
} from '../../application/transaction.service';

@Controller('wallets')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
  ) {}

  @Get('me/transactions')
  @HttpCode(HttpStatus.OK)
  async listMyTransactions(
    @CurrentUser() user: JwtPayload,

    @Query()
    query: ListTransactionsQueryDto,
  ): Promise<TransactionListResponseDto> {
    return this.transactionService.listMyTransactions(
      user.sub,
      query,
    );
  }
}