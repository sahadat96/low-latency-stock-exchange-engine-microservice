import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { 
  Injectable,
  Inject, 
  ConflictException,
  UnauthorizedException, 
  BadRequestException, 
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import type { IUserRepository } from '../domain/interfaces/user.repository.interface';

import { RegisterDto } from '../presentation/dto/registerDto/register.dto';
@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly authOtpQueueService: AuthOtpQueueService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    
    const { email, password, confirmPassword, accountType, name  } = registerDto;

    if(password !== confirmPassword){
      throw new BadRequestException;
    }

    const existingUser = await this.userRepository.findByEmail(email);
   
    if (existingUser){
      throw new ConflictException('Email already exist');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      id: uuidv4(),
      email: email,
      password: hashedPassword,
      name: name,
    });

    const roleType = accountType === 'VENDOR' ? 'VENDOR' : 'USER';

    const savedUser = await this.userRepository.create(newUser, roleType);

    await this.authOtpQueueService.addEmailVerificationOtpJob({
      userId: savedUser.id,
      email: savedUser.email,
    });

    return {
      message: 'Registration Successfull',
      data: {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role?.name,
        isVerified: savedUser.isEmailVerified,
      }
    };
  }
}

