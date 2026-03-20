import { Currency } from "./currencies";
import { User } from "./users";

export interface Organization {
  id: number;
  name: string;
  currencyId: number;
  users: User[];
  createdAt?: string;
  updatedAt?: string;
  currency?: Currency;
}

export interface CreateOrganizationDto {
  name: string;
  currencyId: number;
  users: number[];
}

export interface UpdateOrganizationDto extends Partial<CreateOrganizationDto> { }

export interface OrganizationsResponse {
  data: Organization[];
  total: number;
  page: number;
  limit: number;
}
