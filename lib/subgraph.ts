// src/lib/subgraph.ts
export type RepayRow = {
  id: string;
  amount: string;
  timestamp: string;
  hash: string;
};

const SUBGRAPH_PROXY = process.env.NEXT_PUBLIC_SUBGRAPH_PROXY || "/api/subgraph";

export async function fetchRepaysByAccount(
  account: `0x${string}`,
  first = 50,
  skip = 0
): Promise<RepayRow[]> {
  const query = `
    query Repays($account: ID!, $first: Int, $skip: Int) {
      account(id: $account) {
        repays(orderBy: timestamp, orderDirection: desc, first: $first, skip: $skip) {
          id
          amount
          timestamp
          hash
        }
      }
    }`;

  const res = await fetch(SUBGRAPH_PROXY, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { account: account.toLowerCase(), first, skip },
    }),
  });

  // better error surfacing
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { /* not JSON */ }

  if (!res.ok) {
    throw new Error(`Subgraph proxy HTTP ${res.status}: ${text}`);
  }
  if (json?.errors) {
    throw new Error(`Subgraph errors: ${JSON.stringify(json.errors)}`);
  }
  return json?.data?.account?.repays ?? [];
}
