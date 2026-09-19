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

import { AuthService } from '../../application/auth.service';

import { Public } from '@/common/decorators/public.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

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
  @ApiOperation({ summary: 'Registration' })
  @ApiResponse({ status: 201, description: 'Registration Successfull' })
    register(@Body() registerDto: RegisterDto ) {
      return this.authService.register(registerDto);
  }

  @Post('login')
  @Public()
  @ResponseMessage('Login Succesful')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 201, description: 'Login Successfull' })
  async login(
    @Body() loginDto: LoginDto, 
    @Res({ passthrough: true }) res: Response 
  ) {

    const response = await this.authService.login(loginDto);
    const refreshToken = response.data.refreshToken;

    res.cookie('refreshToken', response.data.refreshToken, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', 
      maxAge: 24 * 60 * 60 * 1000,
    });
    
    return {
      message: response.message,
      data: {
        accessToken: response.data.accessToken,
        refreshToken: refreshToken,
        user: response.data.user
      }
    };
  }
}