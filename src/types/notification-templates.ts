export interface NotificationTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplatesResponse {
  data: NotificationTemplate[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateNotificationTemplateDto {
  name: string;
  subject: string;
  body: string;
  isActive?: boolean;
}

export interface UpdateNotificationTemplateDto {
  name?: string;
  subject?: string;
  body?: string;
  isActive?: boolean;
}
