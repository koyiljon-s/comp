import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [metaMask()],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL),
  },
});
