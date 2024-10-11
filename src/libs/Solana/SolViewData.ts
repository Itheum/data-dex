import { PublicKey } from "@solana/web3.js";
import { getApiDataMarshal } from "libs/utils";
import { SolEnvEnum } from "./config";

export async function itheumSolPreaccess() {
  const chainId = import.meta.env.VITE_ENV_NETWORK === "devnet" ? SolEnvEnum.devnet : SolEnvEnum.mainnet;
  const preaccessUrl = `${getApiDataMarshal(chainId)}/preaccess?chainId=${chainId}`;
  const response = await fetch(preaccessUrl);
  const data = await response.json();
  return data.nonce;
}

export async function itheumSolViewData(
  assetId: string,
  nonce: string,
  signature: string,
  address: PublicKey,
  fwdHeaderKeys?: string[],
  headers?: any,
  streamInLine?: boolean,
  nestedIdxToStream?: number
): Promise<Response> {
  const chainId = import.meta.env.VITE_ENV_NETWORK === "devnet" ? SolEnvEnum.devnet : SolEnvEnum.mainnet;
  let accessUrl = `${getApiDataMarshal(chainId)}/access?nonce=${nonce}&NFTId=${assetId}&signature=${signature}&chainId=${chainId}&accessRequesterAddr=${address.toBase58()}`;
  if (streamInLine) {
    accessUrl += `&streamInLine=1`;
  }
  if (nestedIdxToStream !== undefined) {
    accessUrl += `&nestedIdxToStream=${nestedIdxToStream}`;
  }
  if (fwdHeaderKeys && fwdHeaderKeys.length > 0) {
    accessUrl += `&fwdHeaderKeys=${fwdHeaderKeys.join(",")}`;
  }
  const response = await fetch(accessUrl, { headers });
  return response;
}

export async function itheumSolViewDataInNewTab(assetId: string, nonce: string, signature: string, address: PublicKey) {
  const response = await itheumSolViewData(assetId, nonce, signature, address, import.meta.env.VITE_ENV_NETWORK);
  const data = await response.blob();
  const url = window.URL.createObjectURL(data);
  window.open(url, "_blank");
}
