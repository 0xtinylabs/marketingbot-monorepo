import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { SessionHistoryRecord, User } from '@prisma/client';
import { ethers } from 'ethers';
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
import { v4 as uuid } from 'uuid';

@Injectable()
export class TransactionService {

  public provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL ?? "")
  constructor(
    public swapService: SwapService,
    public db: DBservice,
    public tokenService: TokenService,
  ) { }





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

      const processWallet = async (wallet: WalletType) => {
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



          let balance: any = 0
          let decimals = 18;

          if (data.transaction === "BUY") {
            balance = await client.getBalance()
          }


          else {
            const res = await this.tokenService.getBalanceForToken(
              user?.target_token ?? '',
              client,
            );
            decimals = res?.decimals ?? 18;
            balance = res?.balance ?? 0;
          }












          const token_amount = (balance * (data.percentage ?? 0)) / 100;



          const amount_fixed = BigInt(token_amount?.toString().replace(/\..*$/, ""))
          console.log('amount_fixed', amount_fixed)
          const token_amount_formatted = ethers.utils.formatUnits(amount_fixed, decimals)


          const usd_value = await this.tokenService.getPriceForAmountOfToken(
            data?.transaction === "BUY" ? TOKENS.weth : user.target_token,
            Number(token_amount_formatted) ?? 0,
          );

          console.log('usd_value', token_amount, usd_value, 'token_amount_formatted', token_amount_formatted, 'amount_fixed', amount_fixed, 'decimals', decimals)

          // if ((usd_value as any) !== false) {
          //   return
          // }



          processedWallets += 1;

          const market_cap = await birdeyeHTTP.getTokenMarketCap(user?.target_token ?? "")


          onNewLine(
            {
              index: index,
              status: 'loading',
              type: data.transaction as any,
              ticker: user.target_token_ticker ?? '',
              token_amount: amount_fixed,
              usd_value: usd_value,
              wallet_index: wallet.index ?? 1,
              id: line_id,
              market_cap
            },

            false,
          );


          const response = await this.swapService.executeSwap(
            data.transaction as any,
            data.percentage ?? 0,
            amount_fixed,
            user.target_token ?? '',
            { address: wallet.address, private_key: wallet_info?.private_key },
          );

          wallet_states[`W${wallet.index}`] = {
            should_process: true,
            index: wallet.index,
            address: wallet.address,
          };

          if (response.error) {
            onNewLine(
              {
                index: index,
                status: 'error',
                type: data.transaction as any,
                ticker: user.target_token_ticker ?? '',
                token_amount: amount_fixed,
                usd_value: usd_value,
                wallet_index: wallet.index ?? 1,
                id: line_id,
                market_cap,
              },
              true,
            );
          } else {
            onNewLine(
              {
                index: index,
                status: 'success',
                type: data.transaction as any,
                ticker: user.target_token_ticker ?? '',
                token_amount: amount_fixed,
                usd_value: usd_value,
                wallet_index: wallet.index ?? 1,
                id: line_id,
                market_cap,
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

      for (const wallet of wallets) {



        processWallet(wallet)

        await new Promise((resolve) => {
          setTimeout(
            () => {
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
