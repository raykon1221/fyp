"use client";

import { useAccount, useEnsName } from "wagmi";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "lucide-react";
import { ethers } from "ethers";
import CreditScoring from "@abi/CreditScoring.json";
import { toast } from "sonner";
import { mainnet } from "wagmi/chains";
import EnsLookup from "@/components/enslookup";
import Image from "next/image";
import MintScoreButton from "@/components/mintScore";
import { ScoreCard } from "@/components/ScoreCard";
import { Navbar } from "@/components/Navbar";
import { MintCard } from "@/components/MintCard";

// Function to read score from the server
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
    lastUpdated: number; // unix seconds
  };
}

// Function to refresh score
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

async function uploadToPinata(metadata: any, score: number) {
  const enrichedMetadata = {
    ...metadata,
    image: getBadgeImage(score), // 👈 add NFT image here
  };

  const res = await fetch("/api/pinata-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ metadata: enrichedMetadata }),
  });

  if (!res.ok) throw new Error("Failed to upload to Pinata");
  const { metadataURI } = await res.json();
  return metadataURI;
}

function getBadgeImage(score: number | null) {
  if (!score) {
    return "https://jade-labour-mink-410.mypinata.cloud/ipfs/bafybeibsy5mv666lymgwyw7kmrunrxuf3le633jmgk5ovgzjd4afqwsbva"; // Bronze (default)
  }
  if (score >= 700)
    return "https://jade-labour-mink-410.mypinata.cloud/ipfs/bafybeibdsnxczesk2msqpzu4fax76nzperszsgqqmpmhavfqrn2jj2abqi"; // Gold
  if (score >= 300)
    return "https://jade-labour-mink-410.mypinata.cloud/ipfs/bafybeidltifchw77vnbnqyx6hmo3j7sgcysgpmxo6hzt6veutvisqxfauq"; // Silver
  return "https://jade-labour-mink-410.mypinata.cloud/ipfs/bafybeibsy5mv666lymgwyw7kmrunrxuf3le633jmgk5ovgzjd4afqwsbva"; // Bronze
}

// Add a custom type definition for your contract
type CreditScoringContract = ethers.Contract & {
  mintDCS: (
    score: number,
    tokenURI: string,
    expiryTs: number,
    signature: string
  ) => Promise<ethers.ContractTransaction>;
};

const contractAddress = "0x9fc2659364f59B916898944aDB72B0E233Ca8Ad9"; // Replace with your actual contract address

// const provider = new ethers.BrowserProvider((window as any).ethereum);
// const signer = await provider.getSigner();
// const contract = new ethers.Contract(
//   contractAddress,
//   CreditScoring.abi,
//   signer
// );

// Create a contract from a signer or provider
function getCreditScoringContract(signerOrProvider: any) {
  return new ethers.Contract(
    contractAddress,
    CreditScoring.abi,
    signerOrProvider
  );
}

// Nice cooldown formatter
function formatTime(seconds: number) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${seconds % 60}s`;
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const [score, setScore] = useState<number | null>(null);
  const [cooldownLeft, setCooldownLeft] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [mintedNFT, setMintedNFT] = useState<{
    uri: string;
    image: string;
  } | null>(null);

  // If not connected, redirect to home
  useEffect(() => {
    if (!isConnected) router.push("/");
    if (address) {
      // fetch score, cooldown etc
    }
  }, [isConnected, address, router]);

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
    chainId: mainnet.id,
  });

  const handleMintScore = async () => {
    if (!address || !score) return;

    try {
      // 1) Build metadata
      const metadata = {
        name: `Credit Score - ${score}`,
        description: "Soulbound credit score NFT",
        image: getBadgeImage(score), // ensure image included
        attributes: [
          { trait_type: "Credit Score", value: score },
          {
            trait_type: "Last Updated",
            value: new Date().toISOString().split("T")[0],
          },
        ],
      };

      // 2) Upload to Pinata
      const metadataURI = await uploadToPinata(metadata, score);

      // 3) Get server attestation
      const res = await fetch("/api/score-attestation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: address, score, uri: metadataURI }),
      });
      if (!res.ok) throw new Error("Failed to get attestation from server");
      const { expiry, signature } = await res.json();

      // 4) Connect wallet + call mint
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = getCreditScoringContract(signer);

      const tx = await contract.mintDCS(score, metadataURI, expiry, signature);
      await tx.wait();

      setTxHash(tx.hash); // show tx hash in UI
      setMintedNFT({ uri: metadataURI, image: metadata.image }); // trigger preview & metadata fetch
      toast.success("Minted score successfully!");

      // 5) Refresh cooldown
      fetchCooldown(address);
    } catch (e) {
      console.error("Error minting score:", e);
      toast.error("Failed to mint score");
    }
  };

  useEffect(() => {
    if (address) fetchCooldown(address);
  }, [address]);

  const fetchCooldown = async (user: string) => {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const contract = getCreditScoringContract(provider);

    const lastMintAt = await contract.lastMintAt(user);
    const mintCooldown = await contract.mintCooldown();

    const now = Math.floor(Date.now() / 1000);
    const nextMint = Number(lastMintAt) + Number(mintCooldown);
    const diff = nextMint - now;

    setCooldownLeft(diff > 0 ? diff : 0);
  };

  useEffect(() => {
    const fetchMinted = async () => {
      if (!address) return;
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        CreditScoring.abi,
        provider
      );

      const balance = await contract.balanceOf(address, 1); // DCS_ID = 1
      if (balance > 0) {
        const scoreData = await contract.getCreditScore(address);
        if (scoreData.uri) {
          const res = await fetch(
            scoreData.uri.replace("ipfs://", "https://ipfs.io/ipfs/")
          );
          const metadata = await res.json();
          setMintedNFT({
            uri: scoreData.uri,
            image: metadata.image,
          });
        }
      }
    };

    fetchMinted();
  }, [address]);

  const handleScoreAction = async () => {
    if (!address) return;
    setErr(null);

    setBusy(true);
    try {
      // Refresh the score
      const txHash = await refreshScore(address as `0x${string}`);
      const updatedScore = await readScoreServer(address as `0x${string}`);
      setScore(updatedScore.score);
      setLastUpdated(updatedScore.lastUpdated);
      setTxHash(txHash);
    } catch (e) {
      console.error(e);
      toast.error("Error updating score");
      setErr("Error updating score");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {!isConnected ? (
        <p>Not connected</p>
      ) : (
        <SidebarProvider defaultOpen={false}>
          <AppSidebar />
          <SidebarInset>
            <div className="flex-1 flex flex-col">
              <Navbar />
              <div className="flex-1 bg-slate-950 text-white">
                <div className="p-6 space-y-6 ">
                  <ScoreCard
                    score={score}
                    address={address}
                    ensName={ensName}
                    isLoading={isLoading}
                    lastUpdated={lastUpdated}
                    txHash={txHash}
                    busy={busy}
                    err={err} // 👈 new prop
                    handleScoreAction={handleScoreAction}
                  />
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">
                      OpenScore as DCS Token
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
                      <Card className="bg-slate-900 border-slate-800 h-[500px]">
                        <CardContent className="p-4 h-full flex flex-col items-center justify-center">
                          {/* {mintedNFT ? (
                            <div className="flex flex-col items-center">
                              <Image
                                src={mintedNFT.image}
                                alt="Minted NFT"
                                width={150}
                                height={150}
                                className="rounded-lg border border-slate-700"
                              />
                              <div className="mt-4 text-lg font-bold">
                                Score: {score}
                              </div>
                              <div className="text-sm text-slate-400">
                                <a
                                  href={mintedNFT.uri.replace(
                                    "ipfs://",
                                    "https://ipfs.io/ipfs/"
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-400 hover:underline"
                                >
                                  View Metadata
                                </a>
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                <a
                                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  View Transaction
                                </a>
                              </div>
                            </div>
                          ) : ( */}
                            <div className="flex flex-col items-center">
                                <h3 className="text-3xl font-bold text-slate-200 mb-8">Tier Badges</h3>

                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Bronze */}
                                <div className="flex flex-col items-center group">
                                  <Image
                                    src="https://jade-labour-mink-410.mypinata.cloud/ipfs/bafybeibsy5mv666lymgwyw7kmrunrxuf3le633jmgk5ovgzjd4afqwsbva"
                                    alt="Bronze Tier Badge"
                                    width={200}
                                    height={200}
                                    className={`w-48 h-48 md:w-56 md:h-56 object-contain rounded-lg border transition duration-300
                                      ${score && score < 300
                                        ? "border-cyan-400 opacity-100"
                                        : "border-slate-700 opacity-40 group-hover:opacity-100 group-hover:border-cyan-400"}`}
                                  />
                                  <div className="mt-4 text-lg text-slate-300">Bronze (0–299)</div>
                                </div>

                                {/* Silver */}
                                <div className="flex flex-col items-center group">
                                  <Image
                                    src="https://jade-labour-mink-410.mypinata.cloud/ipfs/bafybeidltifchw77vnbnqyx6hmo3j7sgcysgpmxo6hzt6veutvisqxfauq"
                                    alt="Silver Tier Badge"
                                    width={300}
                                    height={300}
                                    className={`w-48 h-48 md:w-56 md:h-56 object-contain rounded-lg border transition duration-300
                                      ${score && score >= 300 && score < 700
                                        ? "border-cyan-400 opacity-100"
                                        : "border-slate-700 opacity-40 group-hover:opacity-100 group-hover:border-cyan-400"}`}
                                  />
                                  <div className="mt-4 text-lg text-slate-300">Silver (300–699)</div>
                                </div>

                                {/* Gold */}
                                <div className="flex flex-col items-center group">
                                  <Image
                                    src="https://jade-labour-mink-410.mypinata.cloud/ipfs/bafybeibdsnxczesk2msqpzu4fax76nzperszsgqqmpmhavfqrn2jj2abqi"
                                    alt="Gold Tier Badge"
                                    width={300}
                                    height={300}
                                    className={`w-48 h-48 md:w-56 md:h-56 object-contain rounded-lg border transition duration-300
                                      ${score && score >= 700
                                        ? "border-cyan-400 opacity-100"
                                        : "border-slate-700 opacity-40 group-hover:opacity-100 group-hover:border-cyan-400"}`}
                                  />
                                  <div className="mt-4 text-lg text-slate-300">Gold (700–1000)</div>
                                </div>
                              </div>
                              <div
                                  className="px-6 py-2 rounded-full border border-cyan-400 bg-slate-900 text-2xl font-extrabold 
                                            bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent mt-8"
                                >
                                  {score ? `Your Score: ${score}` : "No Score Yet"}
                                </div>
                            </div>
                          {/* )} */}
                        </CardContent>
                      </Card>

                      <MintCard
                        mintedNFT={mintedNFT}
                        score={score}
                        cooldownLeft={cooldownLeft}
                        handleMintScore={handleMintScore}
                        address={address}
                        className="h-[400px]"
                      />
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
                              <div className="text-sm text-slate-400">
                                {item.label}
                              </div>
                              <div className="text-2xl font-bold">
                                {item.value}
                              </div>
                              <div className="text-xs text-slate-500">
                                Max: {item.max}
                              </div>
                              <div className="w-full bg-slate-800 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}
                                  style={{
                                    width: `${(item.value / item.max) * 100}%`,
                                  }}
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
      )}
    </div>
  );
}
