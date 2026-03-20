import { instance } from "./instance";
import { AuditLog } from "@/types/audit-logs";

export const auditLogsService = {
  findAll: async (params?: { action?: string; entity?: string; userId?: number; organizationId?: number }) => {
    const response = await instance.get<AuditLog[]>("/audit-logs", { params });
    return response.data;
  },
};
