"use client";

import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function OnchainActivityPage() {
  const [address, setAddress] = useState("");
  const [queryType, setQueryType] = useState("repay");
  const [transactions, setTransactions] = useState<any[]>([]);

  // Mock fetch – replace with your GraphQL fetch
  const fetchTransactions = async () => {
    if (!address) return;
    // Here you would call your GraphQL API
    // For now we’ll just simulate with mock data
    const mock = [
      {
        id: "1",
        txHash: "0x123...abc",
        amount: "100 DAI",
        timestamp: "2025-09-04 14:00",
      },
      {
        id: "2",
        txHash: "0x456...def",
        amount: "50 DAI",
        timestamp: "2025-09-04 15:30",
      },
    ];
    setTransactions(mock);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-purple-500 p-4">
              <div className="flex items-center justify-center">
                <span className="font-medium text-white text-lg">
                  Onchain Activity Dashboard
                </span>
              </div>
            </div>

            <div className="bg-slate-950 flex-1 p-6 space-y-6">
              {/* Controls */}
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-white text-xl font-bold">Search Transactions</h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Paste Wallet Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="text-white bg-slate-800 border-slate-700"
                    />

                    <Select onValueChange={(val) => setQueryType(val)} defaultValue="repay">
                      <SelectTrigger className="text-white bg-slate-800 border-slate-700">
                        <SelectValue placeholder="Select Query Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="repay">Repay</SelectItem>
                        <SelectItem value="borrow">Borrow</SelectItem>
                        <SelectItem value="supply">Supply</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                      onClick={fetchTransactions}
                    >
                      Fetch Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Table */}
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <h2 className="text-white text-xl font-bold mb-4">Transaction Data</h2>
                  {transactions.length === 0 ? (
                    <div className="text-slate-500 text-sm">No data yet. Enter a wallet and fetch.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-slate-800 text-sm">
                        <thead className="bg-slate-800">
                          <tr>
                            <th className="text-white px-4 py-2 text-left">Tx Hash</th>
                            <th className="text-white px-4 py-2 text-left">Amount</th>
                            <th className="text-white px-4 py-2 text-left">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((tx) => (
                            <tr key={tx.id} className="border-t border-slate-800 hover:bg-slate-800">
                              <td className="text-white px-4 py-2 font-mono">{tx.txHash}</td>
                              <td className="text-white px-4 py-2">{tx.amount}</td>
                              <td className="text-white px-4 py-2">{tx.timestamp}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
