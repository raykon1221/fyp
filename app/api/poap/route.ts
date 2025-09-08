import { NextResponse } from "next/server";

const BASE = "https://api.poap.tech"; // adjust only if your spec says otherwise

export async function POST(req: Request) {
  try {
    const { addressOrEmail } = (await req.json()) as { addressOrEmail: string };
    if (!addressOrEmail) {
      return NextResponse.json({ error: "addressOrEmail required" }, { status: 400 });
    }

    const res = await fetch(`${BASE}/actions/scan/${encodeURIComponent(addressOrEmail)}`, {
      headers: {
        "Accept": "application/json",
        "X-API-Key": process.env.POAP_API_KEY ?? ""  // or "Authorization": `Bearer ${...}` if your key format requires it
      },
      cache: "no-store",
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ ok: false, status: res.status, body }, { status: res.status });
    }

    return NextResponse.json({ ok: true, data: body }, { status: 200 });
  } catch (err: any) {
    console.error("POAP route error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
