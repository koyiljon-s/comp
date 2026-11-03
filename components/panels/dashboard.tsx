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
    <div className="space-y-16">
      <section className="space-y-6 text-white">
        <SectionHeading
          title="Your Position"
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <section className="space-y-6">
        <SectionHeading
          title="Collateral"
          
        />
        {suppliedCollateral.length === 0 ? (
          <p className="rounded-sm border border-dashed border-[#262626] px-4 py-6 text-center text-sm text-zinc-500">
            No collateral supplied on this market.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#262626]">
            <table className="w-full min-w-160 text-left text-sm">
              <thead className="bg-[#262626] text-sm tracking-wide text-[#a3a3a3]">
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
              <tbody className="divide-y divide-[#262626]">
                {suppliedCollateral.map((asset) => (
                  <tr key={asset.address}>
                    <td className="px-4 py-3 font-medium text-[#a3a3a3]">
                      {asset.symbol}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#a3a3a3]">
                      {formatToken(asset.balance)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#a3a3a3]">
                      {formatUsd(asset.priceUsd)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#a3a3a3]">
                      {formatUsd(asset.balanceUsd)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#a3a3a3]">
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
        <div className="flex max-w-sm flex-col gap-3 rounded-lg bg-[#171717] border border-[#262626] p-8">
          <div>
            <p className="text-2xl font-bold tabular-nums text-[#eecfff]">
              {formatToken(account.compAccrued)} {account.compSymbol}
            </p>
            <p className="mt-3 text-sm text-[#d4d4d9]">
              Unclaimed rewards accrued on this market.
            </p>
          </div>
        </div>
      </section>

      <ReadOnlyNote />
    </div>
  );
}
