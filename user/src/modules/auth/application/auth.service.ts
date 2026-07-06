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
import { User } from '../domain/entities/user.entity';

import { RegisterDto } from '../presentation/dto/register.dto';
import { LoginDto } from '../presentation/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    
    const { email, password, confirmPassword, accountType, } = registerDto;

    if(password !== confirmPassword){
      throw new BadRequestException;
    }

    const existingUser = await this.userRepository.findByEmail(email);
   
    if (existingUser){
      throw new ConflictException('Email already exist');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      id: uuidv4(),
      email: email,
      passwordHash: passwordHash
    });

    const roleType = accountType === 'ADMIN' ? 'ADMIN' : 'USER';

    const savedUser = await this.userRepository.create(newUser, roleType);

    return {
      message: 'Registration Successfull',
      data: {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role?.name,
      }
    };
  }

  async login(loginDto: LoginDto): Promise<any> {
    
    const { email, password } = loginDto;
    const user = await this.userRepository.findLoginUserByEmail(email);

    if(!user){
      throw new ConflictException({
          success: false,
          message: 'Invalid Creadential',
        }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid){
      throw new UnauthorizedException({
          success: false,
          message: 'Invalid Creadential',
        }
      );
    }

    const token = await this.getTokens(user.id, user.email, user.role.name);
    
    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role?.name,
          isVerified: user.emailVerified,
        },
      },
    };
  }

  private async getTokens(userId: string, email: string, roleName: string): Promise<any> {

    const jwtPayload = { sub: userId, email, roleName };

    const[accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: '7d',
      }),

      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: '1d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
