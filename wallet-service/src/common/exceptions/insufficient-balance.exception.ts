import { ConflictException } from '@nestjs/common';

export class InsufficientBalanceException extends ConflictException {
  constructor(walletId: string) {
    super({
      code: 'INSUFFICIENT_BALANCE',
      message: `Wallet ${walletId} does not have sufficient balance for this withdrawal`,
    });
  }
}