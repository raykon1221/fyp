import { NextResponse } from "next/server";
import { fetchNftsForOwner } from "@/server/factors/nft";

export async function POST(req: Request) {
  try {
    const { address, pageKey, network } = (await req.json()) as {
      address: string; pageKey?: string; network?: string;
    };

    if (!address) {
      return NextResponse.json({ ok: false, error: "address required" }, { status: 400 });
    }
    if (!network) {
      return NextResponse.json({ ok: false, error: "network required" }, { status: 400 });
    }

    const res = await fetchNftsForOwner(address, network as any, pageKey);
    return NextResponse.json({ ok: true, data: res }, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}

