import { TokenType, UserType, WalletType } from "./common";

export type LoginResponse = {
  user: UserType;
  wallets: WalletType[];
  token: TokenType;
};

export type WalletDownloadResponse = {
  index: number;
  wallet_address: string;
  wallet_private_key: string;
};
