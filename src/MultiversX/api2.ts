import axios from 'axios';
import { NftType } from '@multiversx/sdk-dapp/types/tokens.types';
import { uxConfig } from 'libs/util';

export const getApi = (networkId: string) => {
  if (networkId === 'E1') {
    return 'api.multiversx.com';
  } else {
    return 'devnet-api.multiversx.com';
  }
};

export const getNftsByIds = async (nftIds: string[], networkId: string): Promise<NftType[]> => {
  const api = getApi(networkId);
  try {
    const url = `https://${api}/nfts?identifiers=${nftIds.join(',')}`;
    const { data } = await axios.get<NftType[]>(url, { timeout: uxConfig.mxAPITimeoutMs });

    // match input and output order
    const sorted: NftType[] = [];
    for (const nftId of nftIds) {
      for (const nft of data) {
        if (nftId === nft.identifier) {
          sorted.push(nft);
          break;
        }
      }
    }

    // check length of input and output match
    if (nftIds.length !== sorted.length) {
      console.error('getNftsByIds failed');
      return [];
    }

    return sorted;
  } catch (error) {
    console.error(error);
    return [];
  }
};
