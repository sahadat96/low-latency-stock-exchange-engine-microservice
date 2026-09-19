export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  CLOSED = 'CLOSED',
}

export enum Currency {
  USD = 'USD',
  BTC = 'BTC',
  ETH = 'ETH',
  USDT = 'USDT',
}

export class WalletDto {
  id!: string;
  userId!: string;
  currency!: Currency;
  availableBalance!: string;
  lockedBalance!: string;
  status!: WalletStatus;
  createdAt!: Date;
  updatedAt!: Date;
}

