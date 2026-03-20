export interface Permission {
  id: number;
  resource: string;
  action: string;
  scope: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  permissions: number[];
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> { }

export interface RolesResponse {
  data: Role[];
  total: number;
  page: number;
  limit: number;
}
