"use client";

import { useState } from "react";
import {
  EmptyState,
  ReadOnlyNote,
  SectionHeading,
  StatCard,
} from "@/components/ui";
import {
  formatHealthFactor,
  formatPercent,
  formatUsd,
} from "@/lib/compound/format";
import type { CompoundSnapshot } from "@/lib/compound/types";

const SCENARIOS = [10, 25, 50];

function toneForHealthFactor(
  value: number,
): "danger" | "warning" | "positive" {
  if (value < 1.25) return "danger";
  if (value < 2) return "warning";
  return "positive";
}

export default function RiskSimPanel({
  snapshot,
}: {
  snapshot: CompoundSnapshot;
}) {
  const { account } = snapshot;
  const [shock, setShock] = useState(25);

  const hasDebt = account.borrowedBaseUsd > 0;
  const currentHealth = account.healthFactor;
  const shockedHealth =
    currentHealth === null ? null : currentHealth * (1 - shock / 100);

  if (!hasDebt) {
    return (
      <EmptyState
        title="No borrow outstanding"
        description="This account has no debt, so there is no liquidation risk to simulate. Borrow against collateral to see how price shocks affect the health factor."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <SectionHeading
          title="Liquidation simulator"
          description="Applies a uniform price shock to all collateral and recomputes the health factor."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Health factor now"
            value={formatHealthFactor(currentHealth)}
            tone={toneForHealthFactor(currentHealth ?? 0)}
          />
          <StatCard
            label={`Health factor at −${shock}%`}
            value={formatHealthFactor(shockedHealth)}
            tone={toneForHealthFactor(shockedHealth ?? 0)}
          />
          <StatCard
            label="Liquidation starts at"
            value={
              account.liquidationDropPercent === null
                ? "—"
                : `−${account.liquidationDropPercent.toFixed(1)}%`
            }
            hint="Collateral price drop"
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading
          title="Collateral price shock"
        />
        <div className="rounded-lg border border-[#262626] p-4">
          <div className="flex items-center justify-between text-xl">
            <span className="font-medium text-white">Price drop</span>
            <span className="tabular-nums text-zinc-900">−{shock}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={90}
            step={1}
            value={shock}
            onChange={(event) => setShock(Number(event.target.value))}
            aria-label="Collateral price drop percentage"
            className="mt-3 w-full accent-[#be96fa]"
          />
          <div className="flex flex-wrap gap-4 py-4">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario}
                type="button"
                onClick={() => setShock(scenario)}
                className={`rounded-lg px-6 py-2 text-lg font-medium transition-colors ${
                  shock === scenario
                    ? " bg-[#271c36] text-[#be96fa]"
                    : " bg-[#141414] border border-[#292929] text-zinc-600"
                }`}
              >
                −{scenario}%
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden mt-8 rounded-lg border border-[#262626]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#262626] text-xs uppercase tracking-wide text-[#a3a3a3]">
              <tr>
                <th className="px-4 py-3 font-medium">Scenario</th>
                <th className="px-4 py-3 text-right font-medium">
                  Collateral value
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  Health factor
                </th>
                <th className="px-4 py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              <tr>
                <td className="px-4 py-3 font-medium text-[#a3a3a3]">Now</td>
                <td className="px-4 py-3 text-right tabular-nums text-[#a3a3a3]">
                  {formatUsd(account.collateralUsd)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[#a3a3a3]">
                  {formatHealthFactor(currentHealth)}
                </td>
                <td className="px-4 py-3 text-right text-emerald-600">Safe</td>
              </tr>
              {SCENARIOS.map((scenario) => {
                const scenarioHealth =
                  currentHealth === null
                    ? null
                    : currentHealth * (1 - scenario / 100);

                return (
                  <tr key={scenario}>
                    <td className="px-4 py-3 font-medium text-[#a3a3a3]">
                      −{scenario}%
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#a3a3a3]">
                      {formatUsd(
                        account.collateralUsd * (1 - scenario / 100),
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#a3a3a3]">
                      {formatHealthFactor(scenarioHealth)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right ${
                        (scenarioHealth ?? 0) < 1
                          ? "text-red-600"
                          : (scenarioHealth ?? 0) < 1.25
                            ? "text-amber-600"
                            : "text-emerald-600"
                      }`}
                    >
                      {(scenarioHealth ?? 0) < 1
                        ? "Liquidatable"
                        : (scenarioHealth ?? 0) < 1.25
                          ? "At risk"
                          : "Safe"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mt-8">
          <StatCard
            label="Collateral value"
            value={formatUsd(account.collateralUsd)}
            hint={`After a −${shock}% shock: ${formatPercent(
              (100 - shock) / 100,
              0,
            )} of current value`}
          />
          <StatCard
            label="Debt"
            value={formatUsd(account.borrowedBaseUsd)}
            hint="Debt stays constant in this simulation"
          />
        </div>
      </section>

      <ReadOnlyNote />
    </div>
  );
}
