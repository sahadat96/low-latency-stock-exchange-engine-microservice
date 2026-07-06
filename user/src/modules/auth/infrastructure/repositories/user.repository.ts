import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

import { User } from '../../domain/entities/user.entity';

import { 
  IUserRepository,
  LoginUserView,
} from '../../domain/interfaces/user.repository.interface';

import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserRepository implements IUserRepository {

  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role:true }
    });

    if (!user) return null;

    return UserMapper.toDomain(user);
  }

  async create(user: User, roleType: 'USER' | 'ADMIN'): Promise<User> {

    const created = await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        role: {
          connect: { name: roleType }
        } 
      },
      include: { role: true }
    });

   return UserMapper.toDomain(created);
  }

  async findById(id: string): Promise<User | null> {

    const user = await this.prisma.user.findUnique({
       where: { id },
       include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              }
            }
          }
        }
       }

       });

    if(!user) return null;

    return UserMapper.toDomain(user);
  }

  async findLoginUserByEmail(email: string): Promise<LoginUserView | null> {

    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        emailVerified: true,

        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}