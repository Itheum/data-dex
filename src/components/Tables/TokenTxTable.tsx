import React, { useEffect, useState, useMemo } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { HStack, Link, Spinner, Flex } from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { TransactionOnNetwork } from "@multiversx/sdk-network-providers/out";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import ShortAddress from "components/UtilComps/ShortAddress";
import { CHAIN_TX_VIEWER } from "libs/config";
import { getApi } from "libs/MultiversX/api";
import { DataNftMarketContract } from "libs/MultiversX/dataNftMarket";
import { DataTable } from "./Components/DataTable";
import { buildHistory, DataNftOnNetwork, timeSince, TokenTableProps, TransactionInTable } from "./Components/tableUtils";

export default function TokenTxTable(props: TokenTableProps) {
  const { chainID } = useGetNetworkConfig();
  const [data, setData] = useState<TransactionInTable[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const marketContract = new DataNftMarketContract(chainID);
  const linkIconStyle = { display: "flex" };

  const columns = useMemo<ColumnDef<TransactionInTable, any>[]>(
    () => [
      {
        id: "hash",
        accessorFn: (row) => row.hash,
        cell: (cellProps) => (
          <HStack>
            <ShortAddress address={cellProps.getValue()} fontSize="lg" />
            <Link href={`${CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER]}/transactions/${cellProps.getValue()}`} isExternal style={linkIconStyle}>
              <ExternalLinkIcon fontSize="lg" />
            </Link>
          </HStack>
        ),
        header: "Hash",
        footer: (footerProps) => footerProps.column.id,
      },
      {
        id: "from",
        accessorFn: (row) => row.from,
        cell: (cellProps) => (
          <HStack>
            <ShortAddress address={cellProps.getValue()} fontSize="lg" />
            <Link href={`${CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER]}/accounts/${cellProps.getValue()}`} isExternal style={linkIconStyle}>
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
            <ShortAddress address={cellProps.getValue()} fontSize="lg" />
            <Link href={`${CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER]}/accounts/${cellProps.getValue()}`} isExternal style={linkIconStyle}>
              <ExternalLinkIcon fontSize="lg" />
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
      {
        id: "age",
        accessorFn: (row) => row.timestamp,
        header: "Age",
        cell: (cellProps) => timeSince(cellProps.getValue()),
        footer: (footerProps) => footerProps.column.id,
      },
    ],
    []
  );

  useEffect(() => {
    const apiUrl = getApi(chainID);

    Promise.all([
      axios.get(`https://${apiUrl}/transactions?token=${props.tokenId}&status=success&size=1000&function=burn&order=asc`),
      axios.get(`https://${apiUrl}/accounts/${marketContract.dataNftMarketContractAddress}/transactions?status=success&size=10000&order=asc`),
    ]).then((responses) => {
      const mergedTransactions = getHistory(responses, props.tokenId);
      const history = buildHistory(mergedTransactions, props.buyer_fee);
      setData(history);
      setLoadingData(false);
    });
  }, []);

  return (
    <>
      {(loadingData && (
        <Flex padding="5px" minH="100px" mb="10px" alignItems="center" justifyContent="center">
          <Spinner speed="0.64s" color="teal.200" />
        </Flex>
      )) || <DataTable columns={columns} data={data} />}
    </>
  );
}

function getHistory(responses: any[], tokenId?: string) {
  DataNftOnNetwork.ids = [];
  DataNftOnNetwork.token_identifier = tokenId;
  DataNftOnNetwork.addOfferIndex = 0;
  const transactionsWithId: DataNftOnNetwork[] = [];

  responses.forEach((response: any) => {
    const txs = response.data;
    const transactions = txs.map((tx: any) => {
      if (["burn", "addOffer", "acceptOffer", "cancelOffer", "changeOfferPrice"].includes(tx.function)) {
        const transaction = TransactionOnNetwork.fromProxyHttpResponse(tx.txHash, tx);
        return DataNftOnNetwork.fromTransactionOnNetwork(transaction);
      }
    });
    const filteredTransactions = transactions.filter((data: DataNftOnNetwork) => {
      return data?.transfers[0]?.properties?.identifier === tokenId || DataNftOnNetwork.ids.includes(parseInt(data?.methodArgs[0], 16));
    });
    transactionsWithId.push(...filteredTransactions);
  });
  return transactionsWithId;
}
