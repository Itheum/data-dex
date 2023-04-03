import React, { useEffect, useState, useMemo } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { HStack, Link } from "@chakra-ui/react";
import { Address } from "@multiversx/sdk-core/out";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { CHAIN_TX_VIEWER } from "libs/util";
import { getApi } from "MultiversX/api";
import { useChainMeta } from "store/ChainMetaContext";
import ShortAddress from "UtilComps/ShortAddress";
import { DataTable } from "./Components/DataTable";
import { DataNftOnNetwork, timeSince, TokenTableProps, TransactionInTable } from "./Components/tableUtils";
import { TransactionOnNetwork } from "@multiversx/sdk-network-providers/out";

export default function TokenTxTable(props: TokenTableProps) {
  const { chainMeta: _chainMeta, setChainMeta } = useChainMeta();
  const [data, setData] = useState<TransactionInTable[]>([]);

  const linkIconStyle = { display: "flex" };
  const columns = useMemo<ColumnDef<TransactionInTable, any>[]>(
    () => [
      {
        id: "hash",
        accessorFn: (row) => row.hash,
        cell: (cellProps) => (
          <HStack>
            <ShortAddress address={cellProps.getValue()} />
            <Link
              href={`${CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER]}/transactions/${cellProps.getValue()}`}
              isExternal
              style={linkIconStyle}>
              <ExternalLinkIcon />
            </Link>
          </HStack>
        ),
        header: "Hash",
        footer: (footerProps) => footerProps.column.id,
      },
      {
        id: "age",
        accessorFn: (row) => timeSince(row.timestamp),
        header: "Age",
        footer: (footerProps) => footerProps.column.id,
      },
      {
        id: "from",
        accessorFn: (row) => row.from,
        cell: (cellProps) => (
          <HStack>
            <ShortAddress address={cellProps.getValue()} />
            <Link
              href={`${CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER]}/accounts/${cellProps.getValue()}`}
              isExternal
              style={linkIconStyle}>
              <ExternalLinkIcon />
            </Link>
          </HStack>
        ),
        header: "From",
        footer: (footerProps) => footerProps.column.id,
      },
      {
        id: "to",
        accessorFn: (row) => row.to,
        cell: (cellProps) => (
          <HStack>
            <ShortAddress address={cellProps.getValue()} />
            <Link
              href={`${CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER]}/accounts/${cellProps.getValue()}`}
              isExternal
              style={linkIconStyle}>
              <ExternalLinkIcon />
            </Link>
          </HStack>
        ),
        header: "To",
        footer: (footerProps) => footerProps.column.id,
      },
      {
        id: "method",
        accessorFn: (row) => row.method,
        header: "Method",
        footer: (footerProps) => footerProps.column.id,
      },
      {
        id: "amount",
        accessorFn: (row) => row.value,
        header: "Amount",
        footer: (footerProps) => footerProps.column.id,
      },
    ],
    []
  );

  useEffect(() => {
    const apiUrl = getApi(_chainMeta.networkId);
    axios.get(`https://${apiUrl}/accounts/erd1qqqqqqqqqqqqqpgqca3crd27vj8cruuxzkkma548fy8q69hxfsxsw2wxwy/transactions?status=success&function=addOffer%2CacceptOffer%2CchangePrice%2Cburn&size=10000`).then((res) => {
      const txs = res.data;
      const history = txs.map((tx: any) =>
        DataNftOnNetwork.fromTransactionOnNetwork(TransactionOnNetwork.fromApiHttpResponse(tx.txHash, tx))
      );
      console.log(props.tokenId);
      const filter = history.filter((tx: DataNftOnNetwork) => { tx?.transfers[0]?.properties["identifier"] === props.tokenId; });
      console.log(filter);

      const items = [];
      for (const tx of txs) {
        if (tx.action) {
          const transfers = tx.action.arguments.transfers.filter((t: any) => t.identifier === props.tokenId);
          const value = transfers.reduce((acc: any, t: any) => acc + parseInt(t.value), 0);
          items.push({
            hash: tx.txHash,
            timestamp: tx.timestamp,
            from: tx.sender,
            to: tx.action.arguments.receiver,
            method: tx.function,
            value: value,
          });
        }
      }
      setData(items);
    });
  }, []);

  return <DataTable columns={columns} data={data} />;
}
