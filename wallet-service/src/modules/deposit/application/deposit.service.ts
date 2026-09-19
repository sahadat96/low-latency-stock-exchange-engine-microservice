import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  DEPOSIT_REPOSITORY,
} from '../domain/interfaces/deposit.repository.interface';

import type {
  IDepositRepository,
} from '../domain/interfaces/deposit.repository.interface';

import {
  IDEMPOTENCY_REPOSITORY,
} from '../domain/interfaces/idempotency.repository.interface';

import type {
  IIdempotencyRepository,
} from '../domain/interfaces/idempotency.repository.interface';

import {
  DEPOSIT_OPERATION,
} from '../domain/types/deposit.types';

import {
  DepositMapper,
} from '../infrastructure/mapper/deposit.mapper';

import type {
  CreateDepositDto,
} from '../presentation/dto/create-deposit.dto';

import type {
  DepositResponseDto,
} from '../presentation/dto/deposit.response.dto';

@Injectable()
export class DepositService {
  private readonly logger = new Logger(
    DepositService.name,
  );

  constructor(
    @Inject(DEPOSIT_REPOSITORY)
    private readonly depositRepository: IDepositRepository,

    @Inject(IDEMPOTENCY_REPOSITORY)
    private readonly idempotencyRepository: IIdempotencyRepository,
  ) {}

  async createDeposit(
    userId: string,
    idempotencyKey: string,
    dto: CreateDepositDto,
  ): Promise<DepositResponseDto> {

    this.validateAmount(dto.amount);

    this.validateIdempotencyKey(
      idempotencyKey,
    );

    const existing =
      await this.idempotencyRepository.find(
        userId,
        idempotencyKey,
        DEPOSIT_OPERATION,
      );

    if (existing) {

      if (existing.responseBody) {
        return existing.responseBody as DepositResponseDto;
      }

      throw new ConflictException(
        'A deposit with this idempotency key is already being processed.',
      );
    }

    const result =
      await this.depositRepository.executeDeposit(
        userId,
        dto.amount,
        dto.currency,
        idempotencyKey,
        'Wallet deposit',
        idempotencyKey,
      );

    return DepositMapper.toResponseDto(
      result,
    );
  }

  private validateAmount(
    amount: string,
  ): void {
    const normalized = amount.trim();

    if (!normalized) {
      throw new BadRequestException(
        'Amount is required.',
      );
    }

    if (!/^\d{1,22}(\.\d{1,8})?$/.test(normalized)) {
      throw new BadRequestException(
        'Invalid amount format.',
      );
    }

    if (Number(normalized) <= 0) {
      throw new BadRequestException(
        'Deposit amount must be greater than zero.',
      );
    }
  }

  private validateIdempotencyKey(
    key: string,
  ): void {
    if (!key || key.trim().length === 0) {
      throw new BadRequestException(
        'Idempotency-Key header is required.',
      );
    }

    if (key.length > 255) {
      throw new BadRequestException(
        'Idempotency-Key must not exceed 255 characters.',
      );
    }
  }
}