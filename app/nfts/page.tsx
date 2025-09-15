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
import { Loader2, RefreshCcw, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { getSocialProof01 } from "@/server/factors/aave";

type AlchemyOwnedNft = {
  contract?: { address?: string; name?: string };
  tokenId?: string;
  name?: string;
  description?: string;
  image?: { cachedUrl?: string; thumbnailUrl?: string };
  media?: Array<{ gateway?: string }>;
};

type AlchemyResponse = {
  ownedNfts?: AlchemyOwnedNft[];
  pageKey?: string;
};

export default function NftsPage() {
  const { address, isConnected } = useAccount();

  const [network, setNetwork] = React.useState("ETH_MAINNET");
  const [data, setData] = React.useState<AlchemyResponse | null>(null);
  const [pageKey, setPageKey] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // UI filters
  const [query, setQuery] = React.useState("");
  const [customAddress, setCustomAddress] = React.useState(""); // user-pasted address
  const [activeAddress, setActiveAddress] = React.useState<string | undefined>(undefined); // which address we are showing

  // Social proof score
  const [nftScore, setNftScore] = React.useState<number | null>(null);

  const NETWORK_LABELS: Record<string, string> = {
    ETH_MAINNET: "Ethereum",
    BASE_MAINNET: "Base",
    ARB_MAINNET: "Arbitrum",
    OPT_MAINNET: "Optimism",
    MATIC_MAINNET: "Polygon",
  };

  const fetchNfts = React.useCallback(
  async (pk?: string, overrideAddress?: string) => {
    const addr = overrideAddress || activeAddress;
    if (!addr || !addr.startsWith("0x")) {
      console.warn("Skipping NFT fetch: no valid address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/nfts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr, pageKey: pk, network }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error ?? `HTTP ${res.status}`);

      let merged: AlchemyResponse;
      if (pk && data?.ownedNfts?.length) {
        merged = {
          ownedNfts: [...(data.ownedNfts || []), ...(json.data?.ownedNfts || [])],
          pageKey: json.data?.pageKey,
        };
      } else {
        merged = json.data;
      }

      setData(merged);
      setPageKey(json.data?.pageKey);
    } catch (e: any) {
      console.error(`NFT fetch failed for ${network}`, e);
      setError(e.message);
      setData(null);
      setPageKey(undefined);
    } finally {
      setLoading(false);
    }
  },
  [activeAddress, network, data]
);


  // when wallet connects, set it as the default active address
  React.useEffect(() => {
    if (isConnected && address) {
      setActiveAddress(address);
    }
  }, [isConnected, address]);

  // auto-fetch NFTs when activeAddress or network changes
  React.useEffect(() => {
    if (activeAddress) fetchNfts(undefined);
  }, [activeAddress, network]); // eslint-disable-line react-hooks/exhaustive-deps

  const nfts = React.useMemo(() => {
    const list = data?.ownedNfts ?? [];
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter((n) => {
      const name = (n.name || n.contract?.name || "").toLowerCase();
      const desc = (n.description || "").toLowerCase();
      const addr = (n.contract?.address || "").toLowerCase();
      return name.includes(q) || desc.includes(q) || addr.includes(q);
    });
  }, [data, query]);

  const renderSkeletons = (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="border border-slate-800 rounded-xl overflow-hidden"
        >
          <div className="h-40 w-full bg-slate-800 animate-pulse" />
          <div className="p-3 space-y-2">
            <div className="h-4 w-2/3 bg-slate-800 animate-pulse rounded" />
            <div className="h-3 w-1/2 bg-slate-800 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset>
          <Navbar bannerText="NFT Gallery" />
          <div className="bg-slate-950 flex-1 p-6 space-y-6">
            {/* Controls bar above "My NFTs" */}
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
                  {/* Left: title + small meta */}
                  <div>
                    <h2 className="text-xl text-white font-bold">
                      NFTs for {activeAddress?.slice(0, 6)}…{activeAddress?.slice(-4)}
                    </h2>
                    <p className="text-sm text-slate-400">
                      {nfts.length} item{nfts.length === 1 ? "" : "s"}
                      {query ? ` • “${query}”` : ""} •{" "}
                      {NETWORK_LABELS[network] || network}
                    </p>
                    {nftScore !== null && (
                      <p className="text-cyan-400 text-sm mt-1">
                        Social Proof Score: {(nftScore * 100).toFixed(0)} / 100
                      </p>
                    )}
                  </div>

                  {/* Right: actions */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    {/* Search filter */}
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search name / contract / description"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white w-64"
                      />
                    </div>

                    {/* Network select */}
                    <Select
                      value={network}
                      onValueChange={(v) => setNetwork(v)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white w-40">
                        <SelectValue placeholder="Network" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="ETH_MAINNET">Ethereum</SelectItem>
                        <SelectItem value="BASE_MAINNET">Base</SelectItem>
                        <SelectItem value="ARB_MAINNET">Arbitrum</SelectItem>
                        <SelectItem value="OPT_MAINNET">Optimism</SelectItem>
                        <SelectItem value="MATIC_MAINNET">Polygon</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Custom address input */}
                    <Input
                      placeholder="Paste another wallet address"
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white w-72"
                    />
                    <Button
                      onClick={() => {
                        if (customAddress) {
                          setActiveAddress(customAddress);
                          fetchNfts(undefined, customAddress);
                        }
                      }}
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                    >
                      Load Wallet
                    </Button>

                    {/* Refresh */}
                    <Button
                      onClick={() => fetchNfts(undefined)}
                      disabled={loading || !isConnected}
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

            {/* Content */}
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                {!isConnected && !activeAddress ? (
                  <div className="rounded-xl border border-slate-800 p-8 text-center text-slate-200">
                    Connect your wallet to view NFTs.
                  </div>
                ) : error ? (
                  <div className="border border-red-500/40 bg-red-500/10 text-red-300 rounded-xl p-4">
                    <div className="font-medium">Error</div>
                    <div className="text-sm mt-1">{error}</div>
                  </div>
                ) : loading && !data ? (
                  renderSkeletons
                ) : nfts.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 p-8 text-center text-slate-400">
                    No NFTs found on {NETWORK_LABELS[network] || network}. Try another wallet or network.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
                      {nfts.map((nft, i) => {
                        const media =
                          nft?.image?.cachedUrl ||
                          nft?.media?.[0]?.gateway ||
                          nft?.image?.thumbnailUrl ||
                          null;

                        const name =
                          nft?.name ||
                          nft?.contract?.name ||
                          `${nft?.contract?.address?.slice(0, 6)}…`;

                        return (
                          <div
                            key={`${nft?.contract?.address}-${nft?.tokenId}-${i}`}
                            className="group border border-slate-500 rounded-xl overflow-hidden 
                                      bg-gradient-to-r from-cyan-200 to-purple-200 
                                      hover:from-cyan-400 hover:to-purple-400 
                                      transition"
                          >
                            {media ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={media}
                                alt={name}
                                className="h-40 w-full object-cover bg-slate-800/40"
                                loading="lazy"
                              />
                            ) : (
                              // fallback placeholder
                              <div className="h-40 w-full bg-slate-800/40 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src="/placeholder-nft.png" // 👈 put a real placeholder image in /public
                                  alt="No NFT image"
                                  className="h-16 w-16 opacity-60"
                                />
                              </div>
                            )}

                            <div className="p-3 space-y-1.5">
                              <div className="text-sm font-bold line-clamp-2">{name}</div>
                              {nft?.description && (
                                <div className="text-[11px] opacity-90 line-clamp-2">
                                  {nft.description}
                                </div>
                              )}
                              <div className="text-[11px] opacity-60 mt-1">
                                #{nft?.tokenId} • {nft?.contract?.address?.slice(0, 10)}…
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-center mt-6">
                      {pageKey && (
                        <Button
                          variant="outline"
                          className="border-slate-700 text-slate-200"
                          onClick={() => fetchNfts(pageKey)}
                          disabled={loading}
                        >
                          {loading ? "Loading…" : "Load more"}
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
