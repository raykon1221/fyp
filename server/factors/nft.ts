// server/factors/nfts.ts
import { Alchemy, Network } from "alchemy-sdk";

const netMap: Record<string, Network> = {
  ETH_MAINNET: Network.ETH_MAINNET,
  ETH_SEPOLIA: Network.ETH_SEPOLIA,
  MATIC_MAINNET: Network.MATIC_MAINNET,
  OPT_MAINNET: Network.OPT_MAINNET,
  ARB_MAINNET: Network.ARB_MAINNET,
  BASE_MAINNET: Network.BASE_MAINNET,
};

export async function fetchNftsForOwner(
  address: string,
  network: keyof typeof netMap,
  pageKey?: string
) {
  const settings = {
    apiKey: process.env.ALCHEMY_API_KEY!,
    network: netMap[network],
  };
  const alchemy = new Alchemy(settings);

  return await alchemy.nft.getNftsForOwner(address, { pageKey });
}

export async function getNftDiversity01(user: `0x${string}`): Promise<number> {
  const CHAINS: (keyof typeof netMap)[] = [
    "ETH_MAINNET",
    "BASE_MAINNET",
    "ARB_MAINNET",
    "OPT_MAINNET",
    "MATIC_MAINNET",
  ];

  let allNfts: any[] = [];

  for (const chain of CHAINS) {
    try {
      const res = await fetchNftsForOwner(user, chain);
      if (res?.ownedNfts) {
        allNfts = allNfts.concat(res.ownedNfts);
      }
    } catch (e) {
      console.error(`NFT fetch failed for ${chain}`, e);
    }
  }

  if (!allNfts.length) return 0;

  // Score based on diversity of contracts
  const uniqContracts = new Set(
    allNfts.map((n) => n.contract?.address?.toLowerCase())
  ).size;

  return Math.min(uniqContracts / 10, 1);
}