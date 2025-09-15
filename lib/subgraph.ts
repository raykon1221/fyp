// src/lib/subgraph.ts
export type RepayRow = {
  id: string;
  amount: string;
  timestamp: string;
  txHash: string;
  useATokens: boolean
};

export type BorrowRow = {
  id: string;
  amount: string;
  timestamp: string;
  txHash: string;
  borrowRate: string;
};

export type SupplyRow = {
  id: string;
  amount: string;
  timestamp: string;
  txHash: string;
};

const SUBGRAPH_PROXY =
  process.env.NEXT_PUBLIC_SUBGRAPH_PROXY || "/api/subgraph";

  async function fetchUserHistory<T>(
  account: `0x${string}`,
  query: string,
  field: "repayHistory" | "borrowHistory" | "supplyHistory",
  first = 50,
  skip = 0
): Promise<T[]> {
  const res = await fetch(SUBGRAPH_PROXY, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { user: account.toLowerCase(), first, skip },
    }),
  });

  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {}

  if (!res.ok) {
    throw new Error(`Subgraph proxy HTTP ${res.status}: ${text}`);
  }
  if (json?.errors) {
    throw new Error(`Subgraph errors: ${JSON.stringify(json.errors)}`);
  }

  // Always return plain array
  return json?.data?.user?.[field] ?? [];
}


export async function fetchRepaysByAccount(
  account: `0x${string}`,
  first = 50,
  skip = 0
): Promise<RepayRow[]> {
  const query = `
    query RepaysByUser($user: ID!, $first: Int, $skip: Int) {
      user(id: $user) {
        repayHistory(orderBy: timestamp, orderDirection: desc, first: $first, skip: $skip) {
          id
          amount
          timestamp
          txHash
          useATokens
        }
      }
    }`;

  const raw = await fetchUserHistory<any>(account, query, "repayHistory", first, skip);
  return raw.map((r: any) => ({
    id: r.id,
    amount: r.amount,
    timestamp: r.timestamp,
    txHash: r.txHash,
    useATokens: r.useATokens,
  }));
}

export async function fetchBorrowsByAccount(
  account: `0x${string}`,
  first = 50,
  skip = 0
): Promise<BorrowRow[]> {
  const query = `
    query BorrowsByUser($user: ID!, $first: Int, $skip: Int) {
      user(id: $user) {
        borrowHistory(orderBy: timestamp, orderDirection: desc, first: $first, skip: $skip) {
          id
          amount
          timestamp
          txHash
          borrowRate
        }
      }
    }`;

  const raw = await fetchUserHistory<any>(account, query, "borrowHistory", first, skip);
  return raw.map((r: any) => ({
    id: r.id,
    amount: r.amount,
    timestamp: r.timestamp,
    txHash: r.txHash,
    borrowRate: r.borrowRate,
  }));
}

export async function fetchSuppliesByAccount(
  account: `0x${string}`,
  first = 50,
  skip = 0
): Promise<SupplyRow[]> {
  const query = `
    query SuppliesByUser($user: ID!, $first: Int, $skip: Int) {
      user(id: $user) {
        supplyHistory(orderBy: timestamp, orderDirection: desc, first: $first, skip: $skip) {
          id
          amount
          timestamp
          txHash
        }
      }
    }`;

  const raw = await fetchUserHistory<any>(account, query, "supplyHistory", first, skip);
  return raw.map((r: any) => ({
    id: r.id,
    amount: r.amount,
    timestamp: r.timestamp,
    txHash: r.txHash,
  }));
}
