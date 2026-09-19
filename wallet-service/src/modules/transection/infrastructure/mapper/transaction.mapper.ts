import type { TransactionDto } from '../../presentation/dto/transaction.dto';
import type { TransactionEntity } from '../../domain/types/transaction.types';

export class TransactionMapper {
  static toDto(
    transaction: TransactionEntity,
  ): TransactionDto {
    return {
      id: transaction.id,
      walletId: transaction.walletId,
      type: transaction.type,
      status: transaction.status,
      amount: transaction.amount.toString(),
      currency: transaction.currency,

      balanceBefore:
        transaction.balanceBefore.toString(),

      balanceAfter:
        transaction.balanceAfter.toString(),

      referenceId: transaction.referenceId,
      description: transaction.description,
      createdAt: transaction.createdAt,
      completedAt: transaction.completedAt,
    };
  }

  static toDtoList(
    transactions: TransactionEntity[],
  ): TransactionDto[] {
    return transactions.map((transaction) =>
      this.toDto(transaction),
    );
  }
}