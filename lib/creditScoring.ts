import { ethers } from "ethers";
import CreditScoring from "@abi/CreditScoring.json";

export const contractAddress = "0x9fc2659364f59B916898944aDB72B0E233Ca8Ad9";

export function getContract(providerOrSigner: any) {
  return new ethers.Contract(contractAddress, CreditScoring.abi, providerOrSigner);
}

export async function fetchCooldown(user: string, provider: ethers.BrowserProvider) {
  const contract = getContract(provider);
  const lastMintAt = await contract.lastMintAt(user);
  const mintCooldown = await contract.mintCooldown();

  const now = Math.floor(Date.now() / 1000);
  const nextMint = Number(lastMintAt) + Number(mintCooldown);
  const diff = nextMint - now;

  return diff > 0 ? diff : 0;
}
