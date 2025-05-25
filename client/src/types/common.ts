export type UserType = {
  wallet_address: string;
} | null;

export type WalletType = {
  total_eth: number;
  total_usd: number;
  token_usd: number;
  address: string;
  index?: number;
};

export type TokenType = {
  contract_address?: string;
  ticker?: string;
  pool_address?: string;
} | null;

export type TransactionSessionType = {
  interval?: "FLAT" | "MINMAX";
  transaction?: "BUY" | "SELL" | "AUTO";
  type?: "LOOP" | "SINGLE";
  min_time?: number;
  max_time?: number;
  status?: "RUNNING" | "IDLE";
  percentage?: number;
};

export type TransactionLineType = {
  index: number;
  type: "SELL" | "BUY";
  wallet_index: number;
  usd_value: number;
  ticker: string;
  token_amount: number;
  status: "loading" | "error" | "success";
  id: string
};
