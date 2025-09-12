"use client";
import React from "react";

export function WalletInfo({
  address,
  ensName,
  isLoading,
  lastUpdated,
  txHash,
}: {
  address?: string;
  ensName?: string | null;
  isLoading: boolean;
  lastUpdated: number | null;
  txHash: string | null;
}) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-slate-400 text-sm mb-1">Wallet Address</div>
        <div className="font-mono text-slate-300">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not Connected"}
        </div>
      </div>
      <div>
        <div className="text-slate-400 text-sm mb-1">Ens Name</div>
        <div className="font-mono text-slate-300">
          {isLoading ? "…" : ensName ?? "Not Found"}
        </div>
      </div>
      <div>
        <div className="text-slate-400 text-sm mb-1">Last Updated</div>
        <div className="text-slate-300">
          {lastUpdated
            ? new Date(lastUpdated * 1000).toLocaleString()
            : "—"}
        </div>
      </div>
      {txHash && (
        <div>
          <div className="text-slate-400 text-sm mb-1">Transaction:</div>
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline break-all"
          >
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </a>
        </div>
      )}
    </div>
  );
}
