import { NextResponse } from "next/server";
import { ethers } from "ethers";

const contractAddress = "0x9fc2659364f59B916898944aDB72B0E233Ca8Ad9"; 
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

export async function POST(req: Request) {
  try {
    const { user, score, uri } = await req.json();

    if (!process.env.SIGNER_PRIVATE_KEY || !process.env.SEPOLIA_RPC_URL) {
      throw new Error("Missing env vars");
    }

    const signer = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY, provider);

    const domain = {
      name: "CreditScoring",
      version: "1",
      chainId: 11155111, // Sepolia
      verifyingContract: contractAddress,
    };

    const types = {
      ScoreAttestation: [
        { name: "user", type: "address" },
        { name: "score", type: "uint256" },
        { name: "uri", type: "string" },
        { name: "expiry", type: "uint256" },
      ],
    };

    const value = {
      user,
      score,
      uri,
      expiry: Math.floor(Date.now() / 1000) + 86400, // 24h expiry
    };

    const signature = await signer.signTypedData(domain, types, value);

    return NextResponse.json({ ...value, signature });
  } catch (err: any) {
    console.error("Error generating attestation:", err);
    return NextResponse.json({ error: err.message || "Failed to sign score" }, { status: 500 });
  }
}
