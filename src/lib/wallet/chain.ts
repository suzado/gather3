import { kaolin } from "@arkiv-network/sdk/chains";
import { mendoza } from "@arkiv-network/sdk/chains";

const chains = { kaolin, mendoza } as const;
type ChainName = keyof typeof chains;

const envChain = process.env.NEXT_PUBLIC_ARKIV_CHAIN as ChainName | undefined;
export const arkivChain = chains[envChain ?? "kaolin"];
