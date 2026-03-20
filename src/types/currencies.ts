export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  rate: number;
  isDefault?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCurrencyDto {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateCurrencyDto extends Partial<CreateCurrencyDto> { }

export interface CurrenciesResponse {
  data: Currency[];
  total: number;
  page: number;
  limit: number;
}
