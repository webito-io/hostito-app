import { Currency } from "./currencies";

export type ProductType = "SERVICE" | "DOMAIN";

export type VariantAction = "RECURRING" | "REGISTER" | "RENEW" | "TRANSFER" | "SETUP";

export type ProductCycle = "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | "ANNUAL" | "BIENNIAL" | "TRIENNIAL" | "ONETIME";

export interface ProductVariant {
  id: number;
  action: VariantAction;
  cycle: ProductCycle;
  price: number;
}

export interface CreateVariantDto {
  action: VariantAction;
  cycle: ProductCycle;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  currencyId: number;
  categoryId?: number;
  type: ProductType;
  isActive: boolean;
  currency?: Currency;
  serverId?: number;
  tld?: string;
  config?: Record<string, any>;
  variants: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  currencyId: number;
  categoryId?: number;
  type: ProductType;
  isActive?: boolean;
  serverId?: number;
  tld?: string;
  config?: Record<string, any>;
  variants: CreateVariantDto[];
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  currencyId?: number;
  categoryId?: number;
  type?: ProductType;
  isActive?: boolean;
  serverId?: number;
  tld?: string;
  config?: Record<string, any>;
  variants?: CreateVariantDto[];
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}
