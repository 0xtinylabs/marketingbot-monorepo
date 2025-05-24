import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateWalletsDto } from './dto/create-wallet.dto';
import { DBservice } from 'src/db/db.service';
import { Web3Service } from 'src/web3/web3.service';
import { WalletType } from 'src/types/common';

@Injectable()
export class WalletService {
  constructor(
    private db: DBservice,
    private web3Service: Web3Service,
  ) { }

  async getAllWallets(wallet_address: string) {
    const user = await this.db.getUserForWalletAddress(wallet_address, true);
    if (!user) {
      return new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    return user?.wallets;
  }

  async createWallets(wallet_address: string, body: CreateWalletsDto) {
    const user = await this.db.getUserForWalletAddress(wallet_address, true);
    if (!user) {
      return new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }

    const wallets: WalletType[] = [];
    console.log(wallets)
    for (let i = 0; i < body.count; i++) {
      const wallet = this.web3Service.createWallet();
      const user_wallet = await this.db.wallet.create({
        data: {
          mnemonic: wallet.mnemonic.phrase,
          private_key: wallet.private_key,
          wallet_address: wallet.address,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      const max_index = await this.db.wallet.aggregate({
        _max: {
          index: true,
        },
      });

      const index = (max_index._max.index ?? 0) + 1;

      await this.db.wallet.update({
        where: {
          id: user_wallet.id,
        },
        data: {
          index: index,
        },
      });

      wallets.push({
        address: user_wallet.wallet_address,
        total_eth: 0,
        total_usd: 0,
        token_usd: 0,
        index: index,
      });
    }
    return wallets;
  }
}
