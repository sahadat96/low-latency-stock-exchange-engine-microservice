import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  TRANSACTION_REPOSITORY,
} from '../domain/interfaces/transaction.repository.interface';

import type {
  ITransactionRepository,
} from '../domain/interfaces/transaction.repository.interface';

import type {
  ListTransactionsFilter,
} from '../domain/types/transaction.types';

import type {
  ListTransactionsQueryDto,
} from '../presentation/dto/list-transactions.query.dto';

import type {
  TransactionDto,
} from '../presentation/dto/transaction.dto';

import { TransactionMapper } from '../infrastructure/mapper/transaction.mapper';

export interface TransactionListResponseDto {
  transactions: TransactionDto[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(
    TransactionService.name,
  );

  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async listMyTransactions(
    userId: string,
    query: ListTransactionsQueryDto,
  ): Promise<TransactionListResponseDto> {
    const page = query.page ?? 1;

    const perPage = query.perPage ?? 20;

    const filter: ListTransactionsFilter = {
      userId,
      page,
      perPage,
      type: query.type,
      status: query.status,

      fromDate: query.fromDate
        ? new Date(query.fromDate)
        : undefined,

      toDate: query.toDate
        ? new Date(query.toDate)
        : undefined,
    };

    const result =
      await this.transactionRepository.findByUser(
        filter,
      );

    return {
      transactions: TransactionMapper.toDtoList(
        result.transactions,
      ),

      total: result.total,
      page,
      perPage,

      totalPages: Math.ceil(
        result.total / perPage,
      ),
    };
  }
}