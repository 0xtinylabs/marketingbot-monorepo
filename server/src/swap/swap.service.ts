/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { SwapTokenDTO } from './dto/swap.dto';
import { SwapTransaction } from 'src/types/swap';
import { ethers } from 'ethers';
import { TokenService } from 'src/token/token.service';
import {
  concat,
  createWalletClient,
  Hex,
  http,
  numberToHex,
  publicActions,
  size,
} from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { TOKENS } from 'src/contants';


const axios = require((process as any).pkg ? 'axios/dist/browser/axios.cjs' : "axios");
const { AxiosInstance } = axios

@Injectable()
class SwapService {
  public rpc_url = process.env.RPC_URL;

  public provider = new ethers.providers.JsonRpcProvider(this.rpc_url);

  private static swapRoute: string = '/swap/permit2/quote';

  private swapHTTP: typeof AxiosInstance;

  constructor(public tokenService: TokenService) {
    this.swapHTTP = axios.create({
      baseURL: 'https://api.0x.org/',
      headers: {
        '0x-version': 'v2',
        '0x-api-key': process.env.MATCHA_API_KEY ?? '',
      },
    });
  }

  private handleNativeETH(tokenAddress: string) {
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      return '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    } else {
      return tokenAddress;
    }
  }

  private getCorrectAmount(tokenAddress: string, amount: any) {
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      return BigInt(Math.floor(parseFloat(amount) * 1e18));
    } else if (
      tokenAddress === '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' ||
      tokenAddress === '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA'
    ) {
      return BigInt(Math.floor(parseFloat(amount) * 1e6));
    } else {
      return BigInt(Math.floor(parseFloat(amount) * 1e18));
    }
  }

  public async executeSwap(
    type: 'BUY' | 'SELL',
    amount: any,
    token_address: string,
    wallet_info: { private_key: string; address: string },
  ) {

    // let wrap_amount = 0;


    try {

      let from_token;
      let to_token;
      if (type === 'SELL') {
        from_token = token_address;
        to_token = TOKENS.weth;
      } else if (type === 'BUY') {
        from_token = TOKENS.ETH;
        to_token = token_address;
      }
      const wallet = new ethers.Wallet(wallet_info.private_key, this.provider);

      if (!wallet?.address) {
        return { error: true, message: 'No user for wallet' };
      }

      console.log(from_token)

      const token = this.tokenService.getTokenContract(from_token, wallet);
      console.log(token)







      const swap = await this.getTransactionForSwap({
        amount: amount,
        fromSwapToken: from_token,
        toSwapToken: to_token,
        toWalletAddress: wallet.address,
      });

      console.log("SWAP", swap);



      // try {

      //   if (type === "BUY" && swap?.buyAmount) {
      //     const sell_amount = await this.tokenService.convertTokenAmount(
      //       swap?.buyAmount,
      //       TOKENS.weth,
      //       token_address,
      //     );
      //     await this.tokenService.wrapEther(sell_amount * 110, wallet)
      //     wrap_amount = sell_amount;
      //   }
      // }
      // catch (err) {
      //   console.log(err)
      // }



      if (swap?.allowanceTarget) {
        const approveTx = await token.approve(
          swap?.allowanceTarget,
          ethers.constants.MaxUint256,
        );

        const approveResult = await approveTx.wait();
        if (approveResult?.result === 0) {
          console.log('COULD NOT APPROVE FOR SWAP: ' + approveResult?.hash);
        }
      }


      const client = createWalletClient({
        account: privateKeyToAccount(wallet.privateKey as any),
        transport: http(this.rpc_url),
        chain: base,
      }).extend(publicActions);



      if (!client) {
        return { error: true, message: 'No user for wallet' };
      }


      const nonce = await client.getTransactionCount({
        address: client.account.address,
      });

      if (type === "BUY") {
        const txHash = await client.sendTransaction({
          account: client.account,
          chain: client.chain,
          gas: swap?.gas ? BigInt(swap.gas) : undefined,
          to: swap?.to as any,
          data: swap?.data as any,
          value: BigInt(swap?.value ?? 0), // Ensure value is set for native tokens
          gasPrice: !!swap?.gasPrice ? BigInt(swap?.gasPrice) : undefined,
          nonce: nonce,
        });
        return { buy_amount: swap?.buyAmount, tx: txHash, cost: swap?.networkFee };

      }


      const signature = await client.signTypedData(swap?.eip712);
      const signatureLengthInHex = numberToHex(size(signature), {
        signed: false,
        size: 32,
      });

      const transactionData = swap?.data as Hex;
      const sigLengthHex = signatureLengthInHex as Hex;
      const sig = signature as Hex;

      const signedData = concat([transactionData, sigLengthHex, sig]);
      const sleep = async (ms: number) =>
        new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      await sleep(3000);



      const signedTransaction = await client.signTransaction({
        account: client.account,
        chain: client.chain,
        gas: !!swap?.gas ? BigInt(swap?.gas) : undefined,
        to: swap?.to as any,
        data: signedData as any,
        gasPrice: !!swap?.gasPrice ? BigInt(swap?.gasPrice) : undefined,
        nonce: nonce,
      });

      const tx = await client.sendRawTransaction({

        serializedTransaction: signedTransaction,

      });


      // Can not get TX hash for swap
      return { buy_amount: swap?.buyAmount, tx: tx, cost: swap?.networkFee };
    }


    catch (err) {
      console.log('SWAP ERROR', err);
      // if (wrap_amount > 0) {
      //   try {
      //     const wallet = new ethers.Wallet(wallet_info.private_key, this.provider);
      //     await this.tokenService.unwrapEther(wrap_amount, wallet);
      //   } catch (err) {
      //     console.log('UNWRAP ERROR', err);
      //     return { error: true, message: 'Error executing swap' };
      //   }
      // }
      return { error: true, message: 'Error executing swap' };
    }









  }

  public async getTransactionForSwap(params: SwapTokenDTO) {
    console.log("PARAMSx", params)
    console.log()
    const paramsWithChainID = {
      sellToken: this.handleNativeETH(params.fromSwapToken),
      buyToken: this.handleNativeETH(params.toSwapToken),
      taker: params.toWalletAddress,
      sellAmount: params.amount,
      chainId: 8453,
    };
    console.log("X")
    try {
      const swapQuote = (await this.swapHTTP.get(SwapService.swapRoute, {
        params: paramsWithChainID,
      })) as any;
      console.log("SWAP QUOTE", swapQuote, paramsWithChainID);
      const data: SwapTransaction = swapQuote.data?.transaction ?? {};
      data.buyAmount = parseFloat(swapQuote?.data?.buyAmount) / 1e18;
      data.allowanceTarget = swapQuote?.data?.issues?.allowance?.spender;
      data.networkFee = swapQuote?.data?.totalNetworkFee;
      data.source = swapQuote?.data?.route?.fills?.[0].source;
      data.eip712 = swapQuote?.data?.permit2?.eip712;
      data.user_fee = swapQuote?.data?.fees?.integratorFee?.amount;
      return data;
    } catch (err: any) {
      console.log("ERRRRRRR")
      console.log(err);
      console.log(err?.response?.data?.data?.details);
      return null;
    }
  }
}

export default SwapService;
