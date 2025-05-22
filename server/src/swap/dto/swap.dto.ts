export type SwapTokenDTO = {
  fromSwapToken: string;
  toSwapToken: string;
  toWalletAddress: string;
  amount: number;
  referred?: boolean;
  monetize?: {
    toWalletAddress: string;
    percentage: number | string;
    receiveTokenAddress: string;
  };
  slippage?: number;
};
