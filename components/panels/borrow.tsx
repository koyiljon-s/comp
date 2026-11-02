import { ReadOnlyNote, SectionHeading, StatCard } from "@/components/ui";
import {
  formatHealthFactor,
  formatPercent,
  formatToken,
  formatUsd,
} from "@/lib/compound/format";
import type { CompoundSnapshot } from "@/lib/compound/types";

export default function BorrowPanel({
  snapshot,
}: {
  snapshot: CompoundSnapshot;
}) {
  const { account, market } = snapshot;
  const suppliedCollateral = account.collateral.filter(
    (asset) => asset.balance > 0,
  );

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <SectionHeading
          title="Your borrow position"
          description={`Borrowing ${market.baseSymbol} against supplied collateral.`}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Borrowed"
            value={formatUsd(account.borrowedBaseUsd)}
            hint={`${formatToken(account.borrowedBase)} ${market.baseSymbol}`}
          />
          <StatCard
            label="Borrow APY"
            value={formatPercent(market.borrowApy)}
          />
          <StatCard
            label="Borrow capacity"
            value={formatUsd(account.borrowCapacityUsd)}
            hint="Based on borrow collateral factors"
          />
          <StatCard
            label="Available to borrow"
            value={formatUsd(account.availableToBorrowUsd)}
            tone={account.availableToBorrowUsd > 0 ? "positive" : "default"}
            hint={`Health factor ${formatHealthFactor(account.healthFactor)}`}
          />
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading
          title="Borrowing power"
          description="How much each collateral asset contributes to your borrow limit."
        />
        {suppliedCollateral.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-500">
            Supply collateral to unlock borrowing.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Asset</th>
                  <th className="px-4 py-3 text-right font-medium">Balance</th>
                  <th className="px-4 py-3 text-right font-medium">Value</th>
                  <th className="px-4 py-3 text-right font-medium">Borrow CF</th>
                  <th className="px-4 py-3 text-right font-medium">
                    Borrowing power
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
                      {formatUsd(asset.balanceUsd)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                      {formatPercent(asset.borrowCollateralFactor, 0)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-900">
                      {formatUsd(
                        asset.balanceUsd * asset.borrowCollateralFactor,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ReadOnlyNote />
    </div>
  );
}
