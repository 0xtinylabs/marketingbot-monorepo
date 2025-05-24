import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DBservice } from 'src/db/db.service';
import { WalletService } from 'src/wallet/wallet.service';
import { Web3Service } from 'src/web3/web3.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, DBservice, WalletService, Web3Service],
})
export class AuthModule { } 
