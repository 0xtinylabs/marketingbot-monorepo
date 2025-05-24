import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import LoginDTO from './dto/login.dto';
import { DBservice } from 'src/db/db.service';
import moralis from 'src/modules/moralis';
import { WalletType } from 'src/types/common';

@Injectable()
export class AuthService {
  constructor(public dbService: DBservice) { }
  async login(body: LoginDTO) {
    const user = await this.dbService.user.upsert({
      where: {
        wallet_address: body.wallet_address,
      },
      create: {
        wallet_address: body.wallet_address,
      },
      update: {},
      include: {
        wallets: true,
      },
    });

    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }

    const wallets_data: WalletType[] = [];
    for (const wallet of user.wallets) {
      const wallet_worth = await moralis.getWalletNetWorth(
        wallet.wallet_address,
      );
      const wallet_data: WalletType = {
        address: wallet.wallet_address,
        total_eth: wallet_worth.eth,
        total_usd: wallet_worth.usd,
        index: wallet.index ?? 0,
      };

      if (user.target_token) {
        const token_usd = await moralis.getWalletTokenUsdWorth(
          wallet.wallet_address,
          user.target_token,
        );
        wallet_data.token_usd = token_usd;
      }

      wallets_data.push(wallet_data);
    }

    return {
      user: {
        wallet_address: user?.wallet_address,
      },
      wallets: wallets_data,
      token: {
        contract_address: user?.target_token,
        ticker: user?.target_token_ticker,
        pool_address: user?.target_token,
      },
    };
  }
}
