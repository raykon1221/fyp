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

const scaleFactor = 1e18; // Scale factor for 1e18
export const runtime = "nodejs";

// Function to calculate factors and manual score
const calculateFactors = async (user: `0x${string}`) => {
  try {
    // Fetch all the factors
    const collateralDiversity = await getCollateralDiversity01(user);
    const walletActivity = await getWalletActivity01(user);
    const riskSafety = await getRiskSafety01(user);
    const repaymentHistory = await getRepaymentHistory01(user);
    const accountAge = await getAccountAge01(user);
    const socialProof = await getSocialProof01(user);

    // Log each factor for debugging
    console.log("Collateral Diversity:", collateralDiversity);
    console.log("Wallet Activity:", walletActivity);
    console.log("Risk Safety:", riskSafety);
    console.log("Repayment History:", repaymentHistory);
    console.log("Account Age:", accountAge);
    console.log("Social Proof:", socialProof);

    // Perform the manual score calculation (without scaling factors to integers)
    const factors = {
      repay01: collateralDiversity, 
      diversity01: walletActivity,
      age01: riskSafety,
      activity01: repaymentHistory,
      risk01: accountAge,
      social01: socialProof
    };

    const score = factors.repay01 * 3000 +
      factors.diversity01 * 2000 +
      factors.age01 * 1500 +
      factors.activity01 * 1000 +
      factors.risk01 * 1500 +
      factors.social01 * 1000;

    // Normalize the final score to fit between 0 and 1000
    const finalScore = score / 10000; // This should give you a score between 0 and 1000

    console.log("Calculated Final Score:", finalScore);

    return {
      collateralDiversity,
      walletActivity,
      riskSafety,
      repaymentHistory,
      accountAge,
      socialProof,
      finalScore, // Return the final score
    };

  } catch (error) {
    console.error("Error while fetching factors:", error);
    return { error: "Error fetching factors" };
  }
};

// In your route handler, calculate the factors and score
export async function POST(req: Request) {
  try {
    if (!RPC_URL || !CONSUMER || !UPDATER_PK) {
      return NextResponse.json({ error: "Missing server env" }, { status: 500 });
    }

    const { user } = await req.json().catch(() => ({}));
    if (!user || !/^0x[a-fA-F0-9]{40}$/.test(user)) {
      return NextResponse.json({ error: "Invalid user address" }, { status: 400 });
    }

    const u = getAddress(user);

    // Call the calculateFactors function to log and test the factors before pushing to the smart contract
    const factors = await calculateFactors(u); // This will log the factors and return the calculated final score

    let score = factors.finalScore ?? 0;

    // Normalize the score (multiply by 1000 to bring it back to the correct range)
    score = score * 1000;

    // Convert factors to the appropriate format for the smart contract
    const scaledFactors = {
      repay01: Math.round((factors.repaymentHistory ?? 0) * scaleFactor), // Fallback to 0 if undefined
      diversity01: Math.round((factors.collateralDiversity ?? 0) * scaleFactor),
      age01: Math.round((factors.accountAge ?? 0) * scaleFactor),
      activity01: Math.round((factors.walletActivity ?? 0) * scaleFactor),
      risk01: Math.round((factors.riskSafety ?? 0) * scaleFactor),
      social01: Math.round((factors.socialProof ?? 0) * scaleFactor),
    };

    // Your existing logic to interact with the smart contract and send data
    const client = createPublicClient({ chain: sepolia, transport: http(RPC_URL) });

    // Create the account from the updater private key
    const account = privateKeyToAccount(UPDATER_PK);

    const { request } = await client.simulateContract({
      address: CONSUMER,
      abi: CONSUMER_ABI,
      functionName: "updateFactors",
      args: [
        u,
        scaledFactors.repay01,
        scaledFactors.diversity01,
        scaledFactors.age01,
        scaledFactors.activity01,
        scaledFactors.risk01,
        scaledFactors.social01,
      ],
      account,
    });

    // Create the wallet client using the updater private key
    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http(RPC_URL),
    });

    const txHash = await walletClient.writeContract(request);

    return NextResponse.json({
      txHash,
      user: u,
      factors,
      score, // Send the normalized score back
    });

  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "read failed" }, { status: 500 });
  }
}
