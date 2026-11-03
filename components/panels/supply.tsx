import { ReadOnlyNote, SectionHeading, StatCard } from "@/components/ui";
import {
  formatPercent,
  formatToken,
  formatUsd,
} from "@/lib/compound/format";
import type { CompoundSnapshot } from "@/lib/compound/types";

export default function SupplyPanel({
  snapshot,
}: {
  snapshot: CompoundSnapshot;
}) {
  const { account, market } = snapshot;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <SectionHeading
          title={`${market.baseSymbol} market`}
          description="Base asset supplied to the market and earning interest."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={`Your ${market.baseSymbol}`}
            value={formatUsd(account.suppliedBaseUsd)}
            hint={`${formatToken(account.suppliedBase)} ${market.baseSymbol}`}
          />
          <StatCard
            label="Supply APY"
            value={formatPercent(market.supplyApy)}
            tone="positive"
          />
          <StatCard
            label="Total supplied"
            value={formatUsd(market.totalSupplyUsd)}
            hint={`${formatPercent(market.utilization)} utilized`}
          />
          <StatCard
            label="Total borrowed"
            value={formatUsd(market.totalBorrowUsd)}
            hint={`${formatPercent(market.borrowApy)} borrow APY`}
          />
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading
          title="Collateral markets"
          description="Accepted collateral, risk parameters, and your supplied balances."
        />
        <div className="overflow-x-auto rounded-lg border border-[#262626]">
          <table className="w-full min-w-190 text-left text-sm">
            <thead className="bg-[#262626] text-sm tracking-wide text-[#a3a3a3]">
              <tr>
                <th className="px-4 py-3 font-medium">Asset</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 text-right font-medium">Borrow CF</th>
                <th className="px-4 py-3 text-right font-medium">Liq. threshold</th>
                <th className="px-4 py-3 text-right font-medium">Supply cap</th>
                <th className="px-4 py-3 text-right font-medium">Your supply</th>
                <th className="px-4 py-3 text-right font-medium">Your value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {account.collateral.map((asset) => (
                <tr key={asset.address}>
                  <td className="px-4 py-3 font-medium text-[#a3a3a3]">
                    {asset.symbol}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-[#a3a3a3]">
                    {formatUsd(asset.priceUsd)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-[#a3a3a3]">
                    {formatPercent(asset.borrowCollateralFactor, 0)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-[#a3a3a3]">
                    {formatPercent(asset.liquidateCollateralFactor, 0)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-[#a3a3a3]">
                    {asset.supplyCap}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-[#a3a3a3]">
                    {formatToken(asset.balance)} {asset.symbol}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-[#a3a3a3]">
                    {formatUsd(asset.balanceUsd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ReadOnlyNote />
    </div>
  );
}
