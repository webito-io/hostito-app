export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  organization?: {
    id: number;
    name: string;
  };
  organizationId: number;
  status: string;
  role?: {
    id: number;
    name: string;
  };
  roleId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone: string;
  organizationName: string;
  organizationId: number;
  status: string;
  roleId: number;
}

export interface UpdateUserDto extends Partial<CreateUserDto> { }

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}
