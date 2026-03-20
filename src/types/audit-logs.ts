export interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entityId: number;
  userId: number;
  organizationId?: number;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}
