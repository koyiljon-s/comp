import type { Address } from "viem";

export type CollateralPosition = {
  address: Address;
  symbol: string;
  decimals: number;
  priceUsd: number;
  balance: number;
  balanceUsd: number;
  borrowCollateralFactor: number;
  liquidateCollateralFactor: number;
  liquidationFactor: number;
  supplyCap: string;
};

export type CompoundSnapshot = {
  updatedAt: string;
  chain: {
    id: number;
    name: string;
  };
  market: {
    comet: Address;
    name: string;
    baseSymbol: string;
    baseDecimals: number;
    basePriceUsd: number;
    totalSupplyUsd: number;
    totalBorrowUsd: number;
    utilization: number;
    supplyApy: number;
    borrowApy: number;
    assets: number;
  };
  account: {
    address: Address;
    suppliedBase: number;
    suppliedBaseUsd: number;
    borrowedBase: number;
    borrowedBaseUsd: number;
    collateralUsd: number;
    totalSuppliedUsd: number;
    netPositionUsd: number;
    borrowCapacityUsd: number;
    liquidationCapacityUsd: number;
    availableToBorrowUsd: number;
    healthFactor: number | null;
    liquidationDropPercent: number | null;
    compAccrued: number;
    compSymbol: string;
    collateral: CollateralPosition[];
  };
};

export type RecentActivity = {
  id: string;
  type: "Supply" | "Withdraw" | "Borrow" | "Repay";
  direction: "in" | "out";
  amount: number;
  symbol: string;
  blockNumber: string;
  txHash: string;
  timestamp: string;
};
