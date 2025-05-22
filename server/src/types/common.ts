import { Request } from '@nestjs/common';

export type WalletType = {
  total_eth: any;
  total_usd: any;
  address: string;
  token_usd?: any;
  index?: number;
};

export interface WalletAddressedRequest extends Request {
  wallet_address: string;
}

export type TransactionSessionType = {
  interval?: 'FLAT' | 'MINMAX';
  transaction?: 'BUY' | 'SELL' | 'AUTO';
  type?: 'LOOP' | 'SINGLE';
  min_time?: number;
  max_time?: number;
  status?: 'RUNNING' | 'IDLE';
  percentage?: number;
};

export type TransactionLineType = {
  index: number;
  type: 'SELL' | 'BUY';
  wallet_index: number;
  usd_value: number;
  ticker: string;
  token_amount: number;
  status: 'loading' | 'error' | 'success';
};
