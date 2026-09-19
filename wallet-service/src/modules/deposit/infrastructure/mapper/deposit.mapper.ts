import type {
  DepositResponseDto,
} from '../../presentation/dto/deposit.response.dto';

import type {
  DepositResult,
} from '../../domain/types/deposit.types';

export class DepositMapper {
  static toResponseDto(
    result: DepositResult,
  ): DepositResponseDto {
    const transaction = result.transaction;

    return {
      id: transaction.id,
      walletId: transaction.walletId,
      type: transaction.type,
      status: transaction.status,
      amount: transaction.amount.toString(),
      currency: transaction.currency,
      balanceBefore: transaction.balanceBefore.toString(),
      balanceAfter: transaction.balanceAfter.toString(),
      referenceId: transaction.referenceId,
      description: transaction.description,
      createdAt: transaction.createdAt,
      completedAt: transaction.completedAt,
    };
  }
}