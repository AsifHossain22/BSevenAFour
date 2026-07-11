import { UserRole } from '../../../generated/prisma/enums';

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginUserPayload {
  email: string;
  password: string;
}
