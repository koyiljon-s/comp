"use client";

import { useEffect, useState } from "react";
import type { Address } from "viem";
import {
  Badge,
  EmptyState,
  ReadOnlyNote,
  SectionHeading,
} from "@/components/ui";
import { formatRelativeTime, formatToken } from "@/lib/compound/format";
import type { RecentActivity } from "@/lib/compound/types";

type HistoryState = {
  address: Address | null;
  activity: RecentActivity[] | null;
  error: string | null;
};

export default function HistoryPanel({ address }: { address: Address }) {
  const [state, setState] = useState<HistoryState>({
    address: null,
    activity: null,
    error: null,
  });
  const [reloadKey, setReloadKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/compound/history?address=${address}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const body = await response.json();

        if (!response.ok) {
          throw new Error(body.error ?? "Request failed.");
        }

        return body.activity as RecentActivity[];
      })
      .then((activity) => {
        setState({ address, activity, error: null });
      })
      .catch((requestError: unknown) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setState({
          address,
          activity: null,
          error:
            requestError instanceof Error
              ? requestError.message
              : "Something went wrong.",
        });
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setRefreshing(false);
        }
      });

    return () => controller.abort();
  }, [address, reloadKey]);

  const matchesAddress = state.address === address;
  const activity = matchesAddress ? state.activity : null;
  const error = matchesAddress ? state.error : null;
  const loading = refreshing || !matchesAddress;

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Recent activity"
        description="Supply, withdraw, borrow, and repay events for this account in recent Base blocks."
        action={
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              setReloadKey((key) => key + 1);
            }}
            disabled={loading}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-60"
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        }
      />

      {loading && activity === null ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-lg bg-zinc-100"
            />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Could not load activity" description={error} />
      ) : activity && activity.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-right font-medium">When</th>
                <th className="px-4 py-3 text-right font-medium">Block</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {activity.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3">
                    <Badge
                      tone={entry.direction === "in" ? "green" : "neutral"}
                    >
                      {entry.type}
                    </Badge>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium tabular-nums ${
                      entry.direction === "in"
                        ? "text-emerald-600"
                        : "text-zinc-900"
                    }`}
                  >
                    {entry.direction === "in" ? "+" : "−"}
                    {formatToken(entry.amount)} {entry.symbol}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-500">
                    {formatRelativeTime(entry.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`https://basescan.org/tx/${entry.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
                    >
                      #{entry.blockNumber}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No recent activity"
          description="No Supply, Withdraw, Borrow, or Repay events were found for this account in the scanned block range."
        />
      )}

      <ReadOnlyNote />
    </div>
  );
}
