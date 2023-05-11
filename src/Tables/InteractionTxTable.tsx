import React, { useEffect, useState, useMemo } from "react";
import { ExternalLinkIcon, WarningTwoIcon } from "@chakra-ui/icons";
import { Box, HStack, Link, Spinner, useToast } from "@chakra-ui/react";
import { TransactionOnNetwork } from "@multiversx/sdk-network-providers/out";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { CHAIN_TX_VIEWER, uxConfig } from "libs/util";
import { getApi } from "MultiversX/api";
import { useChainMeta } from "store/ChainMetaContext";
import ShortAddress from "UtilComps/ShortAddress";
import { DataTable } from "./Components/DataTable";
import { InteractionsInTable, timeSince } from "./Components/tableUtils";

export default function InteractionTxTable(props: { address: string }) {
  const { chainMeta: _chainMeta } = useChainMeta();
  const [data, setData] = useState<InteractionsInTable[]>([]);
  const [loadingInteractions, setLoadingInteractions] = useState(-1);
  const toast = useToast();

  const linkIconStyle = { display: "flex" };
  const columns = useMemo<ColumnDef<InteractionsInTable, any>[]>(
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
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        footer: (footerProps) => footerProps.column.id,
      },
      {
        id: "method",
        accessorFn: (row) => row.method,
        header: "Method",
        footer: (footerProps) => footerProps.column.id,
      },
    ],
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      const interactions = await getInteractionTransactions(props.address, _chainMeta.contracts.dataNftMint, _chainMeta.contracts.market, _chainMeta.networkId);
      if ("error" in interactions) {
        toast({
          title: "ER4: Could not get your recent transactions from the MultiversX blockchain.",
          status: "error",
          isClosable: true,
          duration: null,
        });

        setLoadingInteractions(-2);
      } else {
        setData(interactions as any);
        setLoadingInteractions(0);
      }
    };
    fetchData();
  }, []);
  return (
    <>
      {((loadingInteractions === -1 || loadingInteractions === -2) && (
        <Box minH="150" alignItems="center" display="flex" justifyContent="center">
          {loadingInteractions === -1 ? <Spinner size="lg" /> : <WarningTwoIcon />}
        </Box>
      )) || <DataTable columns={columns} data={data} /> || (
          <Box minH="150" alignItems="center" display="flex" justifyContent="center">
            No interactions yet...
          </Box>
        )}
    </>
  );
}

export const getInteractionTransactions = async (
  address: string,
  minterSmartContractAddress: string,
  marketSmartContractAddress: string,
  networkId: string
) => {
  const api = getApi(networkId);

  try {
    const minterTxs = `https://${api}/accounts/${address}/transactions?size=50&status=success&senderOrReceiver=${minterSmartContractAddress}`;
    const marketTxs = `https://${api}/accounts/${address}/transactions?size=50&status=success&senderOrReceiver=${marketSmartContractAddress}`;
    const selfTxs = `https://${api}/accounts/${address}/transactions?size=50&status=success&function=addOffer%2Cburn&senderOrReceiver=${address}`;

    const [minterResp, marketResp, selfResp] = await Promise.all([
      axios.get(minterTxs, { timeout: uxConfig.mxAPITimeoutMs }),
      axios.get(marketTxs, { timeout: uxConfig.mxAPITimeoutMs }),
      axios.get(selfTxs, { timeout: uxConfig.mxAPITimeoutMs }),
    ]);

    const allTransactions = [...minterResp.data, ...marketResp.data, ...selfResp.data];

    const transactions: any[] = [];

    const transactionTypes: Record<string, string> = {
      mint: "Minted Data NFT",
      burn: "Burned Data NFT",
      cancelOffer: "Removed offer",
      addOffer: "Added offer",
      changeOfferPrice: "Changed offer price",
      acceptOffer: "Accepted offer",
    };

    allTransactions.forEach((tx: any) => {
      if (["mint", "burn", "acceptOffer", "cancelOffer", "addOffer", "changeOfferPrice"].includes(tx["function"])) {
        const transaction: InteractionsInTable = {
          timestamp: parseInt(tx["timestamp"]),
          hash: tx["txHash"],
          status: tx["status"],
          method: transactionTypes[tx["function"]],
        };
        transactions.push(transaction);
      }
    });

    transactions.sort((a, b) => b.timestamp - a.timestamp);

    return transactions;
  } catch (error) {
    console.error(error);
    return { error };
  }
};
