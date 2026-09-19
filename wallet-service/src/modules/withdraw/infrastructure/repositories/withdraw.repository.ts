import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  Currency,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';

import type {
  IWithdrawRepository,
} from '../../domain/interfaces/withdraw.repository.interface';

import type {
  WithdrawResult,
} from '../../domain/types/withdraw.types';

@Injectable()
export class WithdrawRepository
  implements IWithdrawRepository
{
  private readonly logger = new Logger(
    WithdrawRepository.name,
  );

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async executeWithdrawal(
    userId: string,
    amount: string,
    currency: Currency,
    idempotencyKey: string,
    referenceId?: string,
    description?: string,
  ): Promise<WithdrawResult> {
    return this.prisma.$transaction(
      async (tx) => {
        const existing =
          await tx.idempotencyKey.findUnique({
            where: {
              userId_key_operation: {
                userId,
                key: idempotencyKey,
                operation: 'WITHDRAW',
              },
            },
          });

        if (existing) {
          if (
            existing.responseBody &&
            typeof existing.responseBody ===
              'object' &&
            existing.responseBody !== null &&
            'transactionId' in existing.responseBody
          ) {
            const transactionId =
              String(
                (
                  existing.responseBody as {
                    transactionId: string;
                  }
                ).transactionId,
              );

            const transaction =
              await tx.walletTransaction.findUnique({
                where: {
                  id: transactionId,
                },
              });

            if (!transaction) {
              throw new ConflictException(
                'Idempotency record exists but withdrawal transaction was not found.',
              );
            }

            return {
              transaction,
              status: transaction.status,
              idempotent: true,
            };
          }

          throw new ConflictException(
            'Withdrawal with this idempotency key is already being processed.',
          );
        }

        await tx.idempotencyKey.create({
          data: {
            userId,
            key: idempotencyKey,
            operation: 'WITHDRAW',
            createdAt: new Date(),
            expiresAt: this.getIdempotencyExpiration(),
          },
        });

        const wallets = await tx.$queryRaw<
          Array<{
            id: string;
            userId: string;
            currency: Currency;
            availableBalance: string;
            lockedBalance: string;
          }>
        >`
          SELECT
            id,
            user_id AS "userId",
            currency,
            available_balance::text AS "availableBalance",
            locked_balance::text AS "lockedBalance"
          FROM wallets
          WHERE user_id = ${userId}::uuid
            AND currency = CAST(${currency} AS "Currency")
            AND status = CAST('ACTIVE' AS "WalletStatus")
          FOR UPDATE
        `;

        const wallet = wallets[0];

        if (!wallet) {
          throw new BadRequestException(
            'Active wallet not found.',
          );
        }

        const balanceCheck =
          await tx.$queryRaw<
            Array<{
              hasSufficientBalance: boolean;
            }>
          >`
            SELECT
              CAST(${amount} AS NUMERIC)
                <= available_balance
                AS "hasSufficientBalance"
            FROM wallets
            WHERE id = ${wallet.id}::uuid
          `;

        const hasSufficientBalance =
          balanceCheck[0]?.hasSufficientBalance ??
          false;

        if (!hasSufficientBalance) {
          throw new BadRequestException(
            'Insufficient available balance.',
          );
        }

        const updatedWallet =
          await tx.wallet.update({
            where: {
              id: wallet.id,
            },

            data: {
              availableBalance: {
                decrement: amount,
              },

              lockedBalance: {
                increment: amount,
              },
            },
          });

        const transaction =
          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: TransactionType.WITHDRAWAL,
              status: TransactionStatus.PENDING,
              amount,
              currency,
              balanceBefore: wallet.availableBalance,
              balanceAfter: updatedWallet.availableBalance,
              referenceId: referenceId ?? idempotencyKey,
              description: description ?? 'Wallet withdrawal',
            },
          });

        await tx.idempotencyKey.update({
          where: {
            userId_key_operation: {
              userId,
              key: idempotencyKey,
              operation: 'WITHDRAW',
            },
          },

          data: {
            responseStatus: 200,

            responseBody: {
              transactionId: transaction.id,
            },
          },
        });

        return {
          transaction,
          status: TransactionStatus.PENDING,
          idempotent: false,
        };
      },
      {
        isolationLevel: 'Serializable',
      },
    );
  }

  private getIdempotencyExpiration(): Date {
    const expiresAt = new Date();

    expiresAt.setHours(
      expiresAt.getHours() + 24,
    );

    return expiresAt;
  }
}