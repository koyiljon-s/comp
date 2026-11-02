"use client";

import { useState } from "react";
import { getAddress, isAddress, type Address } from "viem";

type AddressSearchProps = {
  value: string;
  loading?: boolean;
  onSearch: (address: Address) => void;
};

export default function AddressSearch({
  value,
  loading = false,
  onSearch,
}: AddressSearchProps) {
  const [input, setInput] = useState(value);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = input.trim();

    if (!isAddress(trimmed)) {
      setError("Enter a valid EVM address (0x…).");
      return;
    }

    setError(null);
    onSearch(getAddress(trimmed));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label
        htmlFor="account-address"
        className="block text-sm font-medium text-zinc-700"
      >
        Base account
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="account-address"
          name="address"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="0x…"
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Loading…" : "Load position"}
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : (
        <p className="text-xs text-zinc-500">
          Paste any address that has used Compound III on Base.
        </p>
      )}
    </form>
  );
}
