export type ServiceStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "CANCELLED";

export interface Service {
  id: number;
  status: ServiceStatus;
  username?: string;
  password?: string;
  domainId?: number;
  productId: number;
  orderId: number;
  organizationId: number;
  serverId?: number;
  nextDueDate?: string | Date;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDto {
  status?: ServiceStatus;
  username?: string;
  password?: string;
  domainId?: number;
  productId: number;
  orderId: number;
  organizationId: number;
  serverId?: number;
  nextDueDate?: string | Date;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> { }
