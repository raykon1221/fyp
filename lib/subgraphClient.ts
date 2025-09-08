// server/subgraphClient.ts
export async function postAaveSubgraph<T = any>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T> {
  const url = process.env.SUBGRAPH_AAVE!;
  const key = process.env.SUBGRAPH_API_KEY!;

  if (!url) throw new Error("SUBGRAPH_AAVE env missing");
  // API key may or may not be needed depending on endpoint you use
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (key) headers["x-api-key"] = key;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error("Aave subgraph: invalid JSON response");
  }

  if (json?.errors?.length) {
    throw new Error(`Aave subgraph errors: ${JSON.stringify(json.errors)}`);
  }
  return json?.data as T;
}
