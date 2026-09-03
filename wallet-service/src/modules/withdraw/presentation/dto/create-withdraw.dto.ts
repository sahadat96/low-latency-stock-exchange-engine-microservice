import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsString,
  MaxLength,
} from 'class-validator';

import { Currency } from '@prisma/client';

export class CreateWithdrawDto {
  @IsNumberString(
    {},
    {
      message: 'Amount must be a valid decimal number.',
    },
  )
  @IsNotEmpty()
  amount!: string;

  @IsEnum(Currency, {
    message: 'Invalid currency.',
  })
  currency!: Currency;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  idempotencyKey!: string;
}