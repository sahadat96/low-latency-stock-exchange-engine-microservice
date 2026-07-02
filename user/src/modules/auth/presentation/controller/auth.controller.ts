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

import { Public } from '.../../src/common/decorators/public.decorator';
import { ResponseMessage } from '.../../src/common/decorators/response-message.decorator';

@Controller('auth')
export class AuthController {
    
  constructor(
  ) {}

  @Post('register')
  @Public()
  @ResponseMessage('Registration Successfull.')
    register(@Body() registerDto: RegisterDto ) {
      return this.authService.register(registerDto);
  }
} 