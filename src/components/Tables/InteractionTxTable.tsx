import React, { useEffect, useState, useMemo } from "react";
import { ExternalLinkIcon, WarningTwoIcon } from "@chakra-ui/icons";
import { Box, HStack, Link, Spinner, useToast } from "@chakra-ui/react";
import { MarketplaceRequirements } from "@itheum/sdk-mx-data-nft/out";
import { IAddress } from "@multiversx/sdk-core/out";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { TransactionDecoder } from "@multiversx/sdk-transaction-decoder/lib/src/transaction.decoder";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import ShortAddress from "components/UtilComps/ShortAddress";
import { CHAIN_TX_VIEWER, contractsForChain, uxConfig } from "libs/config";
import { getBespokeOnChainDataData } from "libs/MultiversX/api";
import { getMvxRpcApi } from "libs/MultiversX/api";
import { convertWeiToEsdt } from "libs/utils";
import { useMarketStore } from "store";
import { DataTable } from "./Components/DataTable";
import { InteractionsInTable, timeSince } from "./Components/tableUtils";

export default function InteractionTxTable(props: { address: string }) {
  const {
    network: { chainId: chainID },
  } = useGetNetworkConfig();
  const [data, setData] = useState<InteractionsInTable[]>([]);
  const marketRequirements = useMarketStore((state) => state.marketRequirements);
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
            <Link href={`${CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER]}/transactions/${cellProps.getValue()}`} isExternal style={linkIconStyle}>
              <ExternalLinkIcon />
            </Link>
          </HStack>
        ),
        header: "Hash",
        footer: (footerProps) => footerProps.column.id,
      },
      {
        id: "age",
        accessorFn: (row) => row.timestamp,
        header: "Age",
        cell: (cellProps) => timeSince(cellProps.getValue()),
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
            ? `${CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER]}/tokens/${cellProps.getValue()}`
            : `${CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER]}/nfts/${cellProps.getValue()}`;

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
      if (!props.address || !contractsForChain(chainID).dataNftTokens[0].contract || !contractsForChain(chainID).market) return;
      const interactions = await getInteractionTransactions(
        props.address,
        contractsForChain(chainID).dataNftTokens[0].contract,
        contractsForChain(chainID).market,
        chainID,
        marketRequirements
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
  minterSmartContractAddress: IAddress,
  marketSmartContractAddress: IAddress,
  chainID: string,
  marketRequirements: MarketplaceRequirements
) => {
  const api = getMvxRpcApi(chainID);
  try {
    const minterTxsData = await getBespokeOnChainDataData(
      `https://${api}/accounts/${address}/transactions?size=50&status=success&senderOrReceiver=${minterSmartContractAddress}&withOperations=true`,
      2 * 60 * 1000
    );
    const marketTxsData = await getBespokeOnChainDataData(
      `https://${api}/accounts/${address}/transactions?size=50&status=success&senderOrReceiver=${marketSmartContractAddress}&withOperations=true`,
      2 * 60 * 1000
    );
    const selfTxsAddOfferData = await getBespokeOnChainDataData(
      `https://${api}/accounts/${address}/transactions?size=50&status=success&function=addOffer&senderOrReceiver=${address}&withOperations=true`,
      2 * 60 * 1000
    );
    const selfTxsBurnData = await getBespokeOnChainDataData(
      `https://${api}/accounts/${address}/transactions?size=50&status=success&function=burn&senderOrReceiver=${address}&withOperations=true`,
      2 * 60 * 1000
    );

    const allTransactions = [...minterTxsData, ...marketTxsData, ...selfTxsAddOfferData, ...selfTxsBurnData];

    // const minterTxs = `https://${api}/accounts/${address}/transactions?size=50&status=success&senderOrReceiver=${minterSmartContractAddress}&withOperations=true`;
    // const marketTxs = `https://${api}/accounts/${address}/transactions?size=50&status=success&senderOrReceiver=${marketSmartContractAddress}&withOperations=true`;
    // const selfTxsAddOffer = `https://${api}/accounts/${address}/transactions?size=50&status=success&function=addOffer&senderOrReceiver=${address}&withOperations=true`;
    // const selfTxsBurn = `https://${api}/accounts/${address}/transactions?size=50&status=success&function=burn&senderOrReceiver=${address}&withOperations=true`;

    // const [minterResp, marketResp, selfResp, selfRespBurn] = await axios.all([
    //   axios.get(minterTxs, { timeout: uxConfig.mxAPITimeoutMs }),
    //   axios.get(marketTxs, { timeout: uxConfig.mxAPITimeoutMs }),
    //   axios.get(selfTxsAddOffer, { timeout: uxConfig.mxAPITimeoutMs }),
    //   axios.get(selfTxsBurn, { timeout: uxConfig.mxAPITimeoutMs }),
    // ]);

    // const allTransactions = [...minterResp.data, ...marketResp.data, ...selfResp.data, ...selfRespBurn.data];

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

      value = metadata?.functionArgs?.[1] ? convertWeiToEsdt(parseInt(metadata.functionArgs![1], 16)).toString() : "NaN";
      data = contractsForChain(chainID).itheumToken;

      if (["mint", "burn", "acceptOffer", "cancelOffer", "addOffer", "changeOfferPrice"].includes(tx["function"])) {
        data = contractsForChain(chainID).itheumToken;
        if (Array.isArray(tx.operations)) {
          for (const operation of tx.operations) {
            if (operation.action === "transfer") {
              if (["acceptOffer", "addOffer", "cancelOffer"].includes(tx["function"]) && marketRequirements.acceptedTokens.includes(operation.collection)) {
                value = `${operation.value}`;
                data = operation.identifier;
              }
            }
            if (operation.action === "create" || operation.action === "burn") {
              value = `${operation.value}`;
              data = operation.identifier;
              break;
            }
          }
        }

        if (value != "NaN") {
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
      }
    });

    transactions.sort((a, b) => b.timestamp - a.timestamp);

    return transactions;
  } catch (error) {
    console.error(error);
    return { error };
  }
};
