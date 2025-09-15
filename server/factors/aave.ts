import { postAaveSubgraph } from "@lib/subgraphClient";
import { ethers } from "ethers";
import { getNftDiversity01 } from "@/server/factors/nft";

// Lowercase address helper
const lower = (s: string) => s.toLowerCase();

/** 20% — Collateral diversity (0..1): number of distinct reserves used as collateral, capped at 5. */
export async function getCollateralDiversity01(
  user: `0x${string}`
): Promise<number> {
  const q = `
    query($u:String!){
      userReserves(where:{ user:$u }) {
        usageAsCollateralEnabledOnUser
        scaledATokenBalance
        reserve { id }
      }
    }`;
  const d: any = await postAaveSubgraph(q, { u: lower(user) });
  const rows = Array.isArray(d?.userReserves) ? d.userReserves : [];
  const active = rows.filter(
    (r: any) =>
      r?.usageAsCollateralEnabledOnUser &&
      Number(r?.scaledATokenBalance ?? 0) > 0
  );
  const uniq = new Set(active.map((r: any) => r?.reserve?.id)).size;
  return Math.min(uniq / 5, 1);
}

/** 10% — Wallet activity (0..1): activity in the last 90d using userTransactions if available, else bucketed entities. */
export async function getWalletActivity01(
  user: `0x${string}`
): Promise<number> {
  const since = Math.floor(Date.now() / 1000) - 90 * 86400;

  // Preferred: userTransactions
  const qTx = `
    query($u:String!,$s:Int!){
      userTransactions(where:{ user:$u, timestamp_gte:$s }, first: 1000){ id }
    }`;

  try {
    const d: any = await postAaveSubgraph(qTx, { u: lower(user), s: since });
    const n = Array.isArray(d?.userTransactions)
      ? d.userTransactions.length
      : 0;
    return Math.min(n / 60, 1);
  } catch {
    // Fallback: count across known event types the schema exposes
    const qBuckets = `
      query($u:String!,$s:Int!){
        borrows(where:{ user:$u, timestamp_gte:$s }){ id }
        repays(where:{ user:$u, timestamp_gte:$s }){ id }
        supply(where:{ user:$u, timestamp_gte:$s }){ id }
        redeemUnderlyings(where:{ user:$u, timestamp_gte:$s }){ id }
        liquidationCalls(where:{ user:$u, timestamp_gte:$s }){ id }
        flashLoans(where:{ user:$u, timestamp_gte:$s }){ id }
      }`;

    const b: any = await postAaveSubgraph(qBuckets, {
      u: lower(user),
      s: since,
    });
    const total =
      (b?.borrows?.length || 0) +
      (b?.repays?.length || 0) +
      (b?.supply?.length || 0) +
      (b?.redeemUnderlyings?.length || 0) +
      (b?.liquidationCalls?.length || 0) +
      (b?.flashLoans?.length || 0);

    return Math.min(total / 60, 1);
  }
}

/** 15% — Risk “safety” (0..1): price-free proxy using token balances and debt in *token units*. */
export async function getRiskSafety01(user: `0x${string}`): Promise<number> {
  const q = `
    query($u:String!){
      userReserves(where:{ user:$u }) {
        reserve { decimals }
        scaledATokenBalance
        scaledVariableDebt
        principalStableDebt
        usageAsCollateralEnabledOnUser
      }
    }`;
  const d: any = await postAaveSubgraph(q, { u: lower(user) });
  const rows = Array.isArray(d?.userReserves) ? d.userReserves : [];

  let totalDebt = 0;
  let weightedSafety = 0;

  for (const it of rows) {
    const dec = Number(it?.reserve?.decimals ?? 18); // Use decimals, not priceInUsd
    const a = Number(it?.scaledATokenBalance ?? 0) / 10 ** dec;
    const vd = Number(it?.scaledVariableDebt ?? 0) / 10 ** dec;
    const sd = Number(it?.principalStableDebt ?? 0) / 10 ** dec;
    const debt = vd + sd;

    const collateral = it?.usageAsCollateralEnabledOnUser && a > 0 ? a : 0;
    const safetyRatio = collateral / (debt + 1e-9);

    totalDebt += debt;
    weightedSafety += debt * safetyRatio;
  }

  if (totalDebt <= 0) {
    // No debt → reasonably safe. Boost if they actually hold collateral.
    const hasCol = rows.some((it: any) => {
      const dec = Number(it?.reserve?.decimals ?? 18);
      const a = Number(it?.scaledATokenBalance ?? 0) / 10 ** dec;
      return it?.usageAsCollateralEnabledOnUser && a > 0;
    });
    return hasCol ? 0.85 : 0.7;
  }

  const avgSafety = weightedSafety / totalDebt; // ≈ avg(collateral/debt) in token units
  const mapped = Math.max(0, Math.min((avgSafety - 1.0) / 1.0, 1.0)); // 1x→0, 2x+→1
  return mapped;
}

/** 30% — Repayment history (0..1): recent, frequent repayments score higher. Supports user/account. */
export async function getRepaymentHistory01(
  user: `0x${string}`,
  first = 200
): Promise<number> {
  const u = lower(user);

  const qA = `
    query($u:String!,$first:Int!){
      repays(where:{ user:$u }, orderBy: timestamp, orderDirection: desc, first: $first){ timestamp }
    }`;

  const qB = `
    query($u:String!,$first:Int!){
      repays(where:{ user:$u }, orderBy: timestamp, orderDirection: desc, first: $first){ timestamp }
    }`;

  let list: any[] = [];
  try {
    const a: any = await postAaveSubgraph(qA, { u, first });
    list = a?.repays ?? [];
    if (!list.length) {
      const b: any = await postAaveSubgraph(qB, { u, first });
      list = b?.repays ?? [];
    }
  } catch {
    const b: any = await postAaveSubgraph(qB, { u, first });
    list = b?.repays ?? [];
  }

  if (!list.length) return 0;

  // Exponential decay: last 30 days weigh the most
  const now = Math.floor(Date.now() / 1000);
  let s = 0;
  for (const r of list) {
    const ts = Number(r?.timestamp ?? 0);
    if (!ts) continue;
    const ageDays = (now - ts) / 86400;
    s += Math.exp(-ageDays / 30);
  }

  return Math.min(s / 10, 1);
}

/** 15% — Account age proxy (0..1): use earliest userTransaction; fallback to activity. */
export async function getAccountAge01(user: `0x${string}`): Promise<number> {
  const q = `
    query($u:String!){
      userTransactions(where:{ user:$u }, orderBy: timestamp, orderDirection: asc, first: 1) {
        timestamp
      }
    }`;
  try {
    const d: any = await postAaveSubgraph(q, { u: lower(user) });
    const ts = Number(d?.userTransactions?.[0]?.timestamp ?? 0);
    if (!ts) return 0.5; // unknown → middle
    const ageDays = (Math.floor(Date.now() / 1000) - ts) / 86400;
    // Map 0d → 0.2, 365d+ → 1.0
    return Math.max(0.2, Math.min(0.2 + ageDays / 365, 1.0));
  } catch {
    // Fallback: correlate with recent activity
    const act = await getWalletActivity01(user);
    return Math.min(0.2 + 0.8 * act, 1);
  }
}

export async function getSocialProof01(
  user: `0x${string}`,
  opts?: { ens?: string; nfts?: any[]; poaps?: any[] }
): Promise<number> {
  let score = 0;

  // === ENS ===
  try {
    let ens = opts?.ens;
    if (!ens && process.env.ALCHEMY_RPC_MAINNET) {
      const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_MAINNET);
      const lookup = await provider.lookupAddress(user);
      ens = lookup ?? undefined;
    }
    if (ens) score += 0.3;
  } catch (e) {
    console.warn("ENS fetch skipped:", e);
  }

  // === POAPs ===
  try {
    let poaps = opts?.poaps;
    if (!poaps && process.env.NEXT_PUBLIC_BASE_URL) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/poap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressOrEmail: user }),
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.ok) poaps = json.data;
      }
    }
    if (poaps?.length) {
      score += Math.min((poaps.length / 10) * 0.4, 0.4); // cap at 0.4
    }
  } catch (e) {
    console.warn("POAP fetch skipped:", e);
  }

  // === NFTs ===
  try {
    if (opts?.nfts?.length) {
      const uniqContracts = new Set(
        opts.nfts.map((n) => n?.contract?.address?.toLowerCase())
      ).size;
      score += Math.min((uniqContracts / 5) * 0.3, 0.3);
    } else {
      const nftDiversity = await getNftDiversity01(user);
      score += nftDiversity * 0.3;
    }
  } catch (e) {
    console.warn("NFT diversity fetch skipped:", e);
  }

  return Math.min(score, 1);
}
