// lib/subgraphClient.ts
export async function postAaveSubgraph<T>(
  query: string,
  variables: any
): Promise<T> {
  const url = process.env.SUBGRAPH_AAVE!;
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  // If you’re using The Graph *Gateway* (Studio), you normally put the key in the URL path,
  // but if you keep it separate, also send as Authorization: Bearer ...
  if (process.env.GRAPH_API_KEY && !url.includes(process.env.GRAPH_API_KEY)) {
    headers.Authorization = `Bearer ${process.env.GRAPH_API_KEY}`;
  }

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const text = await resp.text(); // read raw text to debug failures
  if (!resp.ok) {
    throw new Error(`Aave subgraph HTTP ${resp.status}: ${text.slice(0, 500)}`);
  }

  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Aave subgraph JSON parse failed: ${text.slice(0, 500)}`);
  }

  if (json.errors?.length) {
    throw new Error(`Aave subgraph errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}
