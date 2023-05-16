import React, { useEffect, useState, useMemo } from "react";
import { ExternalLinkIcon, WarningTwoIcon } from "@chakra-ui/icons";
import { Box, HStack, Link, Spinner, useToast } from "@chakra-ui/react";
import { TransactionOnNetwork } from "@multiversx/sdk-network-providers/out";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { CHAIN_TX_VIEWER, convertWeiToEsdt, uxConfig } from "libs/util";
import { getApi } from "MultiversX/api";
import { useChainMeta } from "store/ChainMetaContext";
import ShortAddress from "UtilComps/ShortAddress";
import { DataTable } from "./Components/DataTable";
import { InteractionsInTable, timeSince } from "./Components/tableUtils";
import { TransactionDecoder } from "@multiversx/sdk-transaction-decoder/lib/src/transaction.decoder";

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
      {
        id: "data",
        accessorFn: (row) => row.data,
        header: "Data",
        cell: (cellProps) => {
          const { row } = cellProps;
          const isChangeOfferPrice = row.original.method === "Changed offer price";

          const linkHref = isChangeOfferPrice
            ? `${CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER]}/tokens/${cellProps.getValue()}`
            : `${CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER]}/nfts/${cellProps.getValue()}`;

          return <Link href={linkHref}>{cellProps.getValue()}</Link>;
        },
        footer: (footerProps) => footerProps.column.id,
      },
      {
        id: "value",
        accessorFn: (row) => row.value,
        header: "Value",
        footer: (footerProps) => footerProps.column.id,
      },
    ],
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      const interactions = await getInteractionTransactions(
        props.address,
        _chainMeta.contracts.dataNftMint,
        _chainMeta.contracts.market,
        _chainMeta.networkId,
        _chainMeta
      );
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
  networkId: string,
  chainMeta: any
) => {
  const api = getApi(networkId);

  try {
    const minterTxs = `https://${api}/accounts/${address}/transactions?size=50&status=success&senderOrReceiver=${minterSmartContractAddress}&withOperations=true`;
    const marketTxs = `https://${api}/accounts/${address}/transactions?size=50&status=success&senderOrReceiver=${marketSmartContractAddress}&withOperations=true`;
    const selfTxs = `https://${api}/accounts/${address}/transactions?size=50&status=success&function=addOffer%2Cburn&senderOrReceiver=${address}&withOperations=true`;

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
      let data = "";
      let value = "";
      const metadata = new TransactionDecoder().getTransactionMetadata({
        sender: tx.sender.bech32,
        receiver: tx.receiver.bech32,
        data: tx.data.toString("base64"),
        value: tx.value,
      });

      value = convertWeiToEsdt(parseInt(metadata.functionArgs![1], 16)).toString();
      data = chainMeta.contracts.itheumToken;
      if (["mint", "burn", "acceptOffer", "cancelOffer", "addOffer", "changeOfferPrice"].includes(tx["function"])) {
        if (Array.isArray(tx.operations)) {
          for (const operation of tx.operations) {
            if (["acceptOffer", "addOffer", "cancelOffer"].includes(tx["function"]) && operation.action === "transfer") {
              value = `${operation.value}`;
              data = operation.identifier;
            }
            if (operation.action === "create" || operation.action === "burn") {
              value = `${operation.value}`;
              data = operation.identifier;
              break;
            }
          }
        }
        const transaction: InteractionsInTable = {
          timestamp: parseInt(tx["timestamp"]),
          hash: tx["txHash"],
          status: tx["status"],
          method: transactionTypes[tx["function"]],
          value,
          data,
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
