import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { SessionHistoryRecord, User } from '@prisma/client';
import { ethers, Wallet } from 'ethers';
import { TOKENS } from 'src/contants';
import { DBservice } from 'src/db/db.service';
import birdeyeHTTP from 'src/modules/birdeye';
import moralisHttp from 'src/modules/moralis';
import SwapService from 'src/swap/swap.service';
import { TokenService } from 'src/token/token.service';
import {
  TransactionLineType,
  TransactionSessionType,
  WalletType,
} from 'src/types/common';
import { CHAINS } from 'src/types/enum';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TransactionService {

  public provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL ?? "")
  constructor(
    public swapService: SwapService,
    public db: DBservice,
    public tokenService: TokenService,
  ) {
    this.provider.on("error", async () => {
      console.log('Provider error, trying to reconnect...');
    })
  }

  async withdrawForWallets(type: "TOKEN" | "NATIVE", wallet_addresses: string[], token_address: string, to_wallet_address: string, percentage: number) {

    let total_success = 0;
    for (const address of wallet_addresses) {
      const res = await this.withdraw(type, token_address, address, to_wallet_address, {
        percentage
      })
      if (res) {
        total_success += 1
      }
    }
    return total_success

  }


  async withdraw(type: "TOKEN" | "NATIVE", token_address: string, from_wallet_address: string, to_wallet_address: string, amount: {
    normal?: number,
    percentage?: number
  }) {
    try {
      const wallet = await this.db.wallet.findUnique({
        where: {
          wallet_address: from_wallet_address
        }
      })
      if (!wallet) {
        return false
      }

      const client = new ethers.Wallet(wallet.private_key, this.provider)

      if (type === "NATIVE") {
        const balance = await client.getBalance()
        const ether_amount = amount?.normal ? amount.normal : BigInt(balance as any) * BigInt(amount?.percentage ?? 0) / BigInt(100)
        const tx = await client.sendTransaction({
          to: to_wallet_address,
          from: wallet.wallet_address,
          value: ether_amount,
        });
        const hash = await tx.wait()

        return { tx: hash, result: true }
      }
      if (type === "TOKEN") {
        console.log(type, token_address, from_wallet_address, to_wallet_address)

        const balance = await this.tokenService.getBalanceForToken(token_address, client)
        const tokenContract = this.tokenService.getTokenContract(token_address, client)
        const token_amount = amount?.normal ? amount.normal : BigInt(balance?.balance) * BigInt(amount?.percentage ?? 0) / BigInt(100)
        await this.tokenService.approveToken(token_address, client, from_wallet_address, token_amount)
        const gasPrice = this.provider.getGasPrice()
        const tx = await tokenContract.transfer(to_wallet_address, token_amount, {
          gasPrice: gasPrice
        })
        const hash = await tx.wait()
        return { tx: hash, result: true }

      }
      return false
    }
    catch (err) {
      console.log(err)
      return false
    }


  }

  async sendReplacementTransaction(wallet: Wallet) {

    const nonce = await this.provider.getTransactionCount(wallet.address, "pending");
    const tx = {
      to: wallet.address,
      value: 0,
      nonce,
      gasLimit: 21000,
      maxFeePerGas: ethers.utils.parseUnits('80', 'gwei'),
      maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei'),
    };
    const sentTx = await wallet.sendTransaction(tx);

  }


  async startTransactionSession(
    controller: AbortController,
    data: TransactionSessionType,
    user: User,
    wallets: WalletType[],
    wallet_states: {
      [key: `W${number}`]: {
        should_process: boolean,
        index: number,
        address: string
      }
    },
    index: number = 0,
    onStart: (isLoop: boolean, loopIndex: number) => void,
    onEnd: (isLoop: boolean) => void,
    onNewLine: (newLine: TransactionLineType, is_update) => Promise<void>,
  ) {


    try {


      if (controller.signal.aborted) {
        return;
      }


      const is_loop = data.type === 'LOOP';

      console.log(is_loop);


      onStart?.(is_loop, index ?? 0);

      console.log('wallets', wallets)

      let processedWallets = 0;

      const processWallet = async (wallet: WalletType, wallet_index: number) => {




        if (controller.signal.aborted) {
          return;
        }
        if (wallet_states[`W${wallet.index}`]?.should_process === false) {
          return;
        }

        const line_id = uuid()



        try {


          const wallet_info = await this.db.wallet.findUnique({
            where: {
              wallet_address: wallet.address,
            },
            select: {
              private_key: true,
            },
          });

          if (!wallet_info?.private_key || !user.target_token) {
            return;
          }
          const client = new ethers.Wallet(wallet_info.private_key, this.provider);

          // let second_passed = 0;
          // setInterval(() => {
          //   second_passed += 1;
          //   if (second_passed > 15) {
          //     this.sendReplacementTransaction(client).then(() => {
          //       wallet_states[`W${wallet.index}`] = {
          //         should_process: true,
          //         index: wallet.index,
          //         address: wallet.address,
          //       };
          //       onNewLine({
          //         index: index,
          //         status: 'error',
          //         type: data.transaction as any,
          //         ticker: user.target_token_ticker ?? '',
          //         token_amount: BigInt(0),
          //         usd_value: 0,
          //         wallet_index: wallet.index ?? 1,
          //         id: line_id,
          //         market_cap: 0,
          //         tx: 'Replacement transaction sent',
          //       }, true);
          //     })

          //   }
          //   return
          // }, 1000)




          let balance: any = 0
          let decimals = 18;

          if (data.transaction === "BUY") {
            balance = await client.getBalance()
          }


          if (data.transaction === "SELL") {
            const res = await this.tokenService.getBalanceForToken(
              user?.target_token ?? '',
              client,
            );
            decimals = res?.decimals ?? 18;
            balance = res?.balance ?? 0;
          }












          const token_amount = (BigInt(balance) * (BigInt(data.percentage ?? 0) ?? BigInt(0))) / BigInt(100);

          console.log('token_amount', token_amount, 'balance', balance, 'decimals', decimals)



          const token_amount_formatted = ethers.utils.formatUnits(token_amount, decimals)


          const usd_value = await this.tokenService.getPriceForAmountOfToken(
            data?.transaction === "BUY" ? TOKENS.weth : user.target_token,
            Number(token_amount_formatted) ?? 0,
          );

          console.log('usd_value', balance.toString(), token_amount, usd_value, 'token_amount_formatted', token_amount_formatted, 'amount_fixed', token_amount, 'decimals', decimals)




          processedWallets += 1;

          const market_cap = await birdeyeHTTP.getTokenMarketCap(user?.target_token ?? "")


          onNewLine(
            {
              index: wallet_index,
              status: 'loading',
              type: data.transaction as any,
              ticker: user.target_token_ticker ?? '',
              token_amount: token_amount,
              usd_value: usd_value,
              wallet_index: wallet.index ?? 1,
              id: line_id,
              market_cap
            },

            false,
          );


          const response = await this.swapService.executeSwap(
            data.transaction as any,
            token_amount,
            user.target_token ?? '',
            { address: wallet.address, private_key: wallet_info?.private_key },
          );

          if (data?.transaction === "SELL" && response?.buy_amount) {
            try {

              await this.tokenService.unwrapEther(response?.buy_amount, client)
            }
            catch (error) { }
          }

          wallet_states[`W${wallet.index}`] = {
            should_process: true,
            index: wallet.index,
            address: wallet.address,
          };

          if (response.error) {
            onNewLine(
              {
                index: wallet_index,
                status: 'error',
                type: data.transaction as any,
                ticker: user.target_token_ticker ?? '',
                token_amount: token_amount,
                usd_value: usd_value,
                wallet_index: wallet.index ?? 1,
                id: line_id,
                market_cap,
                tx: response?.tx
              },
              true,
            );
          } else {
            onNewLine(
              {
                index: wallet_index,
                status: 'success',
                type: data.transaction as any,
                ticker: user.target_token_ticker ?? '',
                token_amount: token_amount,
                usd_value: usd_value,
                wallet_index: wallet.index ?? 1,
                id: line_id,
                market_cap,
                tx: response?.tx
              },
              true,
            );
          }
        }

        catch (error) {
          wallet_states[`W${wallet.index}`] = {
            should_process: true,
            index: wallet.index,
            address: wallet.address,
          };
        }
      }

      const second =
        data.interval === 'MINMAX'
          ? faker.number.int({ min: data.min_time, max: data.max_time })
          : (data.min_time ?? 0);



      let wallet_index = 0;
      for (const wallet of wallets) {



        processWallet(wallet, wallet_index)

        await new Promise((resolve) => {
          setTimeout(
            () => {
              wallet_index += 1

              resolve(true);
            },
            second * 1000,
          );
        });


      }
      if (is_loop && processedWallets > 0) {
        await this.startTransactionSession(
          controller,
          data,
          user,
          wallets,
          wallet_states,
          index + 1,
          onStart,
          () => { },
          onNewLine,
        );
      }
      onEnd?.(is_loop);
    }

    catch (error) {

    }

    // if (is_loop && )
    // onEnd?.(is_loop,index)
  }
}
