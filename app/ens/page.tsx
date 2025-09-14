"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";   // 👈 get connected wallet
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
  fetchRepaysByAccount,
  fetchBorrowsByAccount,
  fetchSuppliesByAccount,
  RepayRow,
  BorrowRow,
  SupplyRow,
} from "@/lib/subgraph";
import { Navbar } from "@/components/Navbar";
import EnsLookup from "@/components/enslookup";

export default function OnchainActivityPage() {
  const { address: connectedAddress } = useAccount(); // 👈 wagmi hook

  const [address, setAddress] = useState("");
  const [queryType, setQueryType] = useState<"repay" | "borrow" | "supply">("repay");
  const [transactions, setTransactions] = useState<(RepayRow | BorrowRow | SupplyRow)[]>([]);

  // Auto-fill with connected wallet
  useEffect(() => {
    if (connectedAddress) {
      setAddress(connectedAddress);
    }
  }, [connectedAddress]);

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

  const [txs, setTxs] = useState<any[]>([]);
  useEffect(() => {
    const withFormatted = transactions.map((tx) => ({
      ...tx,
      formattedTime: new Date(Number(tx.timestamp) * 1000).toLocaleString(),
    }));
    setTxs(withFormatted);
  }, [transactions]);

  const explorer = process.env.NEXT_PUBLIC_EXPLORER_BASE || "https://etherscan.io";

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 flex flex-col">
            <Navbar bannerText="On-chain Activity" />
            <div className="bg-slate-950 flex-1 p-6 space-y-6">
              <EnsLookup />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
