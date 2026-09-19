import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsUUID,
  IsString,
  MaxLength,
  IsIP,
  IsDateString,
} from 'class-validator';

export class ListSessionsQueryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;

    return value;
  })
  active?: boolean;
}

export class SessionIdParamDto {
  @IsUUID('4')
  id!: string;
}

export class CreateSessionDto {

  @IsUUID('4')
  userId!: string;

  @IsString()
  @MaxLength(255)
  accessTokenJti!: string;

  @IsString()
  refreshToken!: string;

  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  userAgent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceFingerprint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  country?: string;

  @IsDateString()
  expiresAt!: string;
}