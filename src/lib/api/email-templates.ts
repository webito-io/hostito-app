import { instance } from "./instance";
import { NotificationTemplate, NotificationTemplatesResponse, CreateNotificationTemplateDto, UpdateNotificationTemplateDto } from "@/types/notification-templates";

export const emailTemplatesService = {
  findAll: async () => {
    const response = await instance.get<NotificationTemplatesResponse>("/notification-templates");
    return response.data;
  },
  findOne: async (id: number) => {
    const response = await instance.get<NotificationTemplate>(`/notification-templates/${id}`);
    return response.data;
  },
  create: async (data: CreateNotificationTemplateDto) => {
    const response = await instance.post<NotificationTemplate>("/notification-templates", data);
    return response.data;
  },
  update: async (id: number, data: UpdateNotificationTemplateDto) => {
    const response = await instance.patch<NotificationTemplate>(`/notification-templates/${id}`, data);
    return response.data;
  },
  remove: async (id: number) => {
    await instance.delete(`/notification-templates/${id}`);
  },
};
