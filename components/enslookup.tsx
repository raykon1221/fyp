"use client";

import * as React from "react";
import { useAccount, useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSocialProof01 } from "@/server/factors/aave";

export default function EnsLookup() {
  const { address: connectedAddress, isConnected } = useAccount();

  // state for manual lookup
  const [inputAddress, setInputAddress] = React.useState("");
  const [manualAddress, setManualAddress] = React.useState<string | undefined>();
  const [socialScore, setSocialScore] = React.useState<number | null>(null);
  const [manualScore, setManualScore] = React.useState<number | null>(null);

  // hook for connected wallet ENS
  const { data: ensForConnected, isLoading: loadingConnected } = useEnsName({
    address: connectedAddress,
    chainId: mainnet.id,
  });

  // hook for manual ENS lookup
  const { data: ensForManual, isLoading: loadingManual } = useEnsName({
    address: manualAddress as `0x${string}` | undefined,
    chainId: mainnet.id,
  });

  // fetch score when ENS changes
  React.useEffect(() => {
    async function fetchScore() {
      if (connectedAddress) {
        const score = await getSocialProof01(connectedAddress as `0x${string}`, {
          ens: ensForConnected ?? undefined,
        });
        setSocialScore(score);
      }
    }
    fetchScore();
  }, [connectedAddress, ensForConnected]);

  // fetch score for manual lookup ENS
  React.useEffect(() => {
    async function fetchManualScore() {
      if (manualAddress) {
        const score = await getSocialProof01(manualAddress as `0x${string}`, {
          ens: ensForManual ?? undefined,
        });
        setManualScore(score);
      }
    }
    fetchManualScore();
  }, [manualAddress, ensForManual]);

  const handleLookup = () => {
    if (inputAddress) {
      setManualAddress(inputAddress as `0x${string}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connected wallet ENS */}
      <div className="p-4 border rounded-lg bg-slate-900 border-slate-700">
        <h2 className="text-white font-semibold text-lg mb-2">Connected Wallet ENS</h2>
        {!isConnected ? (
          <p className="text-white">No wallet connected</p>
        ) : loadingConnected ? (
          <p className="text-white">Loading…</p>
        ) : (
          <p className="text-white">
            {ensForConnected
              ? `ENS: ${ensForConnected}`
              : `No primary ENS set. Address: ${connectedAddress}`}
          </p>
        )}
        {socialScore !== null && (
          <p className="text-cyan-400">
            Social Proof Score: {(socialScore * 100).toFixed(0)} / 100
          </p>
        )}
      </div>

      {/* Manual lookup */}
      <div className="p-4 border rounded-lg bg-slate-900 border-slate-700">
        <h2 className="text-white font-semibold text-lg mb-2">Lookup by Address</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Paste an Ethereum address"
            value={inputAddress}
            onChange={(e) => setInputAddress(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white"
          />
          <Button
            onClick={handleLookup}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            Lookup
          </Button>
        </div>

        <div className="mt-3 text-sm">
          {loadingManual ? (
            <p className="text-white">Loading…</p>
          ) : manualAddress ? (
            ensForManual ? (
              <p className="text-white">ENS: {ensForManual}</p>
            ) : (
              <p className="text-white">No primary ENS found for {manualAddress}</p>
            )
          ) : (
            <p className="text-white">Enter an address to check.</p>
          )}
          {manualScore !== null && (
            <p className="text-cyan-400 mt-2">
              Social Proof Score: {(manualScore * 100).toFixed(0)} / 100
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
