import { Injectable } from '@nestjs/common';
import SetTokenDTO from './dto/set-token.dto';
import { DBservice } from 'src/db/db.service';
import moralis from 'src/modules/moralis';
import { ethers, Wallet } from 'ethers';
import erc20ABI from 'src/app/abi/erc20.abi.json';

@Injectable()
export class TokenService {
  constructor(private db: DBservice) { }

  async getBalanceForToken(token_address: string, wallet: Wallet) {
    try {
      const tokenContract = this.getTokenContract(token_address, wallet);
      const balance = await tokenContract.balanceOf(wallet.address);
      const decimals = await tokenContract.decimals();
      return { balance, decimals };
    } catch {
      return null;
    }
  }

  public async getPriceForAmountOfToken(token_address: string, amount: number) {
    try {
      if (amount <= 0) {
        return 0;
      }
      const res = await this.getPriceForToken(token_address);

      let price = 0;

      price = res.price * amount;

      if (isNaN(price)) {
        return 0;
      }
      return price;
    } catch (err) {
      console.log(err);
      return 0;
    }
  }

  async approveToken(
    token_address: string,
    wallet: Wallet,
    spender: string,
    amount: bigint | number,
  ) {
    try {
      const tokenContract = this.getTokenContract(token_address, wallet);
      const approveTX = await tokenContract.approve(spender, amount);
      const approveResult = await approveTX.wait();
      return approveResult;
    } catch {
      return null;
    }
  }

  public getTokenContract(token_address: string, wallet: Wallet) {
    const contract = new ethers.Contract(token_address, erc20ABI, wallet);
    contract.connect(wallet);
    return contract;
  }

  public async getPriceForToken(token_address: string) {
    try {
      const res = await moralis.getTokenPrice(token_address);

      const price = res.usdPrice;
      const decimals = parseInt(res.tokenDecimals ?? '18');

      return { price: price, decimals: decimals, ticker: res.tokenSymbol };
    } catch {
      return { price: 0, decimals: 18, ticker: '' };
    }
  }

  async setUserToken(wallet_address: string, body: SetTokenDTO) {
    const token_data = await moralis.getTokenData([body.token_address]);
    await this.db.user.update({
      where: {
        wallet_address,
      },
      data: {
        target_token: body.token_address,
        target_token_ticker: token_data.symbol,
      },
    });
    return {
      contract_address: body.token_address,
      ticker: token_data.symbol,
      pool_address: token_data.address,
    };
  }
}
