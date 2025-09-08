// app/api/score-refresh/route.ts
import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, getAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import ScoreConsumer from "@abi/ScoreConsumer.json";
import type { Abi } from "viem";

import {
  getRepaymentHistory01,
  getCollateralDiversity01,
  getAccountAge01,
  getWalletActivity01,
  getRiskSafety01,
  getSocialProof01,
} from "@/server/factors/aave";

const RPC_URL = process.env.SEPOLIA_RPC_URL!;
const CONSUMER = process.env.SCORE_CONSUMER as `0x${string}`;
const UPDATER_PK = process.env.UPDATER_PRIVATE_KEY as `0x${string}`;
const CONSUMER_ABI = ScoreConsumer.abi as Abi;
const toBP = (x: number) =>
  Math.max(0, Math.min(Math.round(x * 10_000), 10_000));

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!RPC_URL || !CONSUMER || !UPDATER_PK) {
      return NextResponse.json({ error: "Missing envs" }, { status: 500 });
    }

    const { user: rawUser, demo } = await req.json().catch(() => ({}));
    if (!rawUser || !/^0x[0-9a-fA-F]{40}$/.test(rawUser)) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }
    const user = getAddress(rawUser);

    // factors in 0..1
    let repay01: number,
      diversity01: number,
      age01: number,
      activity01: number,
      risk01: number,
      social01: number;
    if (demo) {
      repay01 = diversity01 = age01 = activity01 = risk01 = social01 = 0.5;
    } else {
      [repay01, diversity01, age01, activity01, risk01, social01] =
        await Promise.all([
          getRepaymentHistory01(user),
          getCollateralDiversity01(user),
          getAccountAge01(user),
          getWalletActivity01(user),
          getRiskSafety01(user),
          getSocialProof01(user),
        ]);
    }

    // validate 0..1
    const factors01 = {
      repay01,
      diversity01,
      age01,
      activity01,
      risk01,
      social01,
    };
    for (const [k, v] of Object.entries(factors01)) {
      if (!Number.isFinite(v) || v < 0 || v > 1) {
        return NextResponse.json(
          { error: `Factor ${k} invalid: ${v}` },
          { status: 400 }
        );
      }
    }

    // basis points
    const bp = {
      repay: toBP(repay01),
      diversity: toBP(diversity01),
      age: toBP(age01),
      activity: toBP(activity01),
      risk: toBP(risk01),
      social: toBP(social01),
    };

    // clients
    const account = privateKeyToAccount(UPDATER_PK);
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(RPC_URL),
    });
    const walletClient = createWalletClient({
      chain: sepolia,
      transport: http(RPC_URL),
      account,
    });

    // simulate + send + wait
    const { request } = await publicClient.simulateContract({
      address: CONSUMER,
      abi: CONSUMER_ABI,
      functionName: "updateFactors",
      args: [
        user,
        bp.repay,
        bp.diversity,
        bp.age,
        bp.activity,
        bp.risk,
        bp.social,
      ],
      account,
    });
    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return NextResponse.json({
      txHash: hash,
      minedInBlock: Number(receipt.blockNumber),
      user,
      factors01, // 👈 helpful debug
      bp, // 👈 helpful debug
      updater: account.address,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.shortMessage || e?.message || String(e) },
      { status: 500 }
    );
  }
}
