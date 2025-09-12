import { useState } from "react";

export default function MintScoreButton({ user, score }: { user: `0x${string}`, score: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMintScore = async () => {
    setLoading(true);
    setError(null);

    try {
      const txHash = mintScore(score, user);
      console.log("Mint successful:", txHash);
    } catch (e) {
      setError("Error minting score");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 mt-4 text-white font-bold py-2 px-4 rounded"
        onClick={handleMintScore}
        disabled={loading}
      >
        {loading ? "Minting..." : "Mint Score"}
      </button>
    </div>
  );
}
function mintScore(score: number, user: string) {
    throw new Error("Function not implemented.");
}

