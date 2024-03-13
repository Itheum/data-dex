import { compareItems, RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import { ColumnDef, FilterFn, SortingFn, sortingFns } from "@tanstack/react-table";

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
  buyer_fee?: number;
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

export type InteractionsInTable = {
  hash: string;
  timestamp: number;
  method: string;
  status: string;
  value: string;
  data: string;
};

export type ClaimsInTable = {
  hash: string;
  timestamp: number;
  claimType: string;
  amount: number;
};

export type BridgeDepositsInTable = {
  hash: string;
  timestamp: number;
  status: string;
  amount: number;
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

export function timeSince(unixTimestamp: number): string {
  const seconds = Math.floor((new Date().getTime() - unixTimestamp * 1000) / 1000);

  const intervals = [
    { seconds: 3153600000, unit: "century" },
    { seconds: 31536000, unit: "year" },
    { seconds: 2592000, unit: "month" },
    { seconds: 86400, unit: "day" },
    { seconds: 3600, unit: "hour" },
    { seconds: 60, unit: "minute" },
    { seconds: 1, unit: "second" },
  ];
  const interval = intervals.find((i) => i.seconds <= seconds) ?? intervals[0];

  const count = Math.floor(seconds / interval!.seconds);
  const unit = count === 1 ? interval!.unit : interval!.unit + "s";

  return `${count} ${unit}`;
}
