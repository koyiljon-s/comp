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
    <form onSubmit={handleSubmit} className="space-y-2 bg-[#2a2b2b] border border-dashed border-[#738fff] p-6 rounded-sm">
      <label
        htmlFor="account-address"
        className="block text-xl font-medium text-white"
      >
        Base account
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="account-address"
          name="address"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Search by address ..."
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-lg border border-[#3e3e40] bg-[#1e1e1f] px-3 py-2 font-mono text-sm text-[#b1b5ba] placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-lg bg-[#3640f7] px-6 py-2 text-lg font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Loading…" : "Search"}
        </button>
      </div>
    </form>
  );
}
