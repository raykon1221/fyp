"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Link } from "lucide-react";
import '@rainbow-me/rainbowkit/styles.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 text-white">
                <Link className="w-4 h-4" />
                <span className="font-medium">Badges Minting Is Now Live!</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-slate-950 text-white">
            {/* Top Navigation */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">OpenScore</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  X
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="bg-slate-800 border-slate-700 text-slate-300 px-4 py-2"
                >
                  0x5...86f53
                </Badge>
                <ConnectButton />
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Switch Wallet
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Disconnect Wallet
                </Button>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6 space-y-6">
              {/* Main Score Card */}
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {/* Circular Progress */}
                      <div className="relative w-64 h-64 mx-auto mb-6">
                        <svg
                          className="w-full h-full transform -rotate-90"
                          viewBox="0 0 100 100"
                        >
                          {/* Background circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-slate-800"
                          />
                          {/* Progress circle */}
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
                            0x5Ea68050599e...386f53
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-sm mb-1">
                            Last Updated
                          </div>
                          <div className="text-slate-300">26 June 25</div>
                        </div>
                        <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 mt-6">
                          Update Score
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SBT Section */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">OpenScore as SBT</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* NFT Card Preview */}
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

                  {/* SBT Information */}
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

              {/* Score Breakdown */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Score Breakdown</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Trust Score",
                      value: 0,
                      max: 100,
                      color: "from-green-500 to-emerald-500",
                    },
                    {
                      label: "Activity Score",
                      value: 0,
                      max: 50,
                      color: "from-blue-500 to-cyan-500",
                    },
                    {
                      label: "Reputation Score",
                      value: 0,
                      max: 75,
                      color: "from-purple-500 to-pink-500",
                    },
                    {
                      label: "Verification Score",
                      value: 0,
                      max: 25,
                      color: "from-orange-500 to-red-500",
                    },
                  ].map((item, index) => (
                    <Card key={index} className="bg-slate-900 border-slate-800">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="text-sm text-slate-400">
                            {item.label}
                          </div>
                          <div className="text-2xl font-bold">{item.value}</div>
                          <div className="text-xs text-slate-500">
                            Max: {item.max}
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}
                              style={{
                                width: `${(item.value / item.max) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
