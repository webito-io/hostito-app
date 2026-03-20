export interface Domain {
  id: number;
  name: string;
  status: string;
  registrar?: string;
  expiryDate?: string;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDomainDto {
  name: string;
  status: string;
  registrar?: string;
  expiryDate?: string;
  organizationId: number;
}

export interface UpdateDomainDto {
  name?: string;
  status?: string;
  registrar?: string;
  expiryDate?: string;
}
