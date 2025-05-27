import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletModule } from './wallet/wallet.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { DBservice } from './db/db.service';
import { AuthService } from './auth/auth.service';
import { Web3Service } from './web3/web3.service';
import { LoopService } from './loop/loop.service';
import { TokenModule } from './token/token.module';
import { SessionModule } from './session/session.module';
import { TransactionService } from './transaction/transaction.service';
import { TokenService } from './token/token.service';
import SwapService from './swap/swap.service';
import { SessionService } from './session/session.service';
import { WalletService } from './wallet/wallet.service';
import { ethers } from 'ethers';
import { TOKENS } from './contants';
import TransactionModule from './transaction/transaction.module';

@Module({
  imports: [WalletModule, AuthModule, AppModule, TokenModule, SessionModule, TransactionModule],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    DBservice,
    AuthService,
    Web3Service,
    LoopService,
    TransactionService,
    SwapService,
    TokenService,
    WalletService
  ],
})
export class AppModule {

  constructor(public tokenService: TokenService) {


  }
}
