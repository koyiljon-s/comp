import type { Address } from "viem";
import { base } from "viem/chains";

/** Compound III (Comet) USDC market on Base. */
export const COMET_USDC: Address =
  "0xb125E6687d4313864e53df431d5425969c15Eb2F";

/** CometRewards on Base. */
export const COMET_REWARDS: Address =
  "0x123964802e6ABabBE1Bc9547D72Ef1B69B00A6b1";

export const CHAIN = base;

/** How many recent Base blocks to scan for the account activity panel. */
export const HISTORY_BLOCK_RANGE = 9_500n;

/** Average Base block time, used for approximate event timestamps. */
export const SECONDS_PER_BLOCK = 2;
