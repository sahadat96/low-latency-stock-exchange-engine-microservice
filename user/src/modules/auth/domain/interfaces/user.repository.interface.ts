import { User } from '../entities/user.entity';

export interface LoginUserView {
  id: string;
  email: string;
  password: string | null;
  email_verified: boolean;

  role: {
    id: string;
    name: string;
  };
}

export interface IUserRepository {

  findByEmail(email: string): Promise<User | null>;

  findById(id: string): Promise<User | null>

  create(user: User, roleType: 'USER' | 'ADMIN'): Promise<User>;
  
  findLoginUserByEmail(email: string): Promise<LoginUserView | null>;
}