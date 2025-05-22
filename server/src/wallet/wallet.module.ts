import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { DBservice } from 'src/db/db.service';
import { Web3Service } from 'src/web3/web3.service';

@Module({
  controllers: [WalletController],
  providers: [WalletService, DBservice, Web3Service],
})
export class WalletModule {}
