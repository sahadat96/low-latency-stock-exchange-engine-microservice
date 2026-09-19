import {
  BadRequestException,
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
  IDepositRepository,
} from '../../domain/interfaces/deposit.repository.interface';

import type {
  DepositResult,
} from '../../domain/types/deposit.types';

@Injectable()
export class DepositRepository
  implements IDepositRepository
{
  private readonly logger = new Logger(
    DepositRepository.name,
  );

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async executeDeposit(
    userId: string,
    amount: string,
    currency: Currency,
    idempotencyKey: string,
    description?: string,
    referenceId?: string,
  ): Promise<DepositResult> {
    return this.prisma.$transaction(
      async (tx) => {

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
            AND currency = ${currency}::"Currency"
            AND status = 'ACTIVE'
          FOR UPDATE
        `;

        const wallet = wallets[0];

        if (!wallet) {
          throw new BadRequestException(
            'Active wallet not found.',
          );
        }

        const balanceBefore =
          wallet.availableBalance;

        const updatedWallet =
          await tx.wallet.update({
            where: {
              id: wallet.id,
            },

            data: {
              availableBalance: {
                increment: amount,
              },
            },
          });

        const transaction =
          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: TransactionType.DEPOSIT,
              status: TransactionStatus.COMPLETED,
              amount,
              currency,
              balanceBefore,
              balanceAfter: updatedWallet.availableBalance,
              referenceId: referenceId ?? idempotencyKey,
              description: description ?? 'Wallet deposit',
              completedAt: new Date(),
            },
          });

        return {
          transaction,
          status: TransactionStatus.COMPLETED,
        };
      },
    );
  }
}