import Moralis from 'moralis';
import { CHAINS } from 'src/types/enum';

class MoralisService {
  constructor() {
    this.startService();
  }

  public async startService() {
    await Moralis.start({
      apiKey: process.env.MORALIS_API_KEY,
    });
  }

  async getWalletTokenUSDWorth(wallet_address: string, token_address: string) {
    const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
      address: wallet_address,
      tokenAddresses: [token_address],
      chain: CHAINS.BASE_HASH,
    });
    return response?.result[0]?.usdValue;
  }

  async getTokenData(token_address: string) {
    const response = await Moralis.EvmApi.token.getTokenMetadata({
      addresses: [token_address],
      chain: CHAINS.BASE_HASH,
    });
    return response.raw[0];
  }

  async getTokenPrice(token_address: string) {
    const response = await Moralis.EvmApi.token.getTokenPrice({
      address: token_address,
      chain: CHAINS.BASE_HASH,
    });
    return response.result;
  }

  async getWalletNetworth(wallet_address: string) {
    const response = await Moralis.EvmApi.wallets.getWalletNetWorth({
      excludeSpam: true,
      excludeUnverifiedContracts: true,
      address: wallet_address,
      chains: [CHAINS.BASE_HASH],
    });

    return {
      usd: response.raw.total_networth_usd,
      eth: response.raw.chains.find((c) => c.chain === (CHAINS.BASE as string))
        ?.native_balance_formatted,
    };
  }
}

const moralis = new MoralisService();
export default moralis;
