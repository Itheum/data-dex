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
import { timeSince, TokenTableProps, TransactionInTable } from "./Components/tableUtils";
import { backendApi } from "libs/utils";

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
    async function getInteractions() {
      const api = backendApi(chainID);

      const response = await axios.get(`${api}/interactions/${props.tokenId}`);

      const interactions = response.data;

      const data: TransactionInTable[] = [];

      for (const interaction of interactions) {
        switch (interaction.method) {
          case "addOffer":
            data.push({
              hash: interaction.txHash,
              timestamp: interaction.timestamp,
              from: interaction.from,
              to: interaction.to,
              method: interaction.method,
              value: `${interaction.quantity} x ${interaction.price} ${interaction.priceTokenIdentifier}`,
            });
            break;
          case "acceptOffer":
            data.push({
              hash: interaction.txHash,
              timestamp: interaction.timestamp,
              from: interaction.seller,
              to: interaction.buyer,
              method: interaction.method,
              value: `${interaction.quantity} x ${interaction.price} ${interaction.priceTokenIdentifier}`,
            });

            break;

          case "cancelOffer":
            data.push({
              hash: interaction.txHash,
              timestamp: interaction.timestamp,
              from: interaction.from,
              to: interaction.to,
              method: interaction.method,
              value: `${interaction.quantity} x ${interaction.tokenIdentifier}`,
            });

            break;

          case "changeOfferPrice":
            data.push({
              hash: interaction.txHash,
              timestamp: interaction.timestamp,
              from: interaction.from,
              to: interaction.to,
              method: interaction.method,
              value: `${interaction.price} ${interaction.priceTokenIdentifier}`,
            });
            break;
          default:
            data.push({
              hash: interaction.txHash,
              timestamp: interaction.timestamp,
              from: interaction.from,
              to: interaction.to,
              method: interaction.method,
              value: `${interaction.quantity} x ${interaction.tokenIdentifier}`,
            });
            break;
        }
      }
      setData(data);
    }

    getInteractions();
    setLoadingData(false);
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
