import {
  createPublicClient,
  fallback,
  formatUnits,
  http,
  parseEventLogs,
  type Address,
} from "viem";
import {
  CHAIN,
  COMET_REWARDS,
  COMET_USDC,
  HISTORY_BLOCK_RANGE,
  SECONDS_PER_BLOCK,
} from "./config";
import { cometAbi, cometEventsAbi, erc20Abi, rewardsAbi } from "./abi";
import type {
  CollateralPosition,
  CompoundSnapshot,
  RecentActivity,
} from "./types";

const SECONDS_PER_YEAR = 31_536_000;
const PRICE_SCALE = 1e8;
const FACTOR_SCALE = 1e18;

const rpcUrls = [
  process.env.BASE_RPC_URL,
  "https://base-rpc.publicnode.com",
  "https://mainnet.base.org",
  "https://base.drpc.org",
].filter((url): url is string => Boolean(url));

const client = createPublicClient({
  chain: CHAIN,
  transport: fallback(
    rpcUrls.map((url) => http(url, { timeout: 12_000 })),
    { rank: false },
  ),
});

type RawAssetInfo = {
  offset: number;
  asset: Address;
  priceFeed: Address;
  scale: bigint;
  borrowCollateralFactor: bigint;
  liquidateCollateralFactor: bigint;
  liquidationFactor: bigint;
  supplyCap: bigint;
};

async function safeRead<T>(read: () => Promise<T>, fallbackValue: T) {
  try {
    return await read();
  } catch {
    return fallbackValue;
  }
}

function decimalsFromScale(scale: bigint) {
  return scale.toString().length - 1;
}

function toUsd(value: number) {
  return value / PRICE_SCALE;
}

function apyFromPerSecondRate(rate: bigint) {
  if (rate === 0n) return 0;

  const perSecond = Number(rate) / FACTOR_SCALE;
  return Math.pow(1 + perSecond, SECONDS_PER_YEAR) - 1;
}

function formatSupplyCap(raw: bigint, decimals: number) {
  if (raw >= 10n ** 30n) return "Unlimited";

  const amount = Number(formatUnits(raw, decimals));
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(amount);
}

async function readSymbol(token: Address, fallbackValue: string) {
  return safeRead(
    () =>
      client.readContract({
        address: token,
        abi: erc20Abi,
        functionName: "symbol",
      }),
    fallbackValue,
  );
}

export async function getCompoundSnapshot(
  address: Address,
): Promise<CompoundSnapshot> {
  const [
    numAssets,
    baseToken,
    baseTokenPriceFeed,
    baseDecimals,
    utilization,
    totalSupply,
    totalBorrow,
  ] = await Promise.all([
    client.readContract({
      address: COMET_USDC,
      abi: cometAbi,
      functionName: "numAssets",
    }),
    client.readContract({
      address: COMET_USDC,
      abi: cometAbi,
      functionName: "baseToken",
    }),
    client.readContract({
      address: COMET_USDC,
      abi: cometAbi,
      functionName: "baseTokenPriceFeed",
    }),
    client.readContract({
      address: COMET_USDC,
      abi: cometAbi,
      functionName: "decimals",
    }),
    client.readContract({
      address: COMET_USDC,
      abi: cometAbi,
      functionName: "getUtilization",
    }),
    client.readContract({
      address: COMET_USDC,
      abi: cometAbi,
      functionName: "totalSupply",
    }),
    client.readContract({
      address: COMET_USDC,
      abi: cometAbi,
      functionName: "totalBorrow",
    }),
  ]);

  const [supplyRate, borrowRate, basePriceRaw, baseSymbol] = await Promise.all([
    client.readContract({
      address: COMET_USDC,
      abi: cometAbi,
      functionName: "getSupplyRate",
      args: [utilization],
    }),
    client.readContract({
      address: COMET_USDC,
      abi: cometAbi,
      functionName: "getBorrowRate",
      args: [utilization],
    }),
    safeRead(
      () =>
        client.readContract({
          address: COMET_USDC,
          abi: cometAbi,
          functionName: "getPrice",
          args: [baseTokenPriceFeed],
        }),
      0n,
    ),
    readSymbol(baseToken, "USDC"),
  ]);

  const assetInfos = (await Promise.all(
    Array.from({ length: Number(numAssets) }, async (_, index) => {
      const info = await client.readContract({
        address: COMET_USDC,
        abi: cometAbi,
        functionName: "getAssetInfo",
        args: [index],
      });

      return info as unknown as RawAssetInfo;
    }),
  )) as RawAssetInfo[];

  const [collateralBalances, collateralMeta] = await Promise.all([
    Promise.all(
      assetInfos.map((info) =>
        client.readContract({
          address: COMET_USDC,
          abi: cometAbi,
          functionName: "userCollateral",
          args: [address, info.asset],
        }),
      ),
    ),
    Promise.all(
      assetInfos.map(async (info) => {
        const [price, symbol] = await Promise.all([
          safeRead(
            () =>
              client.readContract({
                address: COMET_USDC,
                abi: cometAbi,
                functionName: "getPrice",
                args: [info.priceFeed],
              }),
            0n,
          ),
          readSymbol(info.asset, "UNKNOWN"),
        ]);

        return { price, symbol };
      }),
    ),
  ]);

  const [
    baseBalanceRaw,
    borrowBalanceRaw,
    rewardOwed,
  ] = await Promise.all([
    client.readContract({
      address: COMET_USDC,
      abi: cometAbi,
      functionName: "balanceOf",
      args: [address],
    }),
    client.readContract({
      address: COMET_USDC,
      abi: cometAbi,
      functionName: "borrowBalanceOf",
      args: [address],
    }),
    safeRead(
      () =>
        client.readContract({
          address: COMET_REWARDS,
          abi: rewardsAbi,
          functionName: "getRewardOwed",
          args: [COMET_USDC, address],
        }),
      null,
    ),
  ]);

  const basePriceUsd = toUsd(Number(basePriceRaw));
  const baseBalance = Number(formatUnits(baseBalanceRaw, baseDecimals));
  const borrowBalance = Number(formatUnits(borrowBalanceRaw, baseDecimals));

  const collateral: CollateralPosition[] = assetInfos.map((info, index) => {
    const decimals = decimalsFromScale(info.scale);
    const rawBalance = collateralBalances[index]?.[0] ?? 0n;
    const balance = Number(formatUnits(rawBalance, decimals));
    const priceUsd = toUsd(Number(collateralMeta[index].price));

    return {
      address: info.asset,
      symbol: collateralMeta[index].symbol,
      decimals,
      priceUsd,
      balance,
      balanceUsd: balance * priceUsd,
      borrowCollateralFactor:
        Number(info.borrowCollateralFactor) / FACTOR_SCALE,
      liquidateCollateralFactor:
        Number(info.liquidateCollateralFactor) / FACTOR_SCALE,
      liquidationFactor: Number(info.liquidationFactor) / FACTOR_SCALE,
      supplyCap: formatSupplyCap(info.supplyCap, decimals),
    };
  });

  const collateralUsd = collateral.reduce(
    (sum, asset) => sum + asset.balanceUsd,
    0,
  );
  const borrowCapacityUsd = collateral.reduce(
    (sum, asset) => sum + asset.balanceUsd * asset.borrowCollateralFactor,
    0,
  );
  const liquidationCapacityUsd = collateral.reduce(
    (sum, asset) => sum + asset.balanceUsd * asset.liquidateCollateralFactor,
    0,
  );

  const suppliedBaseUsd = baseBalance * basePriceUsd;
  const borrowedBaseUsd = borrowBalance * basePriceUsd;

  let compAccrued = 0;
  let compSymbol = "COMP";

  if (rewardOwed && rewardOwed.token !== "0x0000000000000000000000000000000000000000") {
    const [rewardDecimals, rewardSymbol] = await Promise.all([
      safeRead(
        () =>
          client.readContract({
            address: rewardOwed.token,
            abi: erc20Abi,
            functionName: "decimals",
          }),
        18,
      ),
      readSymbol(rewardOwed.token, "COMP"),
    ]);

    compAccrued = Number(formatUnits(rewardOwed.owed, rewardDecimals));
    compSymbol = rewardSymbol;
  }

  return {
    updatedAt: new Date().toISOString(),
    chain: {
      id: CHAIN.id,
      name: CHAIN.name,
    },
    market: {
      comet: COMET_USDC,
      name: `Compound III · ${baseSymbol}`,
      baseSymbol,
      baseDecimals,
      basePriceUsd,
      totalSupplyUsd: Number(formatUnits(totalSupply, baseDecimals)) * basePriceUsd,
      totalBorrowUsd: Number(formatUnits(totalBorrow, baseDecimals)) * basePriceUsd,
      utilization: Number(utilization) / FACTOR_SCALE,
      supplyApy: apyFromPerSecondRate(supplyRate),
      borrowApy: apyFromPerSecondRate(borrowRate),
      assets: Number(numAssets),
    },
    account: {
      address,
      suppliedBase: baseBalance,
      suppliedBaseUsd,
      borrowedBase: borrowBalance,
      borrowedBaseUsd,
      collateralUsd,
      totalSuppliedUsd: suppliedBaseUsd + collateralUsd,
      netPositionUsd: suppliedBaseUsd + collateralUsd - borrowedBaseUsd,
      borrowCapacityUsd,
      liquidationCapacityUsd,
      availableToBorrowUsd: Math.max(0, borrowCapacityUsd - borrowedBaseUsd),
      healthFactor:
        borrowedBaseUsd > 0 && liquidationCapacityUsd > 0
          ? liquidationCapacityUsd / borrowedBaseUsd
          : null,
      liquidationDropPercent:
        borrowedBaseUsd > 0 && liquidationCapacityUsd > 0
          ? Math.max(0, (1 - borrowedBaseUsd / liquidationCapacityUsd) * 100)
          : null,
      compAccrued,
      compSymbol,
      collateral,
    },
  };
}

export async function getRecentActivity(
  address: Address,
): Promise<RecentActivity[]> {
  const latestBlock = await client.getBlock({ blockTag: "latest" });
  const fromBlock =
    latestBlock.number > HISTORY_BLOCK_RANGE
      ? latestBlock.number - HISTORY_BLOCK_RANGE
      : 0n;

  const sampleBlock = await client.getBlock({
    blockNumber:
      latestBlock.number > 1_000n ? latestBlock.number - 1_000n : 0n,
  });
  const sampledBlockTime =
    Number(latestBlock.timestamp - sampleBlock.timestamp) / 1_000;
  const secondsPerBlock =
    sampledBlockTime > 0 ? sampledBlockTime : SECONDS_PER_BLOCK;

  const logs = await client.getLogs({
    address: COMET_USDC,
    fromBlock,
    toBlock: latestBlock.number,
  });

  const parsed = parseEventLogs({
    abi: cometEventsAbi,
    logs,
    strict: false,
  });

  const account = address.toLowerCase();
  const involved = parsed.filter((log) => {
    const args = log.args as Record<string, string | undefined>;

    return ["from", "dst", "src", "to", "payer"].some(
      (key) => args[key]?.toLowerCase() === account,
    );
  });

  const [baseDecimals, baseSymbol] = await Promise.all([
    client.readContract({
      address: COMET_USDC,
      abi: cometAbi,
      functionName: "decimals",
    }),
    readSymbol(
      await client.readContract({
        address: COMET_USDC,
        abi: cometAbi,
        functionName: "baseToken",
      }),
      "USDC",
    ),
  ]);

  return involved
    .slice(-15)
    .reverse()
    .map((log) => {
      const type = log.eventName as RecentActivity["type"];
      const amount = (log.args as { amount: bigint }).amount;
      const blockDelta = latestBlock.number - (log.blockNumber ?? latestBlock.number);
      const timestamp = new Date(
        (Number(latestBlock.timestamp) -
          Number(blockDelta) * secondsPerBlock) *
          1_000,
      ).toISOString();

      return {
        id: `${log.transactionHash}-${log.logIndex}`,
        type,
        direction: type === "Borrow" || type === "Withdraw" ? "in" : "out",
        amount: Number(formatUnits(amount, baseDecimals)),
        symbol: baseSymbol,
        blockNumber: (log.blockNumber ?? 0n).toString(),
        txHash: log.transactionHash ?? "",
        timestamp,
      };
    });
}
