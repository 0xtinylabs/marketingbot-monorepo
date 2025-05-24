import { LoginResponse, WalletDownloadResponse } from "@/types/api";
import baseService from "./base";
import { TokenType, WalletType } from "@/types/common";

const api = {
  login: async (
    wallet_address: string,
    signature: string
  ): Promise<LoginResponse> => {
    const res = await baseService.post(
      "/auth/login",
      {
        wallet_address,
      },
      {
        headers: {
          "x-wallet_address": wallet_address,
          "x-signature": signature,
        },
      }
    );
    return res.data as LoginResponse;
  },

  createWallets: async (
    wallet_address: string,
    count: number
  ) => {

    const res = await baseService.post<{ wallets: WalletType[] }>(
      "/wallet/create-many",
      {
        count,
      },
      {
        headers: {
          "x-wallet_address": wallet_address,
        },
      }
    );
    return res.data;
  },

  downloadWallets: async (wallet_address: string, signature: string) => {
    const res = await baseService.get<WalletDownloadResponse>(
      "/wallet/download",
      {
        headers: {
          "x-wallet_address": wallet_address,
          "x-signature": signature,
        },
      }
    );
    return res.data;
  },

  setUserToken: async (
    wallet_address: string,
    signature: string,
    token_address: string
  ) => {
    const res = await baseService.put<{ token: TokenType }>(
      "/token/set",
      {
        token_address,
      },
      {
        headers: {
          "x-wallet_address": wallet_address,
          "x-signature": signature,
        },
      }
    );
    return res.data;
  },
};

export default api;
