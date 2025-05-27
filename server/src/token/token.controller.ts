import { Body, Controller, Get, Param, ParseArrayPipe, Put, Query, Request, UseGuards } from '@nestjs/common';
import { TokenService } from './token.service';
import { SignatureGuard } from 'src/guards/signature.guard';
import { SIGNMESSAGES } from 'src/contants';
import { WalletAddressedRequest } from 'src/types/common';
import SetTokenDTO from './dto/set-token.dto';
import { WalletRequest } from 'src/decorators/method/wallet_address.decorator';
import TokenPredictionParamsDTO from './dto/token-prediction';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) { }



  @WalletRequest()
  @Put('/set')
  async setUserToken(
    @Request() req: WalletAddressedRequest,
    @Body() body: SetTokenDTO,
  ) {
    const res = await this.tokenService.setUserToken(req.wallet_address, body);
    return { token: res };
  }



  // @WalletRequest()
  // @Post("/wrap-optimize")
  // async updateWrappedEther(@Request() req: WalletAddressedRequest) {
  //   const res = await this.tokenService.
  // }

  // @WalletRequest()
  // @Get("/token-prediction")
  // async getTokenPrediction(
  //   @Request() req: WalletAddressedRequest,
  //   @Query() params: TokenPredictionParamsDTO,
  //   @Query("wallet_address", new ParseArrayPipe({ items: String, separator: "," })) wallet_addresses: string[]
  // ) {
  //   const res = this.tokenService.calculateTokenPrediction({ ...params, wallet_addresses })
  //   return res
  // }

}
