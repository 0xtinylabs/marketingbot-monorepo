import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DBservice extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      console.log(err);
    }
  }

  async getUserForWalletAddress(
    wallet_address: string,
    include_wallets: boolean = false,
  ) {
    const user = await this.user.findUnique({
      where: {
        wallet_address: wallet_address,
      },
      include: {
        wallets: include_wallets,
      },
    });
    return user;
  }
}
