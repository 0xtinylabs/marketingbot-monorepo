import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { SignatureGuard } from 'src/guards/signature.guard';
import { SIGNMESSAGES } from 'src/contants';
import { CreateWalletsDto } from './dto/create-wallet.dto';
import { WalletAddressedRequest } from 'src/types/common';
import { WalletRequest } from 'src/decorators/method/wallet_address.decorator';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) { }

  @WalletRequest()
  @Get('/download')
  async getWallets(@Request() req: WalletAddressedRequest) {
    const res = await this.walletService.getAllWallets(req.wallet_address);
    return res;
  }

  @WalletRequest()
  @Get("/get-all")
  async getAllWallets(@Request() req: WalletAddressedRequest) {
    const res = await this.walletService.getWalletPublicData(req.wallet_address);
    return { wallets: res };
  }

  // @UseGuards(new SignatureGuard(SIGNMESSAGES.CREATE_WALLET))
  @WalletRequest()
  @Post('/create-many')
  async createWallets(
    @Body() body: CreateWalletsDto,
    @Request() req: WalletAddressedRequest,
  ) {
    const res = await this.walletService.createWallets(
      req.wallet_address,
      body,
    );
    return { wallets: res };
  }
}
