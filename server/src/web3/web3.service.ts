import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class Web3Service {
  createWallet() {
    const wallet = ethers.Wallet.createRandom();
    return {
      mnemonic: wallet.mnemonic,
      private_key: wallet.privateKey,
      address: wallet.address,
    };
  }
}
