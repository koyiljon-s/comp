"use client";

import { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";
import type { CompoundSnapshot } from "./types";

type CompoundState = {
  address: Address | null;
  data: CompoundSnapshot | null;
  error: string | null;
};

export function useCompound(address: Address | null) {
  const [state, setState] = useState<CompoundState>({
    address: null,
    data: null,
    error: null,
  });
  const [reloadKey, setReloadKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!address) return;

    const controller = new AbortController();

    fetch(`/api/compound?address=${address}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const body = await response.json();

        if (!response.ok) {
          throw new Error(body.error ?? "Request failed.");
        }

        return body as CompoundSnapshot;
      })
      .then((data) => {
        setState({ address, data, error: null });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setState({
          address,
          data: null,
          error:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setRefreshing(false);
        }
      });

    return () => controller.abort();
  }, [address, reloadKey]);

  const reload = useCallback(() => {
    setRefreshing(true);
    setReloadKey((key) => key + 1);
  }, []);

  const matchesAddress = address !== null && state.address === address;

  return {
    data: matchesAddress ? state.data : null,
    error: matchesAddress ? state.error : null,
    loading: address !== null && (refreshing || !matchesAddress),
    reload,
  };
}
