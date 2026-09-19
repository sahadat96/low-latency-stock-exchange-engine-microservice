enum UserStatus {
  PENDING,
  ACTIVE,
  SUSPENDED,
  BANNED,
}

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  phone?: string;
  status?: UserStatus
  roleId?: string;
  role?: any;

  emailVerified?: boolean;
  phoneVerified?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class User {
  public id: string;
  public email: string;
  public passwordHash: string;
  public phone!: string;
  public status!: UserStatus;
  public roleId?: string;
  public role?: any;

  public emailVerified: boolean;
  public phoneVerified: boolean;

  public createdAt?: Date;
  public updatedAt?: Date;
  public deletedAt?: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.roleId = props.roleId;
    this.role = props.role;

    this.emailVerified = props.emailVerified ?? false;
    this.phoneVerified = props.phoneVerified ?? false;

    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}