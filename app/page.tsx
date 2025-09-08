"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Link } from "lucide-react";
import { Footer } from "@/components/ui/footer";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import Image from "next/image";

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  return (
    
    <div className="flex-1 flex flex-col">
      <div className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 p-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 text-white">
            <Link className="w-4 h-4" />
            <span className="font-medium">Multi Chain Is Coming Soon!</span>
          </div>
        </div>
      </div>

      
      <div className="flex-1 bg-slate-950 text-white">
        <div className="flex items-center justify-between p-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Image
                src="/whiteop.png"
                alt="openscore logo"
                width={130}
                height={130}
                className="object-contain ml-8"
              />
            {/* <span className="text-2xl font-bold">OpenScore</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
              X
            </span> */}
          </div>
          <div className="mr-8" >
          <ConnectButton />
          </div>
        </div>
      </div>
      <ScrollStack>
        <ScrollStackItem>
          <h2>Card 1</h2>
          <p>This is the first card in the stack</p>
        </ScrollStackItem>
        <ScrollStackItem>
          <h2>Card 2</h2>
          <p>This is the second card in the stack</p>
        </ScrollStackItem>
        <ScrollStackItem>
          <h2>Card 3</h2>
          <p>This is the third card in the stack</p>
        </ScrollStackItem>
      </ScrollStack>
      <Footer />
    </div>
    // <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
    //   <div className="text-3xl font-bold mb-4">Welcome to OpenScore</div>
    //   <div className="text-slate-400 mb-6">Connect your wallet to get started</div>
    //   <ConnectButton />
    // </div>
  );
}