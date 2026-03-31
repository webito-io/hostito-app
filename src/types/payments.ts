export interface Payment {
  id: number;
  amount: number;
  transactionId?: string;
  status: string;
  orderId: number;
  organizationId: number;
  gateway?: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentsResponse {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
}
