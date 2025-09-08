"use client";

import { useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import BorrowsTable from "@/components/borrowtable";
import { fetchBorrowsByAccount } from "@/lib/subgraph";

const isHexAddress = (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v);

export default function BorrowsPage() {
  const { address: connected, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeAddress = useMemo(() => {
    const m = manualAddress.trim();
    if (m && isHexAddress(m)) return m as `0x${string}`;
    if (isConnected && connected) return connected as `0x${string}`;
    return "" as `0x${string}`;
  }, [manualAddress, isConnected, connected]);

  async function load() {
    if (!activeAddress) {
      setRows([]);
      setErr(
        isConnected
          ? "Enter a valid 0x address, or keep input empty to use your wallet."
          : "Connect your wallet or paste a valid 0x address."
      );
      return;
    }
    try {
      setLoading(true);
      setErr(null);
      const data = await fetchBorrowsByAccount(
        activeAddress,
        pageSize,
        page * pageSize
      );
      setRows(data);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (mounted && activeAddress) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, activeAddress, page]);

  useEffect(() => {
    setPage(0);
  }, [manualAddress]);

  if (!mounted) {
    return <main style={{ padding: 24 }}>Loading…</main>;
  }

  const manualValid = manualAddress === "" || isHexAddress(manualAddress);

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Borrows</h1>
        <ConnectButton />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={manualAddress}
          onChange={(e) => setManualAddress(e.target.value)}
          placeholder="Paste a wallet address (leave empty to use connected)"
          spellCheck={false}
          style={{
            flex: 1,
            padding: 8,
            border: "1px solid #ccc",
            borderRadius: 6,
            fontFamily: "monospace",
          }}
        />
        <button
          onClick={load}
          style={{
            padding: "8px 14px",
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        >
          Load
        </button>
      </div>

      {!manualValid && (
        <div style={{ color: "crimson", marginBottom: 8 }}>
          Invalid address. Must be a 42-char 0x… string.
        </div>
      )}

      {!isConnected && !manualAddress && (
        <div style={{ marginBottom: 12 }}>
          Connect your wallet or paste an address to view borrow history.
        </div>
      )}

      {err && (
        <div style={{ color: "crimson", marginBottom: 12 }}>Error: {err}</div>
      )}
      {loading && <div style={{ marginBottom: 12 }}>Loading…</div>}
      {!loading && !err && <BorrowsTable rows={rows} tokenDecimals={18} />}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        >
          ◀ Prev
        </button>
        <div style={{ alignSelf: "center" }}>Page {page + 1}</div>
        <button
          onClick={() => setPage((p) => p + 1)}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        >
          Next ▶
        </button>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "#555" }}>
        Active address: {activeAddress || "(none)"}{" "}
        {manualAddress ? "(manual)" : isConnected ? "(connected)" : ""}
      </div>
    </main>
  );
}
