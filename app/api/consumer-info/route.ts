// app/api/consumer-info/route.ts
import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbi } from "viem";
import { sepolia } from "viem/chains";

const RPC_URL = process.env.SEPOLIA_RPC_URL!;
const CONSUMER = process.env.SCORE_CONSUMER as `0x${string}`;

const ABI = parseAbi([
  "function updater() view returns (address)",
  "function owner() view returns (address)",
]);

export const runtime = "nodejs";
export async function GET() {
  try {
    const client = createPublicClient({ chain: sepolia, transport: http(RPC_URL) });
    const [updater, owner] = await Promise.all([
      client.readContract({ address: CONSUMER, abi: ABI, functionName: "updater" }),
      client.readContract({ address: CONSUMER, abi: ABI, functionName: "owner" }),
    ]);
    return NextResponse.json({
      consumer: CONSUMER,
      updater,
      owner,
      updaterPkAddrPresent: Boolean(process.env.UPDATER_PRIVATE_KEY),
      rpcStartsWith: RPC_URL?.slice(0, 40),
      subgraphStartsWith: process.env.SUBGRAPH_AAVE?.slice(0, 80),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
