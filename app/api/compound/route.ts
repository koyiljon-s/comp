import { getAddress, isAddress } from "viem";
import { getCompoundSnapshot } from "@/lib/compound/reader";

export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get("address")?.trim();

  if (!address || !isAddress(address)) {
    return Response.json(
      { error: "Provide a valid EVM account address." },
      { status: 400 },
    );
  }

  try {
    const snapshot = await getCompoundSnapshot(getAddress(address));

    return Response.json(snapshot);
  } catch (error) {
    console.error("Failed to read Compound snapshot", error);

    return Response.json(
      { error: "Could not read Compound on Base right now. Please retry." },
      { status: 502 },
    );
  }
}
