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

@Controller('auth')
export class AuthController {
    
  constructor(
  ) {}
}