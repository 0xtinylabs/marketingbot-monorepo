import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { SessionHistoryRecord, User } from '@prisma/client';
import { ethers } from 'ethers';
import { TOKENS } from 'src/contants';
import { DBservice } from 'src/db/db.service';
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
    index: number = 0,
    onStart: (isLoop: boolean, loopIndex: number) => void,
    onEnd: (isLoop: boolean) => void,
    onNewLine: (newLine: TransactionLineType, is_update) => Promise<void>,
  ) {


    const line_id = uuid()

    if (controller.signal.aborted) {
      return;
    }


    const is_loop = data.type === 'LOOP';

    console.log(is_loop);


    onStart?.(is_loop, index ?? 0);

    console.log('wallets', wallets)

    let processedWallets = 0;
    for (const wallet of wallets) {

      let secondPassed = 0;
      const second =
        data.interval === 'MINMAX'
          ? faker.number.int({ min: data.min_time, max: data.max_time })
          : (data.min_time ?? 0);
      const wallet_info = await this.db.wallet.findUnique({
        where: {
          wallet_address: wallet.address,
        },
        select: {
          private_key: true,
        },
      });

      if (!wallet_info?.private_key || !user.target_token) {
        continue;
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

      const token_amount_formatted = ethers.utils.formatUnits(String(Math.floor(token_amount) ?? 0), decimals)

      const usd_value = await this.tokenService.getPriceForAmountOfToken(
        user.target_token,
        Number(token_amount_formatted ?? 0),
      );





      processedWallets += 1;


      onNewLine(
        {
          index: index,
          status: 'loading',
          type: data.transaction as any,
          ticker: user.target_token_ticker ?? '',
          token_amount: token_amount,
          usd_value: usd_value,
          wallet_index: wallet.index ?? 1,
          id: line_id,
        },

        false,
      );
      let interval = setInterval(() => {
        secondPassed += 1;
      }, 1000);
      const response = await this.swapService.executeSwap(
        data.transaction as any,
        data.percentage ?? 0,
        balance * (data.percentage ?? 0) / 100,
        user.target_token ?? '',
        { address: wallet.address, private_key: wallet_info?.private_key },
      );
      if (secondPassed < second) {
        clearInterval(interval);
        await new Promise((resolve) => {
          setTimeout(
            () => {
              resolve(true);
            },
            Math.abs(secondPassed - second) * 1000,
          );
        });
      }
      if (response.error) {
        onNewLine(
          {
            index: index,
            status: 'error',
            type: data.transaction as any,
            ticker: user.target_token_ticker ?? '',
            token_amount: token_amount,
            usd_value: usd_value,
            wallet_index: wallet.index ?? 1,
            id: line_id,
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
            token_amount: token_amount,
            usd_value: usd_value,
            wallet_index: wallet.index ?? 1,
            id: line_id,
          },
          true,
        );
      }
    }
    if (is_loop && processedWallets > 0) {
      await this.startTransactionSession(
        controller,
        data,
        user,
        wallets,
        index + 1,
        onStart,
        onEnd,
        onNewLine,
      );
    }
    onEnd?.(is_loop);
    // if (is_loop && )
    // onEnd?.(is_loop,index)
  }
}
