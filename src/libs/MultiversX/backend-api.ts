import { DataNftMarket, MarketplaceRequirements, Offer } from "@itheum/sdk-mx-data-nft/out";
import axios from "axios";
import { backendApi, convertEsdtToWei, tokenDecimals } from "libs/utils";
import { IS_DEVNET, uxConfig } from ".";
import { DataNftCollectionType, Favorite, TrendingNft } from "./types";
import { DataNFTCollectionObject } from "libs/utils/types/marketplace";

export async function getHealthCheckFromBackendApi(chainID: string): Promise<boolean> {
  try {
    const url = `${backendApi(chainID)}/health-check`;
    const { data } = await axios.get<string>(url, {
      timeout: uxConfig.mxAPITimeoutMs,
    });

    return data == "OK";
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getFavoritesFromBackendApi(chainId: string, bearerToken: string): Promise<Array<string>> {
  try {
    const url = `${backendApi(chainId)}/favorites`;
    const { data } = await axios.get<Array<string>>(url, {
      timeout: uxConfig.mxAPITimeoutMs,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function addFavoriteToBackendApi(chainID: string, tokenIdentifier: string, bearerToken: string): Promise<Favorite> {
  try {
    const url = `${backendApi(chainID)}/addFavorite`;
    const { data } = await axios.post<Favorite>(
      url,
      {
        identifier: tokenIdentifier,
      },
      {
        timeout: uxConfig.mxAPITimeoutMs,
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error(error);
    return {} as Favorite;
  }
}

export async function getAddressBoughtOffersFromBackendApi(chainId: string, bearerToken: string): Promise<Array<string>> {
  try {
    const url = `${backendApi(chainId)}/addressBoughtOffers`;
    const { data } = await axios.get<any>(url, {
      timeout: uxConfig.mxAPITimeoutMs,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getVolumes(chainId: string, bearerToken: string, identifiers: string): Promise<any> {
  try {
    const url = `${backendApi(chainId)}/volumes`;
    const { data } = await axios.get<any>(url, {
      params: {
        identifiers: identifiers,
      },
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      timeout: uxConfig.mxAPITimeoutMs,
    });
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getTopVolumes(chainId: string, bearerToken: string, limit: number): Promise<any> {
  try {
    const url = `${backendApi(chainId)}/volumes/top`;
    const { data } = await axios.get<any>(url, {
      params: {
        limit: limit,
      },
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      timeout: uxConfig.mxAPITimeoutMs,
    });
    console.log("Data volumes top:", data);
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updateOfferSupplyOnBackend(chainID: string, bearerToken: string, index: number, supply: number) {
  try {
    const headers = {
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
    };

    const requestBody = { supply: supply };
    const response = await fetch(`${backendApi(chainID)}/updateOffer/${index}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    });
    if (response.ok) {
      console.log("Response:", response.ok);
    }
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function updatePriceOnBackend(chainID: string, bearerToken: string, index: number, newPrice: string) {
  try {
    const headers = {
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
    };

    const requestBody = { price: newPrice };
    const response = await fetch(`${backendApi(chainID)}/updateOffer/${index}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      console.log("Response:", response.ok);
    }
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function removeFavoriteFromBackendApi(chainID: string, tokenIdentifier: string, bearerToken: string): Promise<Favorite> {
  try {
    const url = `${backendApi(chainID)}/removeFavorite`;
    const { data } = await axios.post<Favorite>(
      url,
      {
        identifier: tokenIdentifier,
      },
      {
        timeout: uxConfig.mxAPITimeoutMs,
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error(error);
    return {} as Favorite;
  }
}

export async function getTrendingFromBackendApi(chainID: string): Promise<TrendingNft[]> {
  try {
    const url = `${backendApi(chainID)}/trending`;
    const { data } = await axios.get<TrendingNft[]>(url, {
      timeout: uxConfig.mxAPITimeoutMs,
    });
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getMarketplaceHealthCheckFromBackendApi(chainID: string): Promise<boolean> {
  try {
    const url = `${backendApi(chainID)}/health-check?marketplace=1`;
    const { data } = await axios.get<string>(url, {
      timeout: uxConfig.mxAPITimeoutMs,
    });

    return data == "OK";
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getOffersCountFromBackendApi(chainID: string, address?: string): Promise<number> {
  try {
    const url = address ? `${backendApi(chainID)}/offers/${address}/count` : `${backendApi(chainID)}/offers/count`;
    const { data } = await axios.get<number>(url, {
      timeout: uxConfig.mxAPITimeoutMs,
    });

    return data;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

export async function getOffersFromBackendApi(chainID: string, from: number, size: number, address?: string): Promise<Offer[]> {
  try {
    let url = `${backendApi(chainID)}/offers?from=${from}&size=${size}`;
    if (address) {
      url += `&address=${address}`;
    }
    const { data } = await axios.get<Offer[]>(url, {
      timeout: uxConfig.mxAPITimeoutMs,
    });
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getOfersAsCollectionFromBackendApi(chainID: string): Promise<DataNFTCollectionObject[]> {
  try {
    const url = `${backendApi(chainID)}/data-nfts`;

    const { data } = await axios.get<DataNFTCollectionObject[]>(url, {
      timeout: uxConfig.mxAPITimeoutMs,
    });
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getRecentOffersFromBackendApi(chainID: string): Promise<Offer[]> {
  try {
    const url = `${backendApi(chainID)}/offers/recent`;
    const { data } = await axios.get<Offer[]>(url, {
      timeout: uxConfig.mxAPITimeoutMs,
    });

    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getOffersByIdAndNoncesFromBackendApi(
  chainID: string,
  identifier: string,
  nonces: number[],
  from?: number,
  size?: number
): Promise<Offer[]> {
  if (nonces.length === 0) {
    throw Error("getOffersByIdAndNoncesFromBackendApi: nonces must not be empty.");
  }

  let url = `${backendApi(chainID)}/offers/${identifier}?nonces=${nonces.join(",")}`;
  if (from != null) {
    url += `&from=${from}`;
  }
  if (size != null) {
    url += `&size=${size}`;
  }

  const { data } = await axios.get<Offer[]>(url, {
    timeout: uxConfig.mxAPITimeoutMs,
  });
  return data;
}

export async function getMarketRequirements(): Promise<MarketplaceRequirements | undefined> {
  const dataNftMarketplace = new DataNftMarket(IS_DEVNET ? "devnet" : "mainnet");
  try {
    return dataNftMarketplace.viewRequirements();
  } catch (error) {
    console.error(error);
  }
}
