// Node 18+ için: fetch native. Eski Node için: import fetch from 'node-fetch';
import { CHAINS } from "src/types/enum";

function buildQuery(params: Record<string, any>) {
  return (
    "?" +
    Object.entries(params)
      .flatMap(([key, val]) => {
        if (Array.isArray(val)) return val.map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
        if (val !== undefined && val !== null) return `${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
        return [];
      })
      .join("&")
  );
}

class MoralisService {
  constructor(private apiKey: string) { }

  async getWalletNetWorth(walletAddress: string) {
    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/net-worth`;
    const params = {
      exclude_spam: true,
      exclude_unverified_contracts: true,
      max_token_inactivity: 1,
      min_pair_side_liquidity_usd: 1000,
      chains: CHAINS.BASE,
    };
    const res = await fetch(url + buildQuery(params), {
      headers: {
        "accept": "application/json",
        "X-API-Key": this.apiKey,
      },
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    const data = json?.chains?.[0]
    const total_worth = json?.total_networth_usd
    return {
      eth: data?.native_balance_formatted,
      usd: total_worth,
      token: data?.token_balance_usd
    }
  }

  async getWalletTokenUsdWorth(walletAddress: string, token_address: string, chain: string = CHAINS.BASE) {
    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/tokens`;
    const params = { chain, token_addresses: [token_address] };
    const res = await fetch(url + buildQuery(params), {
      headers: {
        "accept": "application/json",
        "X-API-Key": this.apiKey,
      },
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    console.log("TOKEN", data)
    return data?.result?.[0]?.usdValue;
  }

  async getTokenData(addresses: string[], chain: string = CHAINS.BASE_HASH) {
    const url = `https://deep-index.moralis.io/api/v2.2/erc20/metadata`;
    const params = { chain, addresses: addresses.join(",") };
    const res = await fetch(url + buildQuery(params), {
      headers: {
        "accept": "application/json",
        "X-API-Key": this.apiKey,
      },
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data?.[0];
  }

  async getTokenPrice(tokenAddress: string, chain: string = CHAINS.BASE_HASH) {
    const url = `https://deep-index.moralis.io/api/v2.2/erc20/${tokenAddress}/price`;
    const params = { chain, include: "percent_change" };
    const res = await fetch(url + buildQuery(params), {
      headers: {
        "accept": "application/json",
        "X-API-Key": this.apiKey,
      },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
}

const moralisHttp = new MoralisService(process.env.MORALIS_API_KEY!);
export default moralisHttp;
