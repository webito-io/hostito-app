export interface Server {
  id: number;
  name: string;
  hostname: string;
  ip?: string;
  port: number;
  credentials?: Record<string, any>;
  isActive: boolean;
  maxAccounts?: number;
  provisionerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServerResponse {
  data: Server[];
  page: number;
  count: number;
  total: number;
}

export interface CreateServerDto {
  name: string;
  hostname: string;
  ip?: string;
  port?: number;
  credentials?: Record<string, any>;
  isActive?: boolean;
  maxAccounts?: number;
  provisionerId: number;
}

export interface UpdateServerDto extends Partial<CreateServerDto> { }
