import { NotFoundException } from '@nestjs/common';

export class WalletNotFoundException extends NotFoundException {
  constructor(userId: string) {
    super({
      code: 'WALLET_NOT_FOUND',
      message: `No wallet found for user ${userId}`,
    });
  }
}