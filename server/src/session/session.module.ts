import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionGateway } from './session.gateway';
import { DBservice } from 'src/db/db.service';
import { TransactionService } from 'src/transaction/transaction.service';
import SwapService from 'src/swap/swap.service';
import { TokenService } from 'src/token/token.service';

@Module({
  providers: [
    SessionGateway,
    SessionService,
    DBservice,
    TransactionService,
    SwapService,
    TokenService,
  ],
})
export class SessionModule {}
