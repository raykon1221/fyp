export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = process.env.GRAPH_SUBGRAPH_URL; // gateway URL
    if (!url)
      return new Response(
        JSON.stringify({ error: "GRAPH_SUBGRAPH_URL missing" }),
        { status: 500 }
      );

    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    const apiKey = process.env.GRAPH_API_KEY; // add header if provided
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

    const r = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const text = await r.text();
    return new Response(text, {
      status: r.status,
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message ?? "proxy failed" }),
      { status: 500 }
    );
  }
}
