import type { WithdrawResponseDto } from '../../presentation/dto/withdraw-response.dto';

import type { WithdrawResult } from '../../domain/types/withdraw.types';

export class WithdrawMapper {
  static toResponseDto(
    result: WithdrawResult,
  ): WithdrawResponseDto {
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