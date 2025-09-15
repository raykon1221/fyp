import { NextResponse } from "next/server";
import { ethers } from "ethers";

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    if (!process.env.ALCHEMY_RPC_MAINNET) {
      throw new Error("Missing ALCHEMY_RPC_MAINNET env");
    }

    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_MAINNET);
    const ens = await provider.lookupAddress(address);

    return NextResponse.json({ ens });
  } catch (e: any) {
    console.error("ENS lookup API error:", e);
    return NextResponse.json(
      { error: e.message || "ENS lookup failed" },
      { status: 500 }
    );
  }
}
