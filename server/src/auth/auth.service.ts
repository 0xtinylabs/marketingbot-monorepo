import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import LoginDTO from './dto/login.dto';
import { DBservice } from 'src/db/db.service';
import moralis from 'src/modules/moralis';
import { WalletType } from 'src/types/common';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class AuthService {
  constructor(public dbService: DBservice, public walletService: WalletService) { }
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


    const wallets_data: WalletType[] = await this.walletService.getWalletPublicData(user.wallet_address);

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
