"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "lucide-react";
import Image from "next/image";

export function Navbar({ bannerText }: { bannerText?: string }) {
  return (
    <div className="flex flex-col">
      {/* Top gradient bar */}
      <div className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 p-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 text-white">
            <span className="font-medium"> {bannerText || (
              <>
                <Link className="w-4 h-4 inline-block mr-2" />
                Launching on Mainnet Soon !
              </>
            )}</span>
          </div>
        </div>
      </div>

      {/* Main navbar row */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950 text-white">
        <div className="flex items-center gap-2">
          <Image
            src="/whiteop.png"
            alt="logo"
            height={300}
            width={100}
            style={{ width: "auto" }}
            className="ml-2"
          />
        </div>
        <ConnectButton />
      </div>
    </div>
  );
}
