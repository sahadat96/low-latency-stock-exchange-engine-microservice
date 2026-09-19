import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  WITHDRAW_REPOSITORY,
} from '../domain/interfaces/withdraw.repository.interface';

import type {
  IWithdrawRepository,
} from '../domain/interfaces/withdraw.repository.interface';

import {
  WithdrawMapper,
} from '../infrastructure/mapper/withdraw.mapper';

import type {
  CreateWithdrawDto,
} from '../presentation/dto/create-withdraw.dto';

import type { WithdrawResponseDto } from '../presentation/dto/withdraw-response.dto';

@Injectable()
export class WithdrawService {
  private readonly logger = new Logger(
    WithdrawService.name,
  );

  constructor(
    @Inject(WITHDRAW_REPOSITORY)
    private readonly withdrawRepository: IWithdrawRepository,
  ) {}

  async createWithdrawal(
    userId: string,
    dto: CreateWithdrawDto,
  ): Promise<WithdrawResponseDto> {
    this.validateAmount(dto.amount);

    this.validateIdempotencyKey(
      dto.idempotencyKey,
    );

    const result =
      await this.withdrawRepository.executeWithdrawal(
        userId,
        dto.amount,
        dto.currency,
        dto.idempotencyKey,
        dto.idempotencyKey,
        'Wallet withdrawal',
      );

    return WithdrawMapper.toResponseDto(result);
  }

  private validateAmount(
    amount: string,
  ): void {
    const normalized = amount.trim();

    if (
      !/^\d{1,22}(?:\.\d{1,8})?$/.test(
        normalized,
      )
    ) {
      throw new BadRequestException(
        'Invalid withdrawal amount.',
      );
    }

    if (
      /^0+(?:\.0+)?$/.test(
        normalized,
      )
    ) {
      throw new BadRequestException(
        'Withdrawal amount must be greater than zero.',
      );
    }
  }

  private validateIdempotencyKey(
    key: string,
  ): void {
    if (!key.trim()) {
      throw new BadRequestException(
        'Idempotency key is required.',
      );
    }

    if (key.length > 255) {
      throw new BadRequestException(
        'Idempotency key must not exceed 255 characters.',
      );
    }
  }
}