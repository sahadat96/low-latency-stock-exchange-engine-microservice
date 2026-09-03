import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
} from 'class-validator';

import {
  Currency,
} from '@prisma/client';

export class CreateDepositDto {
  @IsNumberString(
    {},
    {
      message: 'Amount must be a valid decimal number.',
    },
  )
  @IsNotEmpty()
  amount!: string;

  @IsEnum(Currency)
  currency!: Currency;
}