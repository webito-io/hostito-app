import { instance } from "./instance";

export interface WalletBalance {
  balance: number;
  currencyId: number;
}

export interface WalletDepositResponse {
  transaction: Record<string, any>;
  payment: Record<string, any>;
}

export const walletsService = {
  balance: async () => {
    const response = await instance.get<WalletBalance>("/wallets/balance");
    return response.data;
  },
  deposit: async (data?: Record<string, any>) => {
    const response = await instance.post<WalletDepositResponse>("/wallets/deposit", data || {});
    return response.data;
  },
};
