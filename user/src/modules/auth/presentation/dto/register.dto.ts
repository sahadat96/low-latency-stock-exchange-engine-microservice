import { 
    IsEmail, 
    IsNotEmpty, 
    IsString, 
    MinLength, 
    IsEnum,
    IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { RoleType } from '@/common/enums/role-type.enum';

export class RegisterDto {

  @IsString()
  @ApiProperty({ example: 'sahadat' })
  name!: string;

  @IsEmail({}, { message: 'Please Valid Email' })
  @ApiProperty({ example: 'sahadat@gmail.com' })
  email!: string;

  @IsString()
  @ApiProperty({ example: '+880 1800-000000' })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @ApiProperty({ example: '123456' })
  password!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '123456' })
  confirmPassword!: string;

  @IsEnum(RoleType, { message: `accountType must be one of: ${Object.values(RoleType).join(', ')}`, })
  @ApiProperty({ example: 'RETAIL, INSTITUTIONAL' })
  accountType!: RoleType;
}
