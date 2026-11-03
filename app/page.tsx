"use client";

import { useEffect, useState } from "react";
import { getAddress, isAddress, type Address } from "viem";
import AddressSearch from "@/components/address-search";
import BorrowPanel from "@/components/panels/borrow";
import DashboardPanel from "@/components/panels/dashboard";
import HistoryPanel from "@/components/panels/history";
import RiskSimPanel from "@/components/panels/risk-sim";
import SupplyPanel from "@/components/panels/supply";
import Sidebar, { type Section } from "@/components/sidebar";
import { Badge, EmptyState } from "@/components/ui";
import { useCompound } from "@/lib/compound/use-compound";



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
    <div className="flex flex-1 flex-col bg-[#1e1e1f] font-sans">
      <div className="mx-auto flex w-full max-w-full flex-1 flex-col gap-6 md:flex-row">
        <Sidebar active={activeSection} onSelect={setActiveSection} />

        <main className="min-w-0 flex-1 bg-[#1e1e1f] p-6 sm:p-8">
          <header className="flex flex-col gap-4  pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-base tracking-tight text-white">
                  {activeSection}
                </h1>
              </div> 
            </div>
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
