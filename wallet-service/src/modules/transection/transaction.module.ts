import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { TransactionController } from './presentation/controller/transaction.controller';

import { TransactionService } from './application/transaction.service';

import {
  TRANSACTION_REPOSITORY,
} from './domain/interfaces/transaction.repository.interface';

import {
  TransactionRepository,
} from './infrastructure/repositories/transaction.repository';

@Module({
  imports: [],

  controllers: [
    TransactionController,
  ],

  providers: [
    TransactionService,
    PrismaService,
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TransactionRepository,
    },
  ],

  exports: [
    TransactionService,
  ],
})
export class TransactionModule {}