"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();

  // Redirect to dashboard if connected
  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
      <div className="text-3xl font-bold mb-4">Welcome to OpenScore</div>
      <div className="text-slate-400 mb-6">Connect your wallet to get started</div>
      <ConnectButton />
    </div>
  );
}
