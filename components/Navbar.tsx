"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "lucide-react";
import Image from "next/image";

export function Navbar() {
  return (
    <div className="flex flex-col">
      {/* Top gradient bar */}
      <div className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 p-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 text-white">
            <Link className="w-4 h-4" />
            <span className="font-medium">Badges Minting Is Coming Soon!</span>
          </div>
        </div>
      </div>

      {/* Main navbar row */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950 text-white">
        <div className="flex items-center gap-2">
          <Image
            src="/whiteop.png"
            alt="openscore logo"
            width={130}
            height={130}
            priority   
            className="object-contain ml-8"
          />
        </div>
        <ConnectButton />
      </div>
    </div>
  );
}
