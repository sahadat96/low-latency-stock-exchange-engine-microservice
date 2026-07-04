import { 
  Controller, 
  Get, 
  Post,
  Body, 
  Req, 
  Res,
  UnauthorizedException, 
  UseGuards 
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService } from '../application/auth.service';

import { Public } from '.../../src/common/decorators/public.decorator';
import { ResponseMessage } from '.../../src/common/decorators/response-message.decorator';
import { RegisterDto } from '../dto/register.dto';
import { 
    ApiTags,
    ApiOperation,
    ApiResponse 
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @Public()
  @ResponseMessage('Registration Successfull.')
    register(@Body() registerDto: RegisterDto ) {
      return this.authService.register(registerDto);
  }
}
