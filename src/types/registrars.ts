export interface Registrar {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  config?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrarResponse {
  data: Registrar[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateRegistrarDto {
  name?: string;
  isActive?: boolean;
  config?: Record<string, any>;
}
