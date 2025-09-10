"use client"; // This is required to enable React hooks in this component

import { useState, useMemo, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

async function refreshScore(user: `0x${string}`) {
  const r = await fetch("/api/score-refresh", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ user }),
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json.error || "refresh failed");
  return json.txHash as string;
}

async function readScore(user: `0x${string}`) {
  const r = await fetch("/api/score-read", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ user }),
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json.error || "read failed");
  return json as {
    user: `0x${string}`;
    score: number; // 0..1000
    factors: Record<string, string>;
    lastUpdated: number; // unix seconds
  };
}

export default function ScorePage() {
  const { address, isConnected } = useAccount();
  const [manual, setManual] = useState<string>("");
  const active = useMemo(
    () =>
      (manual && /^0x[a-fA-F0-9]{40}$/.test(manual)
        ? (manual as `0x${string}`)
        : (address as `0x${string}` | undefined)),
    [manual, address]
  );

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);       // while pushing / waiting
  const [err, setErr] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // initial read when address changes
  useEffect(() => {
    (async () => {
      setErr(null);
      setScore(null);
      setLastUpdated(null);
      if (!active) return;
      setLoading(true);
      try {
        const s = await readScore(active);
        setScore(s.score);
        setLastUpdated(s.lastUpdated);
      } catch (e: any) {
        setErr(e.message ?? "failed to read score");
      } finally {
        setLoading(false);
      }
    })();
  }, [active]);  // This will trigger when the active address changes

  async function onGetMyScore() {
    if (!active) return;
    setErr(null);
    setBusy(true);
    setTxHash(null);
    try {
      // 1) push factors on-chain via server (calls updateFactors)
      const h = await refreshScore(active);
      setTxHash(h);

      // 2) poll the score a few times while tx confirms
      const start = Date.now();
      let tries = 0;
      let updated = false;
      while (tries < 6) {
        await new Promise(r => setTimeout(r, 3000)); // 3s backoff
        const s = await readScore(active);
        // consider “updated” when lastUpdated > 0 and changed recently
        if (s.lastUpdated && s.lastUpdated * 1000 >= start - 10_000) {
          setScore(s.score);
          setLastUpdated(s.lastUpdated);
          updated = true;
          break;
        }
        tries++;
      }
      if (!updated) {
        // final read anyway
        const s = await readScore(active);
        setScore(s.score);
        setLastUpdated(s.lastUpdated);
      }
    } catch (e: any) {
      setErr(e.message ?? "get score failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Get your on-chain credit score</h1>
        <ConnectButton />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value.trim())}
          placeholder="Paste a wallet (optional) — defaults to connected wallet"
          spellCheck={false}
          style={{ flex: 1, padding: 8, border: "1px solid #ccc", borderRadius: 6, fontFamily: "monospace" }}
        />
        <button onClick={() => active && readScore(active).then(s => { setScore(s.score); setLastUpdated(s.lastUpdated); }).catch(e => setErr(e.message))} style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #ccc" }}>
          Load
        </button>
      </div>

      {!active && (
        <div style={{ marginBottom: 16 }}>
          Connect your wallet or paste an address above to continue.
        </div>
      )}

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>Error: {err}</div>}
      {loading && <div style={{ marginBottom: 12 }}>Loading current score…</div>}

      {active && !loading && (
        <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 16 }}>
          <div style={{ marginBottom: 8, fontFamily: "monospace" }}>Address: {active}</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
            {score !== null ? `${score} / 1000` : "—"}
          </div>
          <div style={{ color: "#666", marginBottom: 12 }}>
            Last updated: {lastUpdated ? new Date(lastUpdated * 1000).toLocaleString() : "—"}
          </div>

          <button
            onClick={onGetMyScore}
            disabled={busy || !active}
            style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #ccc", opacity: busy ? 0.6 : 1 }}
          >
            {busy ? "Calculating & pushing…" : "Get my score"}
          </button>

          {txHash && (
            <div style={{ marginTop: 10, fontFamily: "monospace" }}>
              Tx:{" "}
              <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
                {txHash}
              </a>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
