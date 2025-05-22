import { TransactionSessionType, WalletType } from 'src/types/common';

export class SessionStartDTO {
  public sessionData: TransactionSessionType;
  public wallet_address: string;
  public wallets: WalletType[];
}
