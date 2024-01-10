import { MarketplaceRequirements } from "@itheum/sdk-mx-data-nft/out";
import axios from "axios";
import { backendApi } from "libs/utils";
import { uxConfig } from ".";
import { OfferType } from "./types";

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

export async function getOffersFromBackendApi(chainID: string, from: number, size: number, address?: string): Promise<OfferType[]> {
  try {
    let url = `${backendApi(chainID)}/offers?from=${from}&size=${size}`;
    if (address) {
      url += `&address=${address}`;
    }
    const { data } = await axios.get<OfferType[]>(url, {
      timeout: uxConfig.mxAPITimeoutMs,
    });
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getRecentOffersFromBackendApi(chainID: string): Promise<OfferType[]> {
  try {
    const url = `${backendApi(chainID)}/offers/recent`;
    const { data } = await axios.get<OfferType[]>(url, {
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
): Promise<OfferType[]> {
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

  const { data } = await axios.get<OfferType[]>(url, {
    timeout: uxConfig.mxAPITimeoutMs,
  });

  return data;
}

export async function getMarketRequirements(chainID: string): Promise<MarketplaceRequirements | undefined> {
  try {
    const url = `${backendApi(chainID)}/marketplace-requirements`;
    const { data } = await axios.get<MarketplaceRequirements>(url);

    return data;
  } catch (error) {
    console.error(error);
  }
}
