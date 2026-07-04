enum UserStatus {
  PENDING,
  ACTIVE,
  SUSPENDED,
  BANNED,
}

export interface UserProps {
  id: string;
  email: string;
  password?: string | null;
  phone: string;
  status: UserStatus
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
  public passwordHash?: string | null ;
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
    this.passwordHash = props.password;
    this.phone = props.phone;
    this.roleId = props.roleId;
    this.role = props.role;

    this.emailVerified = props.emailVerified ?? false;
    this.phoneVerified = props.phoneVerified ?? false;

    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}