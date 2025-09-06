import { postAaveSubgraph } from "@/lib/subgraphClient";

/** Collateral diversity (0..1), capped at 5 unique collateral reserves */
export async function getCollateralDiversity01(user: `0x${string}`): Promise<number> {
  const lower = user.toLowerCase();

  // primary
  const q1 = `
    query CollateralDiversity($user: ID!) {
      userReserves(where: { user: $user, usageAsCollateralEnabledOnUser: true }) {
        reserve { id symbol }
        scaledATokenBalance
      }
    }`;

  // fallback via users(...) { userReserves { ... } }
  const q2 = `
    query CollateralDiversityViaUsers($user: ID!) {
      users(where: { id: $user }) {
        id
        userReserves(where: { usageAsCollateralEnabledOnUser: true }) {
          reserve { id symbol }
          scaledATokenBalance
        }
      }
    }`;

  let data: any;
  try {
    data = await postAaveSubgraph<any>(q1, { user: lower });
  } catch (e: any) {
    // if schema says no field userReserves at root
    if (String(e.message).includes("no field") || String(e.message).includes("Cannot query field")) {
      data = await postAaveSubgraph<any>(q2, { user: lower });
    } else {
      throw e;
    }
  }

  const reserves =
    data?.userReserves ??
    (Array.isArray(data?.users) ? data.users[0]?.userReserves ?? [] : []);

  const active = reserves.filter((r: any) => Number(r.scaledATokenBalance) > 0);
  const uniq = new Set(active.map((r: any) => r.reserve.id)).size;

  return Math.min(uniq / 5, 1);
}

/** Wallet activity last 90d (0..1): counts supplies/redeemUnderlyings/borrows/repays/liquidationCalls */
export async function getWalletActivity01(user: `0x${string}`): Promise<number> {
  const since = Math.floor(Date.now() / 1000) - 90 * 86400;
  const q = `
    query Activity90d($u: String!, $s: Int!) {
      supplies           (where:{ user:$u, timestamp_gte:$s }) { id }
      redeemUnderlyings  (where:{ user:$u, timestamp_gte:$s }) { id }
      borrows            (where:{ user:$u, timestamp_gte:$s }) { id }
      repays             (where:{ user:$u, timestamp_gte:$s }) { id }
      liquidationCalls   (where:{ user:$u, timestamp_gte:$s }) { id }
    }`;
  const d = await postAaveSubgraph<any>(q, { u: user.toLowerCase(), s: since });

  const total =
    (d?.supplies?.length || 0) +
    (d?.redeemUnderlyings?.length || 0) +
    (d?.borrows?.length || 0) +
    (d?.repays?.length || 0) +
    (d?.liquidationCalls?.length || 0);

  return Math.min(total / 60, 1);
}

/** Risk “safety” proxy (0..1): map CR 1x→0 to 2x+→1 using userReserves + reserve.priceInUsd if present */
export async function getRiskSafety01(user: `0x${string}`): Promise<number> {
  const lower = user.toLowerCase();

  const q1 = `
    query RiskExposure($user: ID!) {
      userReserves(where: { user: $user }) {
        reserve { decimals priceInUsd }
        scaledATokenBalance
        scaledVariableDebt
        principalStableDebt
        usageAsCollateralEnabledOnUser
      }
    }`;

  const q2 = `
    query RiskExposureViaUsers($user: ID!) {
      users(where: { id: $user }) {
        id
        userReserves {
          reserve { decimals priceInUsd }
          scaledATokenBalance
          scaledVariableDebt
          principalStableDebt
          usageAsCollateralEnabledOnUser
        }
      }
    }`;

  let d: any;
  try {
    d = await postAaveSubgraph<any>(q1, { user: lower });
  } catch (e: any) {
    if (String(e.message).includes("no field") || String(e.message).includes("Cannot query field")) {
      d = await postAaveSubgraph<any>(q2, { user: lower });
    } else {
      throw e;
    }
  }

  const urs =
    d?.userReserves ??
    (Array.isArray(d?.users) ? d.users[0]?.userReserves ?? [] : []);

  let collateralUsd = 0, debtUsd = 0;
  for (const u of urs) {
    const dec   = Number(u.reserve?.decimals ?? 18);
    const price = Number(u.reserve?.priceInUsd ?? 0);
    const aBal  = Number(u.scaledATokenBalance ?? 0) / 10 ** dec;
    const vDebt = Number(u.scaledVariableDebt ?? 0) / 10 ** dec;
    const sDebt = Number(u.principalStableDebt ?? 0) / 10 ** dec;

    if (u.usageAsCollateralEnabledOnUser && aBal > 0) {
      collateralUsd += aBal * price;
    }
    debtUsd += (vDebt + sDebt) * price;
  }

  if (collateralUsd <= 0 && debtUsd <= 0) return 0.7;
  if (collateralUsd <= 0 && debtUsd > 0)  return 0.0;

  const cr = collateralUsd / (debtUsd || 1e-9);
  return Math.max(0, Math.min((cr - 1.0) / 1.0, 1));
}

/** Repayment history factor (0..1), Aave-native uses user filter here */
export async function getRepaymentHistory01(user: `0x${string}`, first = 100): Promise<number> {
  const q = `
    query Repays($user: String!, $first: Int!) {
      repays(where:{ user:$user }, orderBy: timestamp, orderDirection: desc, first: $first) {
        amount
        timestamp
        txHash
      }
    }`;
  const d = await postAaveSubgraph<any>(q, { user: user.toLowerCase(), first });
  const repays = d?.repays ?? [];
  if (!repays.length) return 0;

  const now = Math.floor(Date.now() / 1000);
  let score = 0;
  for (const r of repays) {
    const ageDays = (now - Number(r.timestamp)) / 86400;
    const w = Math.exp(-ageDays / 30); // recent repays weigh more
    score += w;
  }
  return Math.min(score / 10, 1);
}
