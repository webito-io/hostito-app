export type CouponType = "PERCENTAGE" | "FIXED";

export interface Coupon {
  id: number;
  code: string;
  type: CouponType;
  value: number;
  currencyId?: number;
  maxUses?: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponResponse {
  data: Coupon[];
  total: number;
  page: number;
  limit: number;
}


export interface CreateCouponDto {
  code: string;
  type: CouponType;
  value: number;
  currencyId?: number;
  maxUses?: number;
  expiresAt?: string;
  isActive?: boolean;
}

export interface UpdateCouponDto {
  code?: string;
  type?: CouponType;
  value?: number;
  currencyId?: number;
  maxUses?: number;
  expiresAt?: string;
  isActive?: boolean;
}
