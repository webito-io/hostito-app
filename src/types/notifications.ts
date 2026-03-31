export interface NotificationProvider {
  id: number;
  name: string;
  isActive: boolean;
  config?: Record<string, any>;
  updatedAt: string;
}

export interface NotificationLog {
  id: number;
  type: string;
  to: string;
  subject?: string;
  status: string;
  error?: string;
  providerId: number;
  createdAt: string;
}

export interface NotificationLogsResponse {
  data: NotificationLog[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateNotificationProviderDto {
  config: Record<string, any>;
}
