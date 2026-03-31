import { instance } from "./instance";
import { Setting, UpdateSettingDto } from "@/types/system-settings";

export const settingsService = {
  findAll: async () => {
    const response = await instance.get<Setting[]>("/settings");
    return response.data;
  },
  update: async (key: string, data: UpdateSettingDto) => {
    const response = await instance.patch<Setting>(`/settings/${key}`, data);
    return response.data;
  },
};
