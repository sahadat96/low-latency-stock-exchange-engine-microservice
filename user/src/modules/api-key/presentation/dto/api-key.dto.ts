import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIP,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9 _-]+$/, {
    message: 'name can only contain letters, numbers, spaces, hyphens, underscores',
  })
  name!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: 'maximum 10 IPs allowed in whitelist' })
  @IsIP('4', { each: true, message: 'each entry must be a valid IPv4 address' })
  @Transform(({ value }) =>
    Array.isArray(value) ? [...new Set<string>(value)] : value,
  ) // deduplicate
  ipWhitelist?: string[] = [];

  @IsOptional()
  @IsDateString({}, { message: 'expiresAt must be a valid ISO 8601 date string' })
  expiresAt?: string;
}