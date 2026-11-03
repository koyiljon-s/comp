import { Badge, ReadOnlyNote, SectionHeading, StatCard } from "@/components/ui";
import {
  formatHealthFactor,
  formatPercent,
  formatToken,
  formatUsd,
} from "@/lib/compound/format";
import type { CompoundSnapshot } from "@/lib/compound/types";

export default function DashboardPanel({
  snapshot,
}: {
  snapshot: CompoundSnapshot;
}) {
  const { account, market } = snapshot;
  const healthTone =
    account.healthFactor === null
      ? "default"
      : account.healthFactor < 1.25
        ? "danger"
        : account.healthFactor < 2
          ? "warning"
          : "positive";
  const suppliedCollateral = account.collateral.filter(
    (asset) => asset.balance > 0,
  );

  return (
    <div className="space-y-8">
      <section className="space-y-3 text-white">
        <SectionHeading
          title="Your Position"
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Net position"
            value={formatUsd(account.netPositionUsd)}
            hint={`${formatUsd(account.totalSuppliedUsd)} supplied`}
          />
          <StatCard
            label="Borrowed"
            value={formatUsd(account.borrowedBaseUsd)}
            hint={`${formatToken(account.borrowedBase)} ${market.baseSymbol} · ${formatPercent(market.borrowApy)} APY`}
          />
          <StatCard
            label="Health factor"
            value={formatHealthFactor(account.healthFactor)}
            tone={healthTone}
            hint={
              account.liquidationDropPercent === null
                ? "No borrow outstanding"
                : `Liquidation after a ${account.liquidationDropPercent.toFixed(1)}% collateral drop`
            }
          />
          <StatCard
            label="Available to borrow"
            value={formatUsd(account.availableToBorrowUsd)}
            hint={`Borrow capacity ${formatUsd(account.borrowCapacityUsd)}`}
          />
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading
          title="Market"
          description={`${market.baseSymbol} supplied, borrowed, and utilization.`}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Supply APY"
            value={formatPercent(market.supplyApy)}
            tone="positive"
          />
          <StatCard
            label="Borrow APY"
            value={formatPercent(market.borrowApy)}
          />
          <StatCard
            label="Total supplied"
            value={formatUsd(market.totalSupplyUsd)}
            hint={`${formatUsd(market.totalBorrowUsd)} borrowed`}
          />
          <StatCard
            label="Utilization"
            value={formatPercent(market.utilization)}
            hint={`${market.assets} collateral assets`}
          />
        </div>
        <div className="rounded-lg border border-zinc-200 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-700">Utilization</span>
            <span className="tabular-nums text-zinc-500">
              {formatPercent(market.utilization)}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-zinc-900"
              style={{
                width: `${Math.min(100, market.utilization * 100)}%`,
              }}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading
          title="Collateral"
          description="Assets backing your borrow position."
        />
        {suppliedCollateral.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-500">
            No collateral supplied on this market.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Asset</th>
                  <th className="px-4 py-3 text-right font-medium">Balance</th>
                  <th className="px-4 py-3 text-right font-medium">Price</th>
                  <th className="px-4 py-3 text-right font-medium">Value</th>
                  <th className="px-4 py-3 text-right font-medium">
                    Liq. threshold
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {suppliedCollateral.map((asset) => (
                  <tr key={asset.address}>
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {asset.symbol}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                      {formatToken(asset.balance)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                      {formatUsd(asset.priceUsd)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-900">
                      {formatUsd(asset.balanceUsd)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                      {formatPercent(asset.liquidateCollateralFactor, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeading title="COMP rewards" />
        <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-2xl font-bold tabular-nums text-zinc-900">
              {formatToken(account.compAccrued)} {account.compSymbol}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Unclaimed rewards accrued on this market.
            </p>
          </div>
          <Badge tone="amber">COMP</Badge>
        </div>
      </section>

      <ReadOnlyNote />
    </div>
  );
}
