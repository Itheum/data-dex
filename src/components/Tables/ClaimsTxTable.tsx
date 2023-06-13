import React, { useEffect, useState, useMemo } from "react";
import { ExternalLinkIcon, WarningTwoIcon } from "@chakra-ui/icons";
import { Box, HStack, Link, Spinner, useToast } from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import ShortAddress from "components/UtilComps/ShortAddress";
import { CHAIN_TX_VIEWER } from "libs/config";
import { getClaimTransactions } from "libs/MultiversX/api";
import { formatNumberRoundFloor } from "libs/utils";
import { useChainMeta } from "store/ChainMetaContext";
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
        accessorFn: (row) => row.timestamp,
        header: "Age",
        cell: (cellProps) => timeSince(cellProps.getValue()),
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
    const res = await getClaimTransactions(props.address, _chainMeta.contracts.claims, _chainMeta.networkId);

    if (res.error) {
      toast({
        title: "ER4: Could not get your recent transactions from the MultiversX blockchain.",
        status: "error",
        isClosable: true,
        duration: null,
      });

      setLoadingClaims(-2);
    } else {
      setData(res.transactions);
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
