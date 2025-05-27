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

  getAllWallets: async (
    wallet_address: string
  ): Promise<{ wallets: WalletType[] }> => {
    const res = await baseService.get<{ wallets: WalletType[] }>(
      "/wallet/get-all",
      {
        headers: {
          "x-wallet_address": wallet_address,
        },
      }
    );
    return res.data;
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

  downloadWallets: async (wallet_address: string) => {
    const res = await baseService.get<WalletDownloadResponse>(
      "/wallet/download",
      {
        headers: {
          "x-wallet_address": wallet_address,
        },
      }
    );
    return res.data;
  },

  withdraw: async (wallet_address: string, wallet_addresses: string[], percentage: number, to_wallet_address: string, type: "NATIVE" | "TOKEN") => {
    try {

      const res = await baseService.get<number>("/transaction/withdraw", {
        headers: {
          "x-wallet_address": wallet_address,

        },
        params: {
          wallet_addresses: wallet_addresses.join(","),
          percentage,
          to_wallet_address,
          type
        }
      })
      return res.data
    }
    catch (err) {
      alert(err)
      return 0
    }
  },

  setUserToken: async (
    wallet_address: string,
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
        },
      }
    );
    return res.data;
  },
};

export default api;
