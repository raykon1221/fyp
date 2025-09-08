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

export async function fetchRepaysByAccount(
  account: `0x${string}`,
  first = 50,
  skip = 0
): Promise<RepayRow[]> {
  const query = `
    query RepaysByUser($user: ID!, $first: Int, $skip: Int) {
      user(id: $user) {
        id
        repayHistory(
          orderBy: timestamp
          orderDirection: desc
          first: $first
          skip: $skip
        ) {
          id
          amount
          timestamp
          txHash
          useATokens
        }
      }
    }`;

  const res = await fetch(SUBGRAPH_PROXY, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { user: account.toLowerCase(), first, skip },
    }),
  });

  // better error surfacing
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    /* not JSON */
  }

  if (!res.ok) {
    throw new Error(`Subgraph proxy HTTP ${res.status}: ${text}`);
  }
  if (json?.errors) {
    throw new Error(`Subgraph errors: ${JSON.stringify(json.errors)}`);
  }
  return json?.data?.user?.repayHistory ?? [];
}

export async function fetchBorrowsByAccount(
  account: `0x${string}`,
  first = 50,
  skip = 0
): Promise<BorrowRow[]> {
  const query = `
    query BorrowsByUser($user: ID!, $first: Int, $skip: Int) {
      user(id: $user) {
        id
        borrowHistory(
          orderBy: timestamp
          orderDirection: desc
          first: $first
          skip: $skip
        ) {
          id
          amount
          timestamp
          txHash
          borrowRate
        }
      }
    }`;

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
  return json?.data?.user?.borrowHistory ?? [];
}

export async function fetchSuppliesByAccount(
  account: `0x${string}`,
  first = 50,
  skip = 0
): Promise<SupplyRow[]> {
  const query = `
    query SuppliesByUser($user: ID!, $first: Int, $skip: Int) {
      user(id: $user) {
        id
        supplyHistory(
          orderBy: timestamp
          orderDirection: desc
          first: $first
          skip: $skip
        ) {
          id
          amount
          timestamp
          txHash
        }
      }
    }`;

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
  return json?.data?.user?.supplyHistory ?? [];
}
