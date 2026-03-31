export interface Provisioner {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  config?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ProvisionerResponse {
  data: Provisioner[];
  total: number;
  page: number;
  limit: number;
}

export interface ConfigureProvisionerDto {
  config: Record<string, any>;
}
