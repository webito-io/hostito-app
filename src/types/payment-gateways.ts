export interface PaymentGateway {
  id: number;
  name: string;
  isActive: boolean;
  config: Record<string, any>;
  updatedAt: string;
}

export interface UpdatePaymentGatewayDto {
  config: Record<string, any>;
}
