import { Module } from '@nestjs/common';

import {
  WithdrawController,
} from './presentation/controller/withdraw.controller';

import {
  WithdrawService,
} from './application/withdraw.service';

import {
  WITHDRAW_REPOSITORY,
} from './domain/interfaces/withdraw.repository.interface';

import {
  WithdrawRepository,
} from './infrastructure/repositories/withdraw.repository';

@Module({
  imports: [],

  controllers: [
    WithdrawController,
  ],

  providers: [
    WithdrawService,
    {
      provide: WITHDRAW_REPOSITORY,
      useClass: WithdrawRepository,
    },
  ],

  exports: [
    WithdrawService,
  ],
})
export class WithdrawModule {}