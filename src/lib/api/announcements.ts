import { instance } from "./instance";
import { Announcement, CreateAnnouncementDto, UpdateAnnouncementDto } from "@/types/announcements";

export const announcementsService = {
  findAll: async () => {
    const response = await instance.get<Announcement[]>("/announcements");
    return response.data;
  },
  findOne: async (id: number) => {
    const response = await instance.get<Announcement>(`/announcements/${id}`);
    return response.data;
  },
  create: async (data: CreateAnnouncementDto) => {
    const response = await instance.post<Announcement>("/announcements", data);
    return response.data;
  },
  update: async (id: number, data: UpdateAnnouncementDto) => {
    const response = await instance.patch<Announcement>(`/announcements/${id}`, data);
    return response.data;
  },
  remove: async (id: number) => {
    await instance.delete(`/announcements/${id}`);
  },
};
