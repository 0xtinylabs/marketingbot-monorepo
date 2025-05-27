import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import SetTokenDTO from './dto/set-token.dto';
import { DBservice } from 'src/db/db.service';
import moralis from 'src/modules/moralis';
import { ethers, Wallet } from 'ethers';
import * as erc20ABI from 'src/app/abi/erc20.abi.json';
import { TOKENS } from 'src/contants';
import { TokenPriceResponse } from 'src/types/swap';
import TokenPredictionParamsDTO from './dto/token-prediction';

@Injectable()
export class TokenService {
  constructor(private db: DBservice) { }

  public provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)


  // public async calculateTokenPrediction(params: TokenPredictionParamsDTO) {

  //   let weth_balance = 0;
  //   let token_balance = 0;

  //   for (const address of params.wallet_addresses) {
  //     const wallet =await this.db.wallet.findUnique({
  //     where: {
  //       wallet_address: address
  //     }
  //     })
  //     if (wallet) {
  //       const client = new ethers.Wallet(wallet.private_key)
  //       const weth_balance = client.
  //     }
  //   }


  // }

  public async unwrapEther(amount: number, wallet: Wallet) {
    try {
      const weth = new ethers.Contract(
        TOKENS.weth,
        ['function withdraw(uint256 wad) public'],
        wallet,
      );
      let valueString =
        0.00001 > parseFloat(Number(amount).toFixed(5))
          ? 0.00001
          : parseFloat(Number(amount).toFixed(5));
      const tx = await weth.withdraw(ethers.utils.parseEther(String(valueString)));
      const res = await tx.wait();
      return res.hash;
    } catch (err) {
    } finally {
      const balance = await this.getBalanceForToken(TOKENS.weth, wallet);
      if (balance) {
        const balance_number = ethers.utils.formatUnits(
          balance?.balance,
          balance?.decimals,
        );
        if (Number(balance_number) < 0.00001) {
          const tokenContract = this.getTokenContract(TOKENS.weth, wallet);
          const approveTX = await tokenContract.approve(
            TOKENS.weth,
            ethers.utils.parseUnits('0', 18),
          );
          await approveTX.wait();
        }
      }
    }
  }

  public async wrapEtherOptimize(wallet_address: string) {
    const ETH_MIN = 0.005
    const user = await this.db.getUserForWalletAddress(wallet_address)
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    const wallets = await this.db.wallet.findMany({
      where: {
        user: {
          id: user.id
        }
      }
    })
    for (const wallet of wallets) {
      const client = new ethers.Wallet(wallet.private_key, this.provider)
      const balance = await client.getBalance()
      const balance_formatted = ethers.utils.formatEther(balance)
      const balance_float = parseFloat(balance_formatted)
      const to_weth = balance_float - ETH_MIN
      const token_contract = this.getTokenContract(TOKENS.weth, client)
      token_contract.
        this.unwrapEther
    }

  }


  async getBalanceForToken(token_address: string, wallet: Wallet) {
    try {
      const tokenContract = this.getTokenContract(token_address, wallet);
      const balance = await tokenContract.balanceOf(wallet.address);
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
