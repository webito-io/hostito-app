export interface Setting {
  id: number;
  key: string;
  value: unknown;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingDto {
  value: string | number | object;
  isPublic?: boolean;
}
