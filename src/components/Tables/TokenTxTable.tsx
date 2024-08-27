import React, { useEffect, useState, useMemo } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { HStack, Link, Spinner, Flex, Badge, Tooltip } from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import ShortAddress from "components/UtilComps/ShortAddress";
import { CHAIN_TX_VIEWER } from "libs/config";
import { getApi } from "libs/MultiversX/api";
import { backendApi } from "libs/utils";
import { useMarketStore } from "store";
import { DataTable } from "./Components/DataTable";
import { timeSince, TokenTableProps, TransactionInTable } from "./Components/tableUtils";

export default function TokenTxTable(props: TokenTableProps) {
  const { chainID } = useGetNetworkConfig();
  const [data, setData] = useState<TransactionInTable[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const linkIconStyle = { display: "flex" };
  const isApiUp = useMarketStore((state) => state.isApiUp);
  const columns = useMemo<ColumnDef<TransactionInTable, any>[]>(
    () => [
      {
        id: "hash",
        accessorFn: (row) => row.hash,
        cell: (cellProps) => (
          <HStack>
            <ShortAddress address={cellProps.getValue()} marginLeftSet="1" fontSize="md" />
            <Link href={`${CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER]}/transactions/${cellProps.getValue()}`} isExternal style={linkIconStyle}>
              <ExternalLinkIcon fontSize="sm" />
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
            <ShortAddress address={cellProps.getValue()} marginLeftSet="1" fontSize="md" />
            <Link href={`${CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER]}/accounts/${cellProps.getValue()}`} isExternal style={linkIconStyle}>
              <ExternalLinkIcon fontSize="sm" />
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
            <ShortAddress address={cellProps.getValue()} marginLeftSet="1" fontSize="md" />
            <Link href={`${CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER]}/accounts/${cellProps.getValue()}`} isExternal style={linkIconStyle}>
              <ExternalLinkIcon fontSize="sm" />
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
        header: "Quantity",
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
      const response = await axios.get(`https://${getApi(chainID)}/nfts/${props.tokenId}/transactions?size=50&status=success`);
      const interactions = response.data;
      const dataTemp: TransactionInTable[] = [];

      for (const interaction of interactions) {
        dataTemp.push({
          hash: interaction.txHash,
          timestamp: interaction.timestamp,
          from: interaction.sender,
          to: interaction.receiver,
          method: interaction.function,
          value: `${interaction?.action.arguments?.transfers[0].value} x ${interaction?.action.arguments?.transfers[0].identifier}`,
        });
      }

      setData(dataTemp);
    }

    async function getBackendInteractions() {
      const api = backendApi(chainID);
      const response = await axios.get(`${api}/interactions/${props.tokenId}`);
      const interactions = response.data;
      const dataTemp: TransactionInTable[] = [];

      for (const interaction of interactions) {
        switch (interaction.method) {
          case "addOffer":
            dataTemp.push({
              hash: interaction.txHash,
              timestamp: interaction.timestamp,
              from: interaction.from,
              to: interaction.to,
              method: interaction.method,
              value: `${interaction.quantity} x ${interaction.price} ${interaction.priceTokenIdentifier}`,
            });
            break;
          case "acceptOffer":
            dataTemp.push({
              hash: interaction.txHash,
              timestamp: interaction.timestamp,
              from: interaction.from,
              to: interaction.to,
              method: interaction.method,
              value: `${interaction.quantity} x ${interaction.price} ${interaction.priceTokenIdentifier}`,
            });

            break;

          case "cancelOffer":
            dataTemp.push({
              hash: interaction.txHash,
              timestamp: interaction.timestamp,
              from: interaction.from,
              to: interaction.to,
              method: interaction.method,
              value: `${interaction.quantity} x ${interaction.tokenIdentifier}`,
            });

            break;

          case "changeOfferPrice":
            dataTemp.push({
              hash: interaction.txHash,
              timestamp: interaction.timestamp,
              from: interaction.from,
              to: interaction.to,
              method: interaction.method,
              value: `${interaction.price} ${interaction.priceTokenIdentifier}`,
            });
            break;
          default:
            dataTemp.push({
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
      setData(dataTemp);
    }

    if (isApiUp) {
      getBackendInteractions();
    } else {
      getInteractions();
    }

    setLoadingData(false);
  }, [isApiUp]);

  return (
    <>
      {loadingData ? (
        <Flex padding="5px" minH="100px" mb="10px" alignItems="center" justifyContent="center">
          <Spinner speed="0.64s" color="teal.200" />
        </Flex>
      ) : (
        <Flex direction="column" alignItems="center" justifyContent="center">
          <DataTable columns={columns} data={data} />

          {!isApiUp && (
            <Tooltip
              label="The backend is currently unavailable and full activity details are not displayed. Please try again later."
              hasArrow
              textAlign="center"
              borderRadius="12px"
              p="2">
              <Badge borderRadius="full" px="2" py="2" mb="4" colorScheme="red" cursor="pointer">
                Backend is unavailable at the moment
              </Badge>
            </Tooltip>
          )}
        </Flex>
      )}
    </>
  );
}
