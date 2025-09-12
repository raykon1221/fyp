"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";

export function MintCard({ mintedNFT, score, cooldownLeft, handleMintScore, address }: any) {
  const [metadata, setMetadata] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch metadata JSON if mintedNFT exists
  useEffect(() => {
    if (mintedNFT?.uri) {
      const url = mintedNFT.uri.replace("ipfs://", "https://ipfs.io/ipfs/");
      fetch(url)
        .then((res) => res.json())
        .then((data) => setMetadata(data))
        .catch((err) => console.error("Error fetching metadata:", err));
    }
  }, [mintedNFT]);

  const confirmMint = async () => {
    setShowModal(false);
    await handleMintScore();
  };

  return (
    <>
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-200">Soulbound Token</h3>

            {mintedNFT && (
              <div className="flex flex-col items-center">
                <Image
                  src={mintedNFT.image}
                  alt="Minted NFT"
                  width={120}
                  height={120}
                  className="rounded-lg border border-slate-700"
                />
                <div className="mt-2 text-md font-bold">Score: {score}</div>
                {metadata && (
                  <div className="text-sm text-slate-400 mt-1 text-center">
                    {metadata.description}
                  </div>
                )}
              </div>
            )}

            <div className="text-slate-400 text-md mt-2">
              {cooldownLeft && cooldownLeft > 0 ? (
                <span className="text-red-400">
                  ⏳ Wait {formatTime(cooldownLeft)} before minting again
                </span>
              ) : (
                <span className="text-green-400">You can mint now</span>
              )}
            </div>

            {metadata && metadata.attributes && (
              <div className="mt-2 space-y-1">
                {metadata.attributes.map((attr: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between text-xs text-slate-400"
                  >
                    <span>{attr.trait_type}</span>
                    <span className="font-semibold text-slate-200">
                      {attr.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 mt-3"
              onClick={() => setShowModal(true)}
              disabled={cooldownLeft && cooldownLeft > 0}
            >
              Mint Score
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 w-[600px] max-w-2xl text-center shadow-xl">
            <h2 className="text-2xl font-bold text-slate-200 mb-6">
              Confirm Minting
            </h2>
            <p className="text-slate-400 mb-4 text-lg">
              You are about to mint your score NFT with the wallet:
            </p>
            <p className="font-mono text-md text-slate-300 mb-8 break-all">
              {address ? `${address}` : ""}
            </p>
            <div className="flex justify-between gap-6">
              <Button
                className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 text-lg"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-lg"
                onClick={confirmMint}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function formatTime(seconds: number) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${seconds % 60}s`;
}
