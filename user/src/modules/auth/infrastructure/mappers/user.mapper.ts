import { User } from '../../domain/entities/user.entity';

export class UserMapper {
    
  static toDomain(raw: any): User {

    return new User({
      id: raw.id,
      email: raw.email,
      passwordHash: raw.passwordHash,
      roleId: raw.roleId,
      role: raw.role,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}