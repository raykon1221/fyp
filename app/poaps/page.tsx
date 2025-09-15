"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Copy,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  Filter,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { getSocialProof01 } from "@/server/factors/aave";

type PoapItem = {
  event?: {
    id?: number;
    name?: string;
    fancy_id?: string;
    image_url?: string;
    start_date?: string;
    end_date?: string;
    year?: number;
    city?: string;
    country?: string;
  };
  tokenId?: string;
  owner?: string;
  created?: string;
};

function shorten(addr?: string, head = 6, tail = 4) {
  if (!addr) return "";
  if (addr.length <= head + tail) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export default function PoapPage() {
  const { address, isConnected } = useAccount();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [poaps, setPoaps] = React.useState<PoapItem[]>([]);
  const [poapScore, setPoapScore] = React.useState<number | null>(null);

  // Modes: wallet (default), email, manual
  const [mode, setMode] = React.useState<"wallet" | "email" | "manual">(
    "wallet"
  );
  const [email, setEmail] = React.useState("");
  const [manualWallet, setManualWallet] = React.useState("");

  // Filters
  const [query, setQuery] = React.useState("");
  const [year, setYear] = React.useState<string>("all");
  const [sort, setSort] = React.useState<"new" | "old">("new");

  const addressOrEmail =
    mode === "email"
      ? email.trim()
      : mode === "manual"
      ? manualWallet.trim()
      : address;

  const fetchPoaps = React.useCallback(async () => {
    if (!addressOrEmail) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/poap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressOrEmail }),
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error ?? `HTTP ${res.status}`);
      }
      setPoaps(Array.isArray(json.data) ? json.data : []);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
      setPoaps([]);
    } finally {
      setLoading(false);
    }
  }, [addressOrEmail]);

  // whenever poaps change, recompute score
React.useEffect(() => {
  async function calcScore() {
    if (poaps.length > 0 && addressOrEmail) {
      const score = await getSocialProof01(addressOrEmail as `0x${string}`, {
        poaps,
      });
      setPoapScore(score);
    } else {
      setPoapScore(null);
    }
  }
  calcScore();
}, [poaps, addressOrEmail]);

  // 🔹 Auto-fetch for connected wallet (default mode)
  React.useEffect(() => {
    if (isConnected && mode === "wallet" && address) {
      fetchPoaps();
    }
  }, [isConnected, mode, address, fetchPoaps]);

  const copyAddr = async () => {
    if (!addressOrEmail) return;
    await navigator.clipboard.writeText(addressOrEmail);
  };

  // derive distinct years
  const years = React.useMemo(() => {
    const yearArr: number[] = [];

    poaps.forEach((p) => {
      const y =
        p.event?.year ??
        (p.event?.start_date
          ? parseInt(
              (p.event.start_date.split("-").pop() || "").replace(/\D/g, ""),
              10
            )
          : undefined);

      if (y && !Number.isNaN(y) && !yearArr.includes(y)) {
        yearArr.push(y);
      }
    });

    return yearArr.sort((a, b) => b - a);
  }, [poaps]);

  // filter + sort
  const filtered = React.useMemo(() => {
    let arr = [...poaps];

    if (query) {
      const q = query.toLowerCase();
      arr = arr.filter((p) => {
        const ev = p.event;
        return (
          ev?.name?.toLowerCase().includes(q) ||
          ev?.fancy_id?.toLowerCase().includes(q) ||
          ev?.city?.toLowerCase().includes(q) ||
          ev?.country?.toLowerCase().includes(q)
        );
      });
    }

    if (year !== "all") {
      const y = parseInt(year, 10);
      arr = arr.filter((p) => (p.event?.year ?? -1) === y);
    }

    arr.sort((a, b) => {
      const aT = a.created ? new Date(a.created).getTime() : 0;
      const bT = b.created ? new Date(b.created).getTime() : 0;
      return sort === "new" ? bT - aT : aT - bT;
    });

    return arr;
  }, [poaps, query, year, sort]);

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset>
          <Navbar bannerText="POAP Dashboard" />
          <div className="bg-slate-950 flex-1 p-6 space-y-6">
            {/* Controls strip ABOVE "My POAPs" */}
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Account */}
                  <div className="space-y-3">
                    <div className="text-sm uppercase tracking-wider text-slate-200">
                      Account
                    </div>
                    <div className="rounded-xl border border-slate-800 p-4 space-y-3 bg-slate-900/50">
                      <div className="text-xs text-slate-400">Using</div>
                      <div className="flex items-center gap-2">
                        <Input
                          value={
                            mode === "email"
                              ? email
                              : mode === "manual"
                              ? manualWallet
                              : address ?? ""
                          }
                          onChange={(e) =>
                            mode === "email"
                              ? setEmail(e.target.value)
                              : mode === "manual"
                              ? setManualWallet(e.target.value)
                              : null
                          }
                          placeholder={
                            mode === "email" ? "you@example.com" : "0x..."
                          }
                          className="bg-slate-800 border-slate-700 text-white font-mono"
                          disabled={mode === "wallet"}
                        />
                        <Button
                          variant="outline"
                          className="border-slate-700 text-slate-00"
                          onClick={copyAddr}
                          disabled={!addressOrEmail}
                          title="Copy"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-emerald-400">
                        <ShieldCheck className="h-4 w-4" />
                        Server-side API key protection enabled
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="space-y-3">
                    <div className="text-sm uppercase tracking-wider text-slate-200">
                      Filters
                    </div>
                    <div className="rounded-xl border border-slate-800 p-4 bg-slate-900/50 space-y-3">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search name / city / country"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-slate-400" />
                          <Select
                            value={year}
                            onValueChange={(v) => setYear(v)}
                          >
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                              <SelectItem value="all">All years</SelectItem>
                              {years.map((y) => (
                                <SelectItem key={y} value={String(y)}>
                                  {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Select
                          value={sort}
                          onValueChange={(v) => setSort(v as "new" | "old")}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Sort" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="new">Newest first</SelectItem>
                            <SelectItem value="old">Oldest first</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Mode */}
                  <div className="space-y-3">
                    <div className="text-sm uppercase tracking-wider text-slate-200">
                      Mode
                    </div>
                    <div className="rounded-xl border border-slate-800 p-4 bg-slate-900/50 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-white font-medium">
                          {mode === "wallet" && "Wallet mode"}
                          {mode === "email" && "Email mode"}
                          {mode === "manual" && "Manual wallet mode"}
                          <span className="block text-xs text-slate-400">
                            {mode === "wallet" && "Auto-uses connected wallet"}
                            {mode === "email" && "Query by your POAP email"}
                            {mode === "manual" &&
                              "Enter any wallet address manually"}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          className="border-slate-700 text-slate-700"
                          onClick={() =>
                            setMode((prev) =>
                              prev === "wallet"
                                ? "email"
                                : prev === "email"
                                ? "manual"
                                : "wallet"
                            )
                          }
                        >
                          Switch
                        </Button>
                      </div>

                      {mode === "email" && (
                        <div className="flex items-center gap-2">
                          <Input
                            className="bg-slate-800 border-slate-700 text-white"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                          <Button
                            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                            onClick={fetchPoaps}
                            disabled={!email || loading}
                          >
                            {loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Fetch"
                            )}
                          </Button>
                        </div>
                      )}
                      {mode === "manual" && (
                        <div className="flex items-center gap-2">
                          <Input
                            className="bg-slate-800 border-slate-700 text-white"
                            placeholder="0x... wallet"
                            value={manualWallet}
                            onChange={(e) => setManualWallet(e.target.value)}
                          />
                          <Button
                            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                            onClick={fetchPoaps}
                            disabled={!manualWallet || loading}
                          >
                            {loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Search"
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-slate-400">
                    {mode === "wallet" && isConnected
                      ? "Ready. Using connected wallet."
                      : mode === "email"
                      ? "Enter an email and click fetch."
                      : mode === "manual"
                      ? "Enter a wallet address and click search."
                      : "Connect wallet to auto-load your POAPs."}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="border-slate-700 text-slate-700"
                      onClick={() => {
                        setQuery("");
                        setYear("all");
                        setSort("new");
                      }}
                    >
                      Reset Filters
                    </Button>
                    <Button
                      onClick={fetchPoaps}
                      disabled={loading || !addressOrEmail}
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 inline-flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading…
                        </>
                      ) : (
                        <>
                          <RefreshCcw className="h-4 w-4" />
                          Refresh
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Title + meta */}
            {/* <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white text-xl font-bold">My POAPs</h2>
                <p className="text-slate-400 text-sm">
                  {filtered.length} result{filtered.length === 1 ? "" : "s"}
                  {query ? ` • “${query}”` : ""}
                  {year !== "all" ? ` • ${year}` : ""}
                </p>
              </div>
              {!isConnected && !useEmail && (
                <div className="text-sm text-slate-400">Connect wallet to view.</div>
              )}
            </div> */}

            <div>
              <h2 className="text-white text-xl font-bold">POAPs Gallery</h2>
      
            {poapScore !== null && (
              <span className="text-cyan-400 text-sm">
                Social Proof Score: {(poapScore * 100).toFixed(0)} / 100
              </span>
            )}
            </div>
            {/* Results */}
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="border border-slate-800 rounded-xl p-4 animate-pulse"
                      >
                        <div className="h-5 w-2/3 bg-slate-800 rounded mb-2" />
                        <div className="h-4 w-1/3 bg-slate-800 rounded mb-3" />
                        <div className="h-40 w-full bg-slate-800 rounded" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="border border-red-500/40 bg-red-500/10 text-red-300 rounded-xl p-4">
                    <div className="font-medium">Error</div>
                    <div className="text-sm mt-1">{error}</div>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 p-8 text-center text-slate-200">
                    No POAPs found. Try another address/email, or adjust
                    filters.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((item, i) => {
                      const ev = item.event ?? {};
                      return (
                        <div
                          key={i}
                          className="group border border-slate-500 rounded-xl overflow-hidden 
                                      bg-gradient-to-r from-cyan-200 to-purple-200 
                                      hover:from-cyan-400 hover:to-purple-400 
                                      transition"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {ev.image_url ? (
                            <img
                              src={ev.image_url}
                              alt={ev.name || ""}
                              className="h-40 w-full object-contain bg-slate-900/70"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-40 w-full bg-slate-900/70" />
                          )}
                          <div className="p-4 space-y-2">
                            <div className="font-bold text-black line-clamp-2">
                              {ev.name || "Untitled Event"}
                            </div>
                            <div className="text-xs text-slate-800 font-black">
                              {ev.start_date ? ev.start_date : "—"}{" "}
                              {ev.end_date ? `→ ${ev.end_date}` : ""}
                            </div>
                            {(ev.city || ev.country) && (
                              <div className="text-xs text-slate-700">
                                {[ev.city, ev.country]
                                  .filter(Boolean)
                                  .join(", ")}
                              </div>
                            )}
                            <div className="text-[11px] text-slate-600 break-all">
                              Owner: {item.owner ?? "—"}
                            </div>
                            <div className="text-[11px] text-slate-600">
                              Created: {item.created ?? "—"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
