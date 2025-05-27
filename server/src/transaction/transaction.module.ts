import { Module } from "@nestjs/common";
import TransactionController from "./transaction.controller";
import { TransactionService } from "./transaction.service";
import SwapService from "src/swap/swap.service";
import { DBservice } from "src/db/db.service";
import { TokenService } from "src/token/token.service";


@Module({ controllers: [TransactionController], providers: [TransactionService, SwapService, DBservice, TokenService] })

class TransactionModule { }

export default TransactionModule