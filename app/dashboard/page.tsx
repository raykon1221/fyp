"use client";

import { useAccount, useEnsName } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "lucide-react";
import { ethers } from "ethers";
// import contractABI from "@/lib/abis/CreditScoreDCS.json";
import { toast } from "sonner"; 
import { PinataSDK } from "pinata";
import { mainnet } from "wagmi/chains";
import EnsLookup from "@/components/enslookup";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: "example-gateway.mypinata.cloud",
});


async function readScoreServer(user: `0x${string}`) {
  const r = await fetch("/api/score-read", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ user }),
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json.error || "read failed");
  return json as {
    user: `0x${string}`;
    score: number;
    factors: Record<string, string>; // 1e18-scaled strings
    lastUpdated: number;             // unix seconds
  };
}

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


export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const items = [
    {
      label: "On-chain Activity",
      value: 0,
      max: 100,
      color: "from-cyan-500 to-purple-500",
      onClick: () => router.push("/onchain"),
    },
    {
      label: "DeFi Usage",
      value: 0,
      max: 50,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "NFT Holdings",
      value: 0,
      max: 50,
      color: "from-pink-500 to-cyan-500",
    },
    {
      label: "Social Score",
      value: 0,
      max: 50,
      color: "from-cyan-500 to-pink-500",
    },
  ];
  const { data: ensName, isLoading } = useEnsName({
    address,
    chainId: mainnet.id      // 👈 ENS only exists on Ethereum mainnet
  });

  // If not connected, redirect to home
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  // Prevent flash of dashboard before redirect
  if (!isConnected) return <p>Not connected</p>;

  // const pinata = new pinataSDK("YOUR_API_KEY", "YOUR_API_SECRET");

  // async function handleUpdateScore() {
  //   try {
  //     if (!address) return;

  //     // 1. Connect to contract
  //     const provider = new ethers.BrowserProvider(window.ethereum);
  //     const signer = await provider.getSigner();
  //     const contract = new ethers.Contract("YOUR_CONTRACT_ADDRESS", contractABI, signer);

  //     // 2. Get score from contract
  //     const score = await contract.calculateScore(address);

  //     // 3. Build metadata
  //     const metadata = {
  //       name: `D Credit Score – ${score}`,
  //       description: "Soulbound credit score NFT",
  //       attributes: [
  //         { trait_type: "Credit Score", value: score },
  //         { trait_type: "Last Updated", value: new Date().toISOString().split("T")[0] }
  //       ]
  //     };

  //     // 4. Upload to Pinata
  //     const result = await pinata.pinJSONToIPFS(metadata);
  //     const metadataURI = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

  //     // 5. Call mint function
  //     const tx = await contract.mintDCS(address, score, metadataURI);
  //     await tx.wait();

  //       toast.success("Minted DCS NFT successfully!");
  //     } catch (err) {
  //       console.error("Error minting score:", err);
  //       toast.error("Failed to mint score NFT.");
  //     }
  //   }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset>
        <div className="flex-1 flex flex-col">
          <div className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 p-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 text-white">
                <Link className="w-4 h-4" />
                <span className="font-medium">Badges Minting Is Coming Soon!</span>
              </div>
            </div>
          </div>

          
            <div className="flex-1 bg-slate-950 text-white">
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">OpenScore</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                    X
                  </span>
                </div>
                <ConnectButton />
              </div>

              <div className="p-6 space-y-6 ">
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="relative w-64 h-64 mx-auto mb-6">
                          <svg
                            className="w-full h-full transform -rotate-90"
                            viewBox="0 0 100 100"
                          >
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              className="text-slate-800"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="url(#gradient)"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${0} ${2 * Math.PI * 40}`}
                              strokeLinecap="round"
                              className="transition-all duration-1000 ease-out"
                            />
                            <defs>
                              <linearGradient
                                id="gradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop offset="0%" stopColor="#a855f7" />
                                <stop offset="50%" stopColor="#ec4899" />
                                <stop offset="100%" stopColor="#06b6d4" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-4xl font-bold">0</div>
                            <div className="text-slate-400">/ 250</div>
                            <div className="text-sm text-slate-500 mt-1">
                              Open Score
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 pl-8">
                        <div className="space-y-4">
                          <div>
                            <div className="text-slate-400 text-sm mb-1">
                              Wallet Address
                            </div>
                            <div className="font-mono text-slate-300">
                              {address
                                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                                : "Not Connected"}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-sm mb-1">
                              Ens Name
                            </div>
                            <div className="font-mono text-slate-300">
                              {isLoading ? "…" : ensName ?? "Not Found"}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-sm mb-1">
                              Last Updated
                            </div>
                            <div className="text-slate-300">26 June 25</div>
                          </div>
                          {/* <EnsLookup /> */}
                          <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 mt-6">
                            Update Score
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">OpenScore as SBT</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-slate-900 border-slate-800">
                      <CardContent className="p-6">
                        <div className="relative">
                          <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-lg font-bold mb-2">
                                OpenScore
                              </div>
                              <div className="text-lg font-bold mb-2">SCORE</div>
                              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                0
                              </div>
                              <div className="text-slate-400">/250</div>
                            </div>
                          </div>
                          <div className="absolute top-4 right-4">
                            <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold">
                            Soulbound Token Details
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <div className="text-slate-400 text-sm">
                                Token Standard
                              </div>
                              <div className="text-slate-200">
                                ERC-721 (Soulbound)
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-400 text-sm">
                                Network
                              </div>
                              <div className="text-slate-200">
                                Ethereum Mainnet
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-400 text-sm">
                                Transferable
                              </div>
                              <div className="text-slate-200">No (Soulbound)</div>
                            </div>
                            <div>
                              <div className="text-slate-400 text-sm">
                                Mint Status
                              </div>
                              <div className="text-slate-200">Available</div>
                            </div>
                          </div>
                          <Button
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 mt-4"
                            disabled
                          >
                            Mint SBT (Score Required)
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Score Breakdown</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {items.map((item, index) => (
                      <Card
                        key={index}
                        onClick={item.onClick}
                        className={`bg-slate-900 border-slate-800 transition cursor-pointer hover:bg-slate-800 active:scale-[0.98]`}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="text-sm text-slate-400">{item.label}</div>
                            <div className="text-2xl font-bold">{item.value}</div>
                            <div className="text-xs text-slate-500">Max: {item.max}</div>
                            <div className="w-full bg-slate-800 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}
                                style={{ width: `${(item.value / item.max) * 100}%` }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}