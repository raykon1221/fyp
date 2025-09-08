"use client";

import { useState } from "react";
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

// import your fetchers
import {
  fetchRepaysByAccount,
  fetchBorrowsByAccount,
  fetchSuppliesByAccount,
  RepayRow,
  BorrowRow,
  SupplyRow,
} from "@/lib/subgraph";

export default function OnchainActivityPage() {
  const [address, setAddress] = useState("");
  const [queryType, setQueryType] = useState<"repay" | "borrow" | "supply">(
    "repay"
  );
  const [transactions, setTransactions] = useState<
    (RepayRow | BorrowRow | SupplyRow)[]
  >([]);

  const fetchTransactions = async () => {
    if (!address) return;

    try {
      let data: any[] = [];

      if (queryType === "repay") {
        data = await fetchRepaysByAccount(address as `0x${string}`);
      } else if (queryType === "borrow") {
        data = await fetchBorrowsByAccount(address as `0x${string}`);
      } else if (queryType === "supply") {
        data = await fetchSuppliesByAccount(address as `0x${string}`);
      }

      setTransactions(data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setTransactions([]);
    }
  };

  const explorer =
    process.env.NEXT_PUBLIC_EXPLORER_BASE || "https://etherscan.io";

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
                  <h2 className="text-white text-xl font-bold">
                    Search Transactions
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Paste Wallet Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="text-white bg-slate-800 border-slate-700"
                    />

                    <Select
                      onValueChange={(val) =>
                        setQueryType(val as "repay" | "borrow" | "supply")
                      }
                      defaultValue="repay"
                    >
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
                  <h2 className="text-white text-xl font-bold mb-4">
                    Transaction Data
                  </h2>
                  {transactions.length === 0 ? (
                    <div className="text-slate-500 text-sm">
                      No data yet. Enter a wallet and fetch.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-slate-800 text-sm">
                        <thead className="bg-slate-800">
                          <tr>
                            <th className="text-white px-4 py-2 text-left">
                              Tx Hash
                            </th>
                            <th className="text-white px-4 py-2 text-left">
                              Amount
                            </th>
                            <th className="text-white px-4 py-2 text-left">
                              Timestamp
                            </th>
                            {queryType === "repay" && (
                              <th className="text-white px-4 py-2 text-left">
                                useATokens
                              </th>
                            )}
                            {queryType === "borrow" && (
                              <th className="text-white px-4 py-2 text-left">
                                Borrow Rate
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((tx: any) => (
                            <tr
                              key={tx.id}
                              className="border-t border-slate-800 hover:bg-slate-800"
                            >
                              <td className="text-white px-4 py-2 font-mono">
                                <a
                                className="text-blue-600 underline"
                                href={`${explorer}/tx/${tx.txHash}`}
                                target="_blank"
                                rel="noreferrer"
                              >{tx.txHash}</a>
                              </td>
                              <td className="text-white px-4 py-2">
                                {tx.amount}
                              </td>
                              <td className="text-white px-4 py-2">
                                {tx.timestamp}
                              </td>
                              {queryType === "repay" && (
                                <td className="text-white px-4 py-2">
                                  {tx.useATokens ? "Yes" : "No"}
                                </td>
                              )}
                              {queryType === "borrow" && (
                                <td className="text-white px-4 py-2">
                                  {tx.borrowRate}
                                </td>
                              )}
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
