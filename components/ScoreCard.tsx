"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreCircle } from "./ScoreCircle";
import { WalletInfo } from "./WalletInfo";

export function ScoreCard({
  score,
  address,
  ensName,
  isLoading,
  lastUpdated,
  txHash,
  busy,
  handleScoreAction,
}: any) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-8 flex items-center justify-between">
        <div className="flex-1">
          <ScoreCircle score={score} />
        </div>

        <div className="flex-1 pl-8">
          <WalletInfo
            address={address}
            ensName={ensName}
            isLoading={isLoading}
            lastUpdated={lastUpdated}
            txHash={txHash}
          />
          <Button
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 mt-6"
            onClick={handleScoreAction}
            disabled={busy || !address}
          >
            {busy ? "Updating..." : score ? "Update Score" : "Get Score"}
          </Button>
          
        </div>
      </CardContent>
    </Card>
  );
}
