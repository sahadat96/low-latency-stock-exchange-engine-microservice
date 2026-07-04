import { 
    IsEmail, 
    IsNotEmpty, 
    IsString, 
    MinLength, 
    IsEnum,
    IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AccountType {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

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

  @IsEnum(AccountType, { message: 'accountType must be USER ' })
  @ApiProperty({ example: 'USER' })
  accountType!: AccountType;
}
