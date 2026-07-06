import { 
    IsEmail, 
    IsNotEmpty, 
    IsString 
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    
    @IsEmail({}, {message: 'Please provide a valid email address'})
    @ApiProperty({ example: 'sahadat@gmail.com' })
    email!: string;

    @IsString()
    @IsNotEmpty({ message: 'Passowrd is required' })
    @ApiProperty({ example: '123456' })
    password!: string;
}