import { instance } from "./instance";
import { Invoice, CreateInvoiceDto, UpdateInvoiceDto, InvoicesResponse } from "@/types/invoices";

export const invoicesService = {
  findAll: async (page: number, limit: number) => {
    const response = await instance.get<InvoicesResponse>("/invoices", {
      params: { page, limit },
    });
    return response.data;
  },
  findOne: async (id: number) => {
    const response = await instance.get<Invoice>(`/invoices/${id}`);
    return response.data;
  },
  create: async (data: CreateInvoiceDto) => {
    const response = await instance.post<Invoice>("/invoices", data);
    return response.data;
  },
  update: async (id: number, data: UpdateInvoiceDto) => {
    const response = await instance.patch<Invoice>(`/invoices/${id}`, data);
    return response.data;
  },
  remove: async (id: number) => {
    await instance.delete(`/invoices/${id}`);
  },
  pay: async (id: number, gatewayId: number) => {
    await instance.post(`/invoices/${id}/pay`, { gatewayId });
  },
};
