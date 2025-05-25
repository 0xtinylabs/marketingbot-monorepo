import { Injectable } from '@nestjs/common';
import SetTokenDTO from './dto/set-token.dto';
import { DBservice } from 'src/db/db.service';
import moralis from 'src/modules/moralis';
import { ethers, Wallet } from 'ethers';
import * as erc20ABI from 'src/app/abi/erc20.abi.json';
import { TOKENS } from 'src/contants';
import { TokenPriceResponse } from 'src/types/swap';

@Injectable()
export class TokenService {
  constructor(private db: DBservice) { }

  async getBalanceForToken(token_address: string, wallet: Wallet) {
    try {
      const tokenContract = this.getTokenContract(token_address, wallet);
      const balance = await tokenContract.balanceOf(wallet.address);
      console.log(balance)
      const decimals = await tokenContract.decimals();
      return { balance, decimals };
    } catch (err) {
      console.log("Error", err)
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

    console.log('Getting token contract for: ', token_address, ' wallet: ', wallet.address);
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


  public async getTokenFactor(from_token: string, to_token: string) {
    const from_token_price = await this.getPriceForToken(from_token);
    const to_token_price = await this.getPriceForToken(to_token);
    // Do not divide with 0
    return to_token_price.price / (from_token_price.price ?? 1);
  }

  public async convertTokenAmount(
    amount: number,
    from_token: string,
    to_token: string,
  ) {
    const factor = await this.getTokenFactor(from_token, to_token);
    return amount * factor; // To not divide with 0;
  }

  public async wrapEther(amount: number, wallet: Wallet) {
    try {
      const weth = new ethers.Contract(
        TOKENS.weth,
        ['function deposit() public payable'],
        wallet,
      );
      let valueString =
        0.00001 > parseFloat(amount.toFixed(5))
          ? 0.00001
          : parseFloat(amount.toFixed(5));
      await weth.deposit({ value: ethers.utils.parseEther(String(valueString)) });
    } catch (err) {
      console.log('WRAPPING ERROR: ', err);
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
