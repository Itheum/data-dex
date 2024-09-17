import { getChainID } from "@multiversx/sdk-dapp/utils";
import { getApiDataDex } from "libs/utils";
import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

//   updateIsLoadingSol(false);
// }
export async function fetchSolNfts(solAddress: string | undefined) {
  if (!solAddress) {
    return [];
  } else {
    const resp = await fetch(`${getApiDataDex(getChainID())}/bespoke/sol/getDataNFTsByOwner?publicKeyb58=${solAddress}`);
    const data = await resp.json();

    return data.nfts;
  }
}
