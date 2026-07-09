import { User } from '../../domain/entities/user.entity';

// User Mapper
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