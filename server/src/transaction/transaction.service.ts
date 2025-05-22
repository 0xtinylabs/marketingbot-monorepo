import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { SessionHistoryRecord, User } from '@prisma/client';
import { ethers } from 'ethers';
import { DBservice } from 'src/db/db.service';
import SwapService from 'src/swap/swap.service';
import { TokenService } from 'src/token/token.service';
import {
  TransactionLineType,
  TransactionSessionType,
  WalletType,
} from 'src/types/common';

@Injectable()
export class TransactionService {
  constructor(
    public swapService: SwapService,
    public db: DBservice,
    public tokenService: TokenService,
  ) {}

  async startTransactionSession(
    data: TransactionSessionType,
    user: User,
    wallets: WalletType[],
    index: number = 0,
    onStart: (isLoop: boolean, loopIndex: number) => void,
    onEnd: (isLoop: boolean) => void,
    onNewLine: (newLine: TransactionLineType, is_update) => Promise<void>,
  ) {
    const is_loop = data.type === 'LOOP';
    onStart?.(is_loop, index ?? 0);

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
      const client = new ethers.Wallet(wallet_info.private_key);
      const balance = await this.tokenService.getBalanceForToken(
        user.target_token ?? '',
        client,
      );

      if (balance?.balance <= 0) {
        continue;
      }

      const token_amount = (balance?.balance * (data.percentage ?? 0)) / 100;
      const usd_value = await this.tokenService.getPriceForAmountOfToken(
        user.target_token,
        token_amount,
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
        },
        false,
      );
      let interval = setInterval(() => {
        secondPassed += 1;
      }, 1000);
      const response = await this.swapService.executeSwap(
        data.transaction as any,
        data.percentage ?? 0,
        user.target_token ?? '',
        { address: wallet.address, private_key: wallet_info?.private_key },
      );
      if (secondPassed < second) {
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
          },
          true,
        );
      }
    }
    if (is_loop && processedWallets > 0) {
      await this.startTransactionSession(
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
