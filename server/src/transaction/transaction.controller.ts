import { Controller, Get, ParseArrayPipe, Query, Request } from "@nestjs/common";
import { TokenService } from "src/token/token.service";
import { TransactionService } from "./transaction.service";
import { WalletRequest } from "src/decorators/method/wallet_address.decorator";
import { WalletAddressedRequest } from "src/types/common";
import WithdrawDTO from "./dto/withdraw.dto";

@Controller("transaction")
class TransactionController {

    constructor(public transactionService: TransactionService, public tokenService: TokenService) { }

    @WalletRequest()
    @Get("/withdraw")
    async withdrawToken(@Request() req: WalletAddressedRequest, @Query() params: WithdrawDTO, @Query("percentage") percentage: number, @Query("wallet_addresses", new ParseArrayPipe({ items: String, separator: "," })) wallet_addresses: string[]) {

        console.log(req, params)
        const res = await this.transactionService.withdrawForWallets(params.type, wallet_addresses, params.token_address, params.to_wallet_address, percentage)
        return res

    }

}

export default TransactionController