"use client";
import React from "react";

export function ScoreCircle({ score }: { score: number | null }) {
  return (
    <div className="relative w-64 h-64 mx-auto mb-6">
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-slate-800"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${
            ((score ?? 0) * (2 * Math.PI * 40)) / 1000
          } ${2 * Math.PI * 40}`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold text-slate-200">
          {score ?? "—"}
        </div>
        <div className="text-slate-400">/ 1000</div>
        <div className="text-sm text-slate-500 mt-1">Open Score</div>
      </div>
    </div>
  );
}
