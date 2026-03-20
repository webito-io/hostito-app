import { Currency } from "./currencies";

export type ProductType = 'HOSTING' | 'VPS' | 'DOMAIN' | 'LICENSE' | 'OTHER';

export type ProductCycle = 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL' | 'BIENNIAL' | 'TRIENNIAL' | 'ONETIME';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  currencyId: number;
  type: ProductType;
  cycle: ProductCycle;
  isActive: boolean;
  currency: Currency;
  module?: string;
  config?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  currencyId: number;
  type: ProductType;
  cycle: ProductCycle;
  isActive?: boolean;
  module?: string;
  config?: Record<string, any>;
}

export interface UpdateProductDto extends Partial<CreateProductDto> { }

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}
