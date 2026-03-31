import { instance } from "./instance";
import {
  NotificationProvider,
  NotificationLog,
  NotificationLogsResponse,
  UpdateNotificationProviderDto,
} from "@/types/notifications";

export const notificationsService = {
  findAllProviders: async () => {
    const response = await instance.get<NotificationProvider[]>("/notifications/providers");
    return response.data;
  },
  activateProvider: async (id: number) => {
    const response = await instance.patch<NotificationProvider>(`/notifications/providers/${id}/activate`);
    return response.data;
  },
  deactivateProvider: async (id: number) => {
    const response = await instance.patch<NotificationProvider>(`/notifications/providers/${id}/deactivate`);
    return response.data;
  },
  setProviderConfig: async (id: number, data: UpdateNotificationProviderDto) => {
    const response = await instance.patch<NotificationProvider>(`/notifications/providers/${id}/config`, data);
    return response.data;
  },
  findAllLogs: async (params?: { page?: number; limit?: number; type?: string; status?: string; providerId?: number }) => {
    const response = await instance.get<NotificationLogsResponse>("/notifications/logs", { params });
    return response.data;
  },
};
