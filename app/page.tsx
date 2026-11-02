"use client";

import { useEffect, useState } from "react";
import { getAddress, isAddress, type Address } from "viem";
import AddressSearch from "@/components/address-search";
import Navbar from "@/components/navbar";
import BorrowPanel from "@/components/panels/borrow";
import DashboardPanel from "@/components/panels/dashboard";
import HistoryPanel from "@/components/panels/history";
import RiskSimPanel from "@/components/panels/risk-sim";
import SupplyPanel from "@/components/panels/supply";
import Sidebar, { type Section } from "@/components/sidebar";
import { Badge, EmptyState } from "@/components/ui";
import { formatRelativeTime, shortAddress } from "@/lib/compound/format";
import { useCompound } from "@/lib/compound/use-compound";

const SECTION_COPY: Record<Section, string> = {
  Dashboard:
    "Live Compound III positions, market rates, and COMP rewards on Base.",
  Supply: "Base market and collateral assets, read directly from Comet.",
  Borrow: "Borrowing power, debt, and collateral factors from Base.",
  "Risk Sim": "Stress-test this account against a collateral price shock.",
  History: "Recent on-chain activity for this account on Base.",
};

const STORAGE_KEY = "safeborrow:base-address";

function PanelSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-lg bg-zinc-100"
          />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-lg bg-zinc-100" />
    </div>
  );
}

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>("Dashboard");
  const [address, setAddress] = useState<Address | null>(null);
  const [addressValue, setAddressValue] = useState("");
  const { data, loading, error, reload } = useCompound(address);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const candidate =
      params.get("address") ?? window.localStorage.getItem(STORAGE_KEY);

    if (candidate && isAddress(candidate)) {
      const normalized = getAddress(candidate);

      queueMicrotask(() => {
        setAddress(normalized);
        setAddressValue(normalized);
      });
    }
  }, []);

  function handleSearch(nextAddress: Address) {
    setAddress(nextAddress);
    setAddressValue(nextAddress);
    window.localStorage.setItem(STORAGE_KEY, nextAddress);

    const params = new URLSearchParams(window.location.search);
    params.set("address", nextAddress);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans">
      <Navbar />
      <div className="mx-auto flex w-full max-w-full flex-1 flex-col gap-6 md:flex-row">
        <Sidebar active={activeSection} onSelect={setActiveSection} />

        <main className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
          <header className="flex flex-col gap-4 border-b border-zinc-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                  {activeSection}
                </h1>
                <Badge tone="blue">Base</Badge>
              </div>
              <p className="mt-1 max-w-prose text-sm text-zinc-600">
                {SECTION_COPY[activeSection]}
              </p>
            </div>
            {address ? (
              <div className="flex shrink-0 items-center gap-3 text-xs text-zinc-500">
                {data ? <span>Updated {formatRelativeTime(data.updatedAt)}</span> : null}
                <button
                  type="button"
                  onClick={reload}
                  disabled={loading}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Refreshing…" : "Refresh"}
                </button>
              </div>
            ) : null}
          </header>

          <div className="mt-6">
            <AddressSearch
              key={addressValue}
              value={addressValue}
              loading={loading}
              onSearch={handleSearch}
            />
            {address ? (
              <p className="mt-2 text-xs text-zinc-500">
                Viewing{" "}
                <span className="font-mono">{shortAddress(address)}</span> ·{" "}
                <a
                  href={`https://basescan.org/address/${address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline-offset-2 hover:text-zinc-900 hover:underline"
                >
                  Basescan ↗
                </a>
              </p>
            ) : null}
          </div>

          {error ? (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          ) : null}

          <div className="mt-8">
            {!address ? (
              <EmptyState
                title="Load a Base account"
                description="Paste any address that has used Compound III on Base to see live positions, market rates, health factor, and liquidation risk. Everything is read-only — no wallet connection required."
              />
            ) : activeSection === "History" ? (
              <HistoryPanel address={address} />
            ) : !data ? (
              <PanelSkeleton />
            ) : activeSection === "Dashboard" ? (
              <DashboardPanel snapshot={data} />
            ) : activeSection === "Supply" ? (
              <SupplyPanel snapshot={data} />
            ) : activeSection === "Borrow" ? (
              <BorrowPanel snapshot={data} />
            ) : (
              <RiskSimPanel snapshot={data} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
