import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import type {
  ITransactionRepository,
} from '../../domain/interfaces/transaction.repository.interface';

import type {
  ListTransactionsFilter,
  TransactionListResult,
} from '../../domain/types/transaction.types';

@Injectable()
export class TransactionRepository
  implements ITransactionRepository
{
  private readonly logger = new Logger(
    TransactionRepository.name,
  );

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findByUser(
    filter: ListTransactionsFilter,
  ): Promise<TransactionListResult> {
    const {
      userId,
      page,
      perPage,
      type,
      status,
      fromDate,
      toDate,
    } = filter;

    const where = {
      wallet: {
        userId,
      },

      ...(type && {
        type,
      }),

      ...(status && {
        status,
      }),

      ...(fromDate || toDate
        ? {
            createdAt: {
              ...(fromDate && {
                gte: fromDate,
              }),

              ...(toDate && {
                lte: toDate,
              }),
            },
          }
        : {}),
    };

    const skip = (page - 1) * perPage;

    const [transactions, total] =
      await this.prisma.$transaction([
        this.prisma.walletTransaction.findMany({
          where,

          orderBy: [
            {
              createdAt: 'desc',
            },
            {
              id: 'desc',
            },
          ],

          skip,

          take: perPage,
        }),

        this.prisma.walletTransaction.count({
          where,
        }),
      ]);

    return {
      transactions,
      total,
    };
  }
}