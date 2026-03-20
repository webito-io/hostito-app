import { Organization } from "./organizations";
import { Currency } from "./currencies";

export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: number;
  total: number;
  tax: number;
  subtotal: number;
  discount: number;
  shipping: number;
  status: string;
  currencyId: number;
  gatewayId?: number;
  items: InvoiceItem[];
  organizationId: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  cycle?: string;
  organization?: Organization;
  currency?: Currency;
}

export interface CreateInvoiceDto {
  total: number;
  tax: number;
  subtotal: number;
  discount: number;
  shipping: number;
  status: string;
  currencyId: number;
  gatewayId?: number;
  items: InvoiceItem[];
  organizationId: number;
  dueDate: string;
  cycle?: string;
}

export interface UpdateInvoiceDto extends Partial<CreateInvoiceDto> { }

export interface InvoicesResponse {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
}
