import axios from "axios";
import { NetworkIdType } from "libs/types";
import { backendApi } from "libs/utils";
import { uxConfig } from ".";
import { OfferType } from "./types";

export async function getHealthCheckFromBackendApi(
  networkId: NetworkIdType,
): Promise<boolean> {
  try {
    const url = `${backendApi(networkId)}/health-check`;
    const { data } = await axios.get<string>(url, {
      timeout: uxConfig.mxAPITimeoutMs,
    });

    return data == "OK";
  } catch (error) {
    console.error(error);
    return false;
  }
}


export async function getOffersCountFromBackendApi(
  networkId: NetworkIdType,
  address?: string,
): Promise<number> {
  try {
    const url = address ? `${backendApi(networkId)}/offers/${address}/count` : `${backendApi(networkId)}/offers/count`;
    const { data } = await axios.get<number>(url, {
      timeout: uxConfig.mxAPITimeoutMs,
    });

    return data;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

export async function getOffersFromBackendApi(
  networkId: NetworkIdType,
  from: number,
  size: number,
): Promise<OfferType[]> {
  try {
    const url = `${backendApi(networkId)}/offers?from=${from}&size=${size}`;
    const { data } = await axios.get<OfferType[]>(url, {
      timeout: uxConfig.mxAPITimeoutMs,
    });

    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getRecentOffersFromBackendApi(
  networkId: NetworkIdType,
): Promise<OfferType[]> {
  try {
    const url = `${backendApi(networkId)}/offers/recent`;
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
  networkId: NetworkIdType,
  identifier: string,
  nonces: number[],
  from?: number,
  size?: number,
): Promise<OfferType[]> {
  if (nonces.length === 0) {
    throw Error("getOffersByIdAndNoncesFromBackendApi: nonces must not be empty.");
  }

  let url = `${backendApi(networkId)}/offers/${identifier}?nonces=${nonces.join(',')}`;
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
