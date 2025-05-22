import { Body, Controller, Put, Request, UseGuards } from '@nestjs/common';
import { TokenService } from './token.service';
import { SignatureGuard } from 'src/guards/signature.guard';
import { SIGNMESSAGES } from 'src/contants';
import { WalletAddressedRequest } from 'src/types/common';
import SetTokenDTO from './dto/set-token.dto';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @UseGuards(new SignatureGuard(SIGNMESSAGES.SET_TOKEN))
  @Put('/set')
  async setUserToken(
    @Request() req: WalletAddressedRequest,
    @Body() body: SetTokenDTO,
  ) {
    const res = await this.tokenService.setUserToken(req.wallet_address, body);
    return { token: res };
  }
}
