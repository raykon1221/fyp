import { createWalletClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import ScoreConsumer from "@/abis/ScoreConsumer.json"; // if no alias: "../../abis/ScoreConsumer.json"

const consumerAddr = process.env.SCORE_CONSUMER as `0x${string}`;
const rpc = process.env.SEPOLIA_RPC_URL!;
const pk = process.env.UPDATER_PRIVATE_KEY as `0x${string}`;

const account = privateKeyToAccount(pk);
const client = createWalletClient({ chain: sepolia, transport: http(rpc), account });

function to1e18(x: number) {
  const clamped = Math.max(0, Math.min(1, x));
  return parseUnits(clamped.toString(), 18);
}

export async function pushFactors(
  user: `0x${string}`,
  f: { repay01:number; diversity01:number; age01:number; activity01:number; risk01:number; social01:number }
) {
  const hash = await client.writeContract({
    address: consumerAddr,
    abi: (ScoreConsumer as any).abi,
    functionName: "updateFactors",
    args: [
      user,
      to1e18(f.repay01),
      to1e18(f.diversity01),
      to1e18(f.age01),
      to1e18(f.activity01),
      to1e18(f.risk01),
      to1e18(f.social01),
    ],
  });
  return hash;
}
