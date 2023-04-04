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
import { buildHistory, DataNftOnNetwork, timeSince, TokenTableProps, TransactionInTable } from "./Components/tableUtils";
import { TransactionOnNetwork } from "@multiversx/sdk-network-providers/out";
import { DataNftMarketContract } from "MultiversX/dataNftMarket";
import { init } from "@sentry/browser";

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
    let dataNfts: DataNftOnNetwork[] = [];
    axios.get(`https://${apiUrl}/accounts/erd1qqqqqqqqqqqqqpgqw29wx58pzm7zau2zcprfk93a60hw8vnvfsxs25rqjm/transactions?status=success&function=cancelOffer%2CaddOffer%2CacceptOffer%2CchangeOfferPrice&size=10000&order=asc`).then((res) => {
      const txs = res.data;
      console.log(txs);
      DataNftOnNetwork.ids = [];
      DataNftOnNetwork.addOfferIndex = 0;
      dataNfts = txs.map((tx: any) =>
        DataNftOnNetwork.fromTransactionOnNetwork(TransactionOnNetwork.fromProxyHttpResponse(tx.txHash, tx), props.tokenId)
      ).filter((data: DataNftOnNetwork) => data?.transfers[0]?.properties?.identifier === props.tokenId || DataNftOnNetwork.ids.includes(parseInt(data?.methodArgs[0], 16)));
      console.log(DataNftOnNetwork.ids);
      const history = buildHistory(dataNfts);
      console.log(dataNfts);
      setData(history);
    });
  }, []);

  return <DataTable columns={columns} data={data} />;
}
