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
import { Copy, Loader2, RefreshCcw, Search, ShieldCheck, Filter } from "lucide-react";
import { Navbar } from "@/components/Navbar";

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

  // Controls
  const [useEmail, setUseEmail] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [year, setYear] = React.useState<string>("all");
  const [sort, setSort] = React.useState<"new" | "old">("new");

  const addressOrEmail = useEmail ? email.trim() : address;

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

  React.useEffect(() => {
    if (isConnected && !useEmail) fetchPoaps();
  }, [isConnected, useEmail, fetchPoaps]);

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
                    <div className="text-sm uppercase tracking-wider text-slate-400">Account</div>
                    <div className="rounded-xl border border-slate-800 p-4 space-y-3 bg-slate-900/50">
                      <div className="text-xs text-slate-400">Using</div>
                      <div className="flex items-center gap-2">
                        <Input
                          value={useEmail ? email : (address ?? "")}
                          onChange={(e) => useEmail ? setEmail(e.target.value) : null}
                          placeholder={useEmail ? "you@example.com" : "0x..."}
                          className="bg-slate-800 border-slate-700 text-white font-mono"
                          disabled={!useEmail}
                        />
                        <Button
                          variant="outline"
                          className="border-slate-700 text-slate-200"
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
                    <div className="text-sm uppercase tracking-wider text-slate-400">Filters</div>
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
                          <Select value={year} onValueChange={(v) => setYear(v)}>
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

                        <Select value={sort} onValueChange={(v) => setSort(v as "new" | "old")}>
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
                    <div className="text-sm uppercase tracking-wider text-slate-400">Mode</div>
                    <div className="rounded-xl border border-slate-800 p-4 bg-slate-900/50 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm">
                          {useEmail ? "Email mode" : "Wallet mode"}
                          <span className="block text-xs text-slate-400">
                            {useEmail ? "Query by your POAP email" : "Auto-uses connected wallet"}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          className="border-slate-700 text-slate-200"
                          onClick={() => setUseEmail((s) => !s)}
                        >
                          Switch
                        </Button>
                      </div>

                      {useEmail && (
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
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-slate-400">
                    {isConnected || useEmail ? (
                      <>Ready. {addressOrEmail ? "Click refresh to re-fetch." : "Enter an email to fetch."}</>
                    ) : (
                      <>Connect wallet to auto-load your POAPs or switch to Email mode.</>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="border-slate-700 text-slate-200"
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
            <div className="flex items-center justify-between">
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
            </div>

            {/* Results */}
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="border border-slate-800 rounded-xl p-4 animate-pulse">
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
                    No POAPs found. Try another address/email, or adjust filters.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((item, i) => {
                      const ev = item.event ?? {};
                      return (
                        <div key={i} className="group border border-slate-800 rounded-xl overflow-hidden bg-slate-900 hover:bg-slate-900/80 transition">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {ev.image_url ? (
                            <img
                              src={ev.image_url}
                              alt={ev.name || ""}
                              className="h-40 w-full object-contain bg-slate-800/40"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-40 w-full bg-slate-800/40" />
                          )}
                          <div className="p-4 space-y-2">
                            <div className="font-medium line-clamp-2">{ev.name || "Untitled Event"}</div>
                            <div className="text-xs text-slate-200">
                              {ev.start_date ? ev.start_date : "—"} {ev.end_date ? `→ ${ev.end_date}` : ""}
                            </div>
                            {(ev.city || ev.country) && (
                              <div className="text-xs text-slate-200">
                                {[ev.city, ev.country].filter(Boolean).join(", ")}
                              </div>
                            )}
                            <div className="text-[11px] text-slate-200 break-all">
                              Owner: {item.owner ?? "—"}
                            </div>
                            <div className="text-[11px] text-slate-200">
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
