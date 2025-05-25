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

class BirdeyeService {
    constructor(private apiKey: string) { }

    async getTokenMarketCap(token_address: string) {
        const url = `https://public-api.birdeye.so/defi/token_overview`;
        const params = {
            address: token_address
        };
        const res = await fetch(url + buildQuery(params), {
            headers: {
                "x-chain": "base",
                "x-api-key": this.apiKey,
            },
        });
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        const data = json?.data?.marketCap
        return data

    }





}

const birdeyeHTTP = new BirdeyeService(process.env.BIRDEYE_API_KEY!);
export default birdeyeHTTP;
