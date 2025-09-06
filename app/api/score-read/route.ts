// app/api/score-read/route.ts
import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbi, getAddress } from "viem";
import { sepolia } from "viem/chains";

const RPC_URL = process.env.SEPOLIA_RPC_URL!;
const CONSUMER = process.env.SCORE_CONSUMER as `0x${string}`;

const CONSUMER_ABI = parseAbi([
  "function scoreOf(address user) view returns (uint256)",
  "function userFactors(address user) view returns (uint16,uint16,uint16,uint16,uint16,uint16,uint64)",
]);

export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    if (!RPC_URL || !CONSUMER) {
      return NextResponse.json({ error: "Missing server env" }, { status: 500 });
    }

    const { user } = await req.json().catch(() => ({}));
    if (!user || !/^0x[a-fA-F0-9]{40}$/.test(user)) {
      return NextResponse.json({ error: "Invalid user address" }, { status: 400 });
    }
    const u = getAddress(user);

    const client = createPublicClient({ chain: sepolia, transport: http(RPC_URL) });

    const score = await client.readContract({
      address: CONSUMER,
      abi: CONSUMER_ABI,
      functionName: "scoreOf",
      args: [u],
    });

    const factors = await client.readContract({
      address: CONSUMER,
      abi: CONSUMER_ABI,
      functionName: "userFactors",
      args: [u],
    }) as readonly [number, number, number, number, number, number, bigint];

    const res = {
      user: u,
      score: Number(score),
      factors: {
        repay01: String(factors[0]),
        diversity01: String(factors[1]),
        age01: String(factors[2]),
        activity01: String(factors[3]),
        risk01: String(factors[4]),
        social01: String(factors[5]),
      },
      lastUpdated: Number(factors[6]),
    };

    return NextResponse.json(res);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "read failed" }, { status: 500 });
  }
}
