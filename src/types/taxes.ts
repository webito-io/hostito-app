export interface Tax {
  id: number;
  name: string;
  rate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaxResponse {
  data: Tax[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTaxDto {
  name: string;
  rate: number;
  isActive?: boolean;
}

export interface UpdateTaxDto {
  name?: string;
  rate?: number;
  isActive?: boolean;
}
