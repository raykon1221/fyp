import { NextResponse } from "next/server";
import { Alchemy, Network } from "alchemy-sdk";

const netMap: Record<string, Network> = {
  ETH_MAINNET: Network.ETH_MAINNET,
  ETH_SEPOLIA: Network.ETH_SEPOLIA,
  MATIC_MAINNET: Network.MATIC_MAINNET,
  OPT_MAINNET: Network.OPT_MAINNET,
  ARB_MAINNET: Network.ARB_MAINNET,
  BASE_MAINNET: Network.BASE_MAINNET,
};

export async function POST(req: Request) {
  try {
    const { address, pageKey, network } = (await req.json()) as {
      address: string; pageKey?: string; network?: string;
    };
    if (!address) {
      return NextResponse.json({ ok: false, error: "address required" }, { status: 400 });
    }

    const settings = {
      apiKey: process.env.ALCHEMY_API_KEY!,
      network: netMap[network || process.env.ALCHEMY_NETWORK || "ETH_MAINNET"] ?? Network.ETH_MAINNET,
    };
    const alchemy = new Alchemy(settings);

    // Get NFTs the user owns
    const res = await alchemy.nft.getNftsForOwner(address, {
      pageKey,
      // withMetadata: true, // default true
      // omitFields: ["spamInfo"], // optional
    });

    return NextResponse.json({ ok: true, data: res }, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
