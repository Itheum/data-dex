import React, { useEffect, useState, useMemo } from "react";
import { ExternalLinkIcon, WarningTwoIcon } from "@chakra-ui/icons";
import { Box, HStack, Link, Spinner, useToast } from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { CHAIN_TX_VIEWER, formatNumberRoundFloor, uxConfig } from "libs/util";
import { getApi, getClaimTransactions } from "MultiversX/api";
import { useChainMeta } from "store/ChainMetaContext";
import ShortAddress from "UtilComps/ShortAddress";
import { DataTable } from "./Components/DataTable";
import { ClaimsInTable, timeSince } from "./Components/tableUtils";

export default function ClaimsTxTable(props: { address: string }) {
  const { chainMeta: _chainMeta } = useChainMeta();
  const [data, setData] = useState<ClaimsInTable[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(-1);
  const toast = useToast();

  const linkIconStyle = { display: "flex" };
  const columns = useMemo<ColumnDef<ClaimsInTable, any>[]>(
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
        id: "type",
        accessorFn: (row) => row.claimType,
        header: "Type",
        footer: (footerProps) => footerProps.column.id,
      },
      {
        id: "amount",
        accessorFn: (row) => formatNumberRoundFloor(row.amount / Math.pow(10, 18)),
        header: "Amount",
        footer: (footerProps) => footerProps.column.id,
      },
    ],
    []
  );

  useEffect(() => {
    fetchMxClaims();
  }, []);

  const fetchMxClaims = async () => {
    const transactions = await getClaimTransactions(props.address, _chainMeta.contracts.claims, _chainMeta.networkId);

    if ("error" in transactions) {
      toast({
        title: "ER4: Could not get your recent transactions from the MultiversX blockchain.",
        status: "error",
        isClosable: true,
        duration: null,
      });

      setLoadingClaims(-2);
    } else {
      setData(transactions);
      setLoadingClaims(0);
    }
  };
  return (
    <>
      {((loadingClaims === -1 || loadingClaims === -2) && (
        <Box minH="150" alignItems="center" display="flex" justifyContent="center">
          {loadingClaims === -1 ? <Spinner size="lg" /> : <WarningTwoIcon />}
        </Box>
      )) || <DataTable columns={columns} data={data} /> || (
          <Box minH="150" alignItems="center" display="flex" justifyContent="center">
            No interactions yet...
          </Box>
        )}
    </>
  );
}
