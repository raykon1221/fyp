// app/api/score-refresh/route.ts
import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, parseAbi, getAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

// ---- env ----
const RPC_URL       = process.env.SEPOLIA_RPC_URL!;
const CONSUMER      = process.env.SCORE_CONSUMER as `0x${string}`;
const UPDATER_PK    = process.env.UPDATER_PRIVATE_KEY as `0x${string}`;

// Replace with your real ABI import if you have it
const CONSUMER_ABI = parseAbi([
  "function updateFactors(address user,uint16,uint16,uint16,uint16,uint16,uint16) external",
  "function updater() view returns (address)",
]);

// TODO: import your real factor functions here
async function getRepaymentHistory01(u: `0x${string}`){ return 0.2; }
async function getCollateralDiversity01(u: `0x${string}`){ return 0.3; }
async function getAccountAge01(u: `0x${string}`){ return 0.4; }
async function getWalletActivity01(u: `0x${string}`){ return 0.1; }
async function getRiskSafety01(u: `0x${string}`){ return 0.6; }
async function getSocialProof01(u: `0x${string}`){ return 0.05; }

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!RPC_URL || !CONSUMER || !UPDATER_PK) {
      return NextResponse.json(
        { error: "Missing server env (SEPOLIA_RPC_URL / SCORE_CONSUMER / UPDATER_PRIVATE_KEY)" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({} as any));
    const user = body?.user as string;
    if (!user || !/^0x[0-9a-fA-F]{40}$/.test(user)) {
      return NextResponse.json({ error: "Invalid user address" }, { status: 400 });
    }
    const u = getAddress(user);

    // 1) compute factors
    const [repay, diversity, age, activity, risk, social] = await Promise.all([
      getRepaymentHistory01(u),
      getCollateralDiversity01(u),
      getAccountAge01(u),
      getWalletActivity01(u),
      getRiskSafety01(u),
      getSocialProof01(u),
    ]);

    const toBP = (x: number) => Math.max(0, Math.min(Math.round(x * 10000), 10000));

    // 2) prepare clients
    const account = privateKeyToAccount(UPDATER_PK);
    const publicClient = createPublicClient({ chain: sepolia, transport: http(RPC_URL) });
    const walletClient = createWalletClient({ chain: sepolia, transport: http(RPC_URL), account });

    // Sanity: confirm the updater set on-chain
    const onchainUpdater = await publicClient.readContract({
      address: CONSUMER,
      abi: CONSUMER_ABI,
      functionName: "updater",
    });

    // helpful info in the response
    const meta = {
      user: u,
      updaterPkAddr: account.address,
      onchainUpdater,
      rpc: RPC_URL.slice(0, 40) + "...",
      consumer: CONSUMER,
      factors01: { repay, diversity, age, activity, risk, social },
      factorsBP: {
        repay: toBP(repay), diversity: toBP(diversity), age: toBP(age),
        activity: toBP(activity), risk: toBP(risk), social: toBP(social)
      }
    };

    if (onchainUpdater.toLowerCase() !== account.address.toLowerCase()) {
      return NextResponse.json(
        { error: "Updater mismatch. Set the contract updater to your signer.", meta },
        { status: 403 }
      );
    }

    // 3) simulate and send
    const { request } = await publicClient.simulateContract({
      address: CONSUMER,
      abi: CONSUMER_ABI,
      functionName: "updateFactors",
      args: [
        u,
        toBP(repay),
        toBP(diversity),
        toBP(age),
        toBP(activity),
        toBP(risk),
        toBP(social),
      ],
      account,
    });

    const txHash = await walletClient.writeContract(request);
    return NextResponse.json({ txHash, meta });
  } catch (e: any) {
    // surface full message (temporarily)
    return NextResponse.json(
      { error: e?.shortMessage || e?.message || String(e) },
      { status: 500 }
    );
  }
}
