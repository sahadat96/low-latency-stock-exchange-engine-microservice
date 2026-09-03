import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import {
  DepositController,
} from './presentation/controller/deposit.controller';

import {
  DepositService,
} from './application/deposit.service';

import {
  DEPOSIT_REPOSITORY,
} from './domain/interfaces/deposit.repository.interface';

import {
  IDEMPOTENCY_REPOSITORY,
} from './domain/interfaces/idempotency.repository.interface';

import {
  DepositRepository,
} from './infrastructure/repositories/deposit.repository';

import {
  IdempotencyRepository,
} from './infrastructure/repositories/idempotency.repository';

@Module({
  imports: [],

  controllers: [
    DepositController,
  ],

  providers: [
    PrismaService,
    DepositService,
    {
      provide: DEPOSIT_REPOSITORY,
      useClass: DepositRepository,
    },
    {
      provide: IDEMPOTENCY_REPOSITORY,
      useClass: IdempotencyRepository,
    },
  ],

  exports: [
    DepositService,
  ],
})
export class DepositModule {}