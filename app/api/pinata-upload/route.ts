import { NextResponse } from "next/server";
import PinataClient from "@pinata/sdk";

const pinata = new PinataClient({
  pinataApiKey: process.env.PINATA_API_KEY!,
  pinataSecretApiKey: process.env.PINATA_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { metadata } = await req.json();

    // Pin the metadata JSON to IPFS
    const result = await pinata.pinJSONToIPFS(metadata);
    const metadataURI = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

    return NextResponse.json({ metadataURI });
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    return NextResponse.json(
      { error: "Failed to upload to Pinata" },
      { status: 500 }
    );
  }
}
