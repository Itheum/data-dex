import { TokenPayment } from "@multiversx/sdk-core/out";
import { TransactionLogs, TransactionOnNetwork } from "@multiversx/sdk-network-providers/out";
import { TransactionDecoder, TransactionMetadataTransfer } from "@multiversx/sdk-transaction-decoder/lib/src/transaction.decoder";
import { compareItems, RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import { ColumnDef, FilterFn, SortingFn, sortingFns } from "@tanstack/react-table";
import { convertWeiToEsdt } from "libs/util";

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

export type DataTableProps<Data extends object> = {
  data: Data[];
  columns: ColumnDef<Data, any>[];
};

export type TokenTableProps = {
  tokenId?: string;
  offerId?: string | number;
  page: number;
};

export type TransactionInTable = {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  method: string;
  value: string;
};

export class DataNftOnNetwork {
  static addOfferIndex = 0;
  static ids: number[] = [];
  static token_identifier?= "";

  id = 0;
  hash = "";
  timestamp = 0;
  from = "";
  to = "";
  method = "";
  methodArgs = [""];
  value = "";
  transfers: TransactionMetadataTransfer[] = [new TransactionMetadataTransfer()];


  constructor(init?: Partial<DataNftOnNetwork>) {
    Object.assign(this, init);
  }


  static fromTransactionOnNetwork(payload: TransactionOnNetwork): DataNftOnNetwork {
    const metadata = new TransactionDecoder().getTransactionMetadata(
      {
        sender: payload.sender.bech32(),
        receiver: payload.receiver.bech32(),
        data: payload.data.toString("base64"),
        value: payload.value,
      });

    const result = new DataNftOnNetwork();

    result.hash = payload["hash"] || "";
    result.timestamp = payload["timestamp"] || 0;
    result.to = payload.receiver.bech32() || "";
    result.from = payload.sender.bech32() || "";
    result.method = metadata["functionName"] || "";
    result.methodArgs = metadata["functionArgs"] || [""];
    result.value = payload["value"] || "";
    result.transfers = metadata["transfers"] || [new TransactionMetadataTransfer()];



    if (result.method === "addOffer") {
      DataNftOnNetwork.addOfferIndex += 1;
      result.id = DataNftOnNetwork.addOfferIndex;

      if (result.transfers[0].properties?.identifier === DataNftOnNetwork.token_identifier) {
        DataNftOnNetwork.ids.push(result.id);
      }
    }
    return result;
  }

}

export const buildHistory = (payload: DataNftOnNetwork[]): TransactionInTable[] => {

  const result: TransactionInTable[] = [];


  payload.forEach((item) => {
    let value = "";
    switch (item.method) {
      case "addOffer":
        value = item.transfers[0].value.toString();
        break;
      case "acceptOffer":
        value = convertWeiToEsdt(Number(item.transfers[0].value)).toString();
        break;
      case "changeOfferPrice":
        value = convertWeiToEsdt(parseInt(item.methodArgs[1], 16)).toString();
        break;
      case "cancelOffer":
        value = parseInt(item.methodArgs[1], 16).toString();
        break;
    }
    result.push({
      hash: item.hash,
      timestamp: item.timestamp,
      from: item.from,
      to: item.to,
      method: item.method,
      value: value
    });
  });
  return result.reverse();
};


export const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

export const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0;

  // Only sort by rank if the column has ranking information
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      rowA.columnFiltersMeta[columnId]?.itemRank!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      rowB.columnFiltersMeta[columnId]?.itemRank!
    );
  }
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

export function timeSince(unixTimestamp: number) {
  const seconds = Math.floor((new Date().getTime() - unixTimestamp * 1000) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}
