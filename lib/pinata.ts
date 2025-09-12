export async function uploadToPinata(metadata: any, score: number, getBadgeImage: (s: number) => string) {
  const enrichedMetadata = {
    ...metadata,
    image: getBadgeImage(score),
  };

  const res = await fetch("/api/pinata-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ metadata: enrichedMetadata }),
  });

  if (!res.ok) throw new Error("Failed to upload to Pinata");
  const { metadataURI } = await res.json();
  return metadataURI;
}
