import React, { useEffect, useState, useMemo } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { HStack, Link } from '@chakra-ui/react';
import { Address } from "@multiversx/sdk-core/out";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { CHAIN_TX_VIEWER } from "libs/util";
import { getApi } from "MultiversX/api";
import { useChainMeta } from "store/ChainMetaContext";
import ShortAddress from "UtilComps/ShortAddress";
import { DataTable } from "./Components/DataTable";
import { timeSince, TokenTableProps, TransactionInTable } from "./Components/tableUtils";
export default function TokenTxTable(props: TokenTableProps) {
  const { chainMeta: _chainMeta, setChainMeta } = useChainMeta();
  const [data, setData] = useState<TransactionInTable[]>([]);

  const linkIconStyle = { display: 'flex' };
  const columns = useMemo<ColumnDef<TransactionInTable, any>[]>(
    () => [
      {
        id: 'hash',
        accessorFn: (row) => row.hash,
        cell: (cellProps) =>
          <HStack>
            <ShortAddress address={cellProps.getValue()} />
            <Link href={`${CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER]}/transactions/${cellProps.getValue()}`} isExternal style={linkIconStyle}>
              <ExternalLinkIcon />
            </Link>
          </HStack>,
        header: 'Hash',
        footer: (footerProps) => footerProps.column.id
      }, {
        id: 'age',
        accessorFn: (row) => timeSince(row.timestamp),
        header: 'Age',
        footer: (footerProps) => footerProps.column.id
      }, {
        id: 'from',
        accessorFn: (row) => row.from,
        cell: (cellProps) =>
          <HStack>
            <ShortAddress address={cellProps.getValue()} />
            <Link href={`${CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER]}/accounts/${cellProps.getValue()}`} isExternal style={linkIconStyle}>
              <ExternalLinkIcon />
            </Link>
          </HStack>,
        header: 'From',
        footer: (footerProps) => footerProps.column.id
      }, {
        id: 'to',
        accessorFn: (row) => row.to,
        cell: (cellProps) =>
          <HStack>
            <ShortAddress address={cellProps.getValue()} />
            <Link href={`${CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER]}/accounts/${cellProps.getValue()}`} isExternal style={linkIconStyle}>
              <ExternalLinkIcon />
            </Link>
          </HStack>,
        header: 'To',
        footer: (footerProps) => footerProps.column.id
      }, {
        id: 'method',
        accessorFn: (row) => row.method,
        header: 'Method',
        footer: (footerProps) => footerProps.column.id
      }, {
        id: 'value',
        accessorFn: (row) => row.value,
        header: 'Value',
        footer: (footerProps) => footerProps.column.id
      }],
    []
  );

  useEffect(() => {
    const apiUrl = getApi(_chainMeta.networkId);
    console.log('apiUrl', `${apiUrl}/transactions?token=${props.tokenId}&status=success&size=10000`);
    axios.get(`https://${apiUrl}/transactions?token=${props.tokenId}&status=success&size=10000`).then((res) => {
      const txs = res.data;
      setData(txs.map((tx: any) => {
        const transfers = tx.action.arguments.transfers.filter((t: any) => t.identifier === props.tokenId);
        const value = transfers.reduce((acc: any, t: any) => acc + parseInt(t.value), 0);
        return {
          hash: tx.txHash,
          timestamp: tx.timestamp,
          from: tx.sender,
          to: tx.action.arguments.receiver,
          method: tx.function,
          value: value,
        };
      }));
    });
  }, []);

  return <DataTable columns={columns} data={data} />;
}