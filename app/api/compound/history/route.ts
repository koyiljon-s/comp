import { getAddress, isAddress } from "viem";
import { getRecentActivity } from "@/lib/compound/reader";

export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get("address")?.trim();

  if (!address || !isAddress(address)) {
    return Response.json(
      { error: "Provide a valid EVM account address." },
      { status: 400 },
    );
  }

  try {
    const activity = await getRecentActivity(getAddress(address));

    return Response.json({ activity });
  } catch (error) {
    console.error("Failed to read Compound activity", error);

    return Response.json(
      { error: "Could not read recent activity right now. Please retry." },
      { status: 502 },
    );
  }
}
