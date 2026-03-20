export interface Announcement {
  id: number;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  isActive?: boolean;
}

export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
  isActive?: boolean;
}
