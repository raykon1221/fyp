"use client";

import { formatUnits } from "viem";
import type { BorrowRow } from "@/lib/subgraph";

type Props = { rows: BorrowRow[]; tokenDecimals?: number };

const dtf = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function fmtAmount(raw: string, decimals: number) {
  try {
    return Number(formatUnits(BigInt(raw), decimals)).toLocaleString("en-GB", {
      maximumFractionDigits: 6,
    });
  } catch {
    return raw;
  }
}

export default function BorrowsTable({ rows, tokenDecimals = 18 }: Props) {
  const explorer =
    process.env.NEXT_PUBLIC_EXPLORER_BASE || "https://etherscan.io";

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left bg-gray-50">
            <th className="py-2 px-3">Tx</th>
            <th className="py-2 px-3">Amount</th>
            <th className="py-2 px-3">Borrow Rate</th>
            <th className="py-2 px-3">Time (UTC)</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-6 px-3 text-gray-500">
                No borrows found.
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const d = new Date(Number(r.timestamp) * 1000);
              const timeText = isNaN(d.getTime()) ? r.timestamp : dtf.format(d);
              return (
                <tr key={r.id} className="border-t">
                  <td className="py-2 px-3">
                    <a
                      className="text-blue-600 underline"
                      href={`${explorer}/tx/${r.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {r.txHash.slice(0, 10)}…
                    </a>
                  </td>
                  <td className="py-2 px-3">
                    {fmtAmount(r.amount, tokenDecimals)}
                  </td>
                  <td className="py-2 px-3">{r.borrowRate}</td>
                  <td className="py-2 px-3">
                    <span suppressHydrationWarning>{timeText}</span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
