import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsUUID,
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