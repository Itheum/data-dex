import React, { Fragment, useEffect, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Bond, BondContract, Compensation, DataNft } from "@itheum/sdk-mx-data-nft/out";
import { useGetAccountInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import BigNumber from "bignumber.js";
import { useNavigate, useParams } from "react-router-dom";
import { CustomPagination } from "components/CustomPagination";
import useThrottle from "components/UtilComps/UseThrottle";
import { IS_DEVNET } from "libs/config";
import { BondingParameters } from "./components/BondingParameters";
import { CollectionDashboard } from "./components/CollectionDashboard";
import { NoDataHere } from "../../components/Sections/NoDataHere";
import { CompensationDashboard } from "./components/CompensationDashboard";

type CompensationNftsType = {
  nonce: number;
  tokenIdentifier: string;
};

export const Bonding: React.FC = () => {
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const bondContractAdminDevnet = import.meta.env.VITE_ENV_BONDING_ADMIN_DEVNET;
  const bondContractAdminMainnet = import.meta.env.VITE_ENV_BONDING_ADMIN_MAINNET;
  const bondContract = new BondContract(IS_DEVNET ? "devnet" : "mainnet");
  DataNft.setNetworkConfig(IS_DEVNET ? "devnet" : "mainnet");
  const [bondingDataNfts, setBondingDataNfts] = useState<Array<DataNft>>([]);
  const [contractBonds, setContractBonds] = useState<Bond[]>([]);
  const [totalAmountBondedForThisPage, setTotalAmountBondedForThisPage] = useState<number>(0);
  const navigate = useNavigate();

  // pagination
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 8;
  const { pageNumber } = useParams();
  const pageIndex = pageNumber ? Number(pageNumber) : 0;

  const setPageIndex = (newPageIndex: number) => {
    navigate(`/bonding${newPageIndex > 0 ? "/" + newPageIndex : ""}`);
  };

  const onGotoPage = useThrottle((newPageIndex: number) => {
    if (0 <= newPageIndex && newPageIndex < pageCount) {
      setPageIndex(newPageIndex);
    }
  });

  const checkIfUserIsAdmin = () => {
    if (!address) return false;
    const adminAddress = IS_DEVNET ? bondContractAdminDevnet : bondContractAdminMainnet;
    return address === adminAddress;
  };

  useEffect(() => {
    (async () => {
      const totalNumberOfBonds = await bondContract.viewTotalBonds();
      setPageCount(Math.ceil(totalNumberOfBonds / pageSize));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const itemsForCompensation: Array<CompensationNftsType> = [];
      const contractBonds = await bondContract.viewAllBonds();
      contractBonds.map((bond) => {
        itemsForCompensation.push({ nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier });
      });
      if (contractBonds.length === 0) {
        return;
      }
      const pagedBonds = await bondContract.viewPagedBonds(pageIndex * pageSize, (pageIndex + 1) * pageSize - 1);
      let _totalAmountBondedForThisPage = 0;
      pagedBonds.forEach((bond) => {
        _totalAmountBondedForThisPage += BigNumber(bond.bondAmount)
          .dividedBy(10 ** 18)
          .toNumber();
      });

      const compensation = await bondContract.viewCompensations(itemsForCompensation);

      const dataNfts: DataNft[] = await DataNft.createManyFromApi(pagedBonds.map((bond) => ({ nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier })));
      setTotalAmountBondedForThisPage(_totalAmountBondedForThisPage);
      setContractBonds(pagedBonds.reverse());

      const dataNfts: DataNft[] = await DataNft.createManyFromApi(pagedBonds.map((bond) => ({ nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier })));
      setBondingDataNfts(dataNfts);
      setAllCompensation(compensation.reverse());
      // console.log(compensation);
    })();
  }, [hasPendingTransactions, pageIndex]);

  return (
    <>
      {checkIfUserIsAdmin() ? (
        <Flex as="div" flexDirection="column" mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }} gap={8}>
          <Box border="1px solid" borderColor="#00C79740" rounded="3xl" px={10} py={20} mt={5} bg="#1b1b1b50">
            <Flex justifyContent="space-between" alignItems="center" px={10}>
              <Flex flexDirection="column" justifyContent="center">
                <Text fontSize="3.1rem" fontFamily="Clash-Medium">
                  Itheum Life: Bonding
                </Text>
              </Flex>
            </Flex>
          </Box>
          <BondingParameters />
          <Box border="1px solid" borderColor="#00C79740" rounded="3xl" px={10} py={5} bg="#1b1b1b50">
            <Flex justifyContent="space-between" alignItems="center" px={10}>
              <Flex flexDirection="column" justifyContent="center">
                <Text fontSize="2rem" fontFamily="Clash-Medium" textColor="teal.200">
                  Total Bonded on this page: {totalAmountBondedForThisPage} $ITHEUM
                </Text>
              </Flex>
            </Flex>
          </Box>
          <Box border="1px solid" borderColor="#00C79740" rounded="3xl" px={10} py={5} bg="#1b1b1b50" overflowY="scroll" h="70rem" mb={10}>
            <Flex justifyContent="space-between" alignItems="center" px={10}>
              <Flex flexDirection="column" justifyContent="center" w="full" gap={5}>
                <Flex flexDirection="row" justifyContent="space-between">
                  <Text fontSize="1.75rem" fontFamily="Clash-Medium" textColor="teal.200">
                    Collection Dashboard
                  </Text>{" "}
                  {contractBonds.length > 0 && (
                    <Flex justifyContent={{ base: "center", md: "center" }} py="5">
                      <CustomPagination pageCount={pageCount} pageIndex={pageIndex} gotoPage={onGotoPage} disabled={hasPendingTransactions} />
                    </Flex>
                  )}
                </Flex>
                {contractBonds.length === 0 ? (
                  <NoDataHere />
                ) : (
                  contractBonds.map((bond, index) => (
                    <Fragment key={index}>
                      <CollectionDashboard bondNft={bond} bondDataNft={bondingDataNfts} />
                    </Fragment>
                  ))
                )}
              </Flex>
            </Flex>
          </Box>
          <Box border="1px solid" borderColor="#00C79740" rounded="3xl" px={10} py={5} bg="#1b1b1b50" overflowY="scroll" h="40rem" mb={10}>
            <Flex justifyContent="space-between" alignItems="center" px={10}>
              <Flex flexDirection="column" justifyContent="center" w="full">
                <Text fontSize="1.75rem" fontFamily="Clash-Medium" textColor="teal.200">
                  Compensation Module
                </Text>
                <Text fontSize="1.5rem" fontFamily="Clash-Regular" textColor="teal.200">
                  Slashes and Penalties
                </Text>
                {allCompensation.length === 0 ? (
                  <NoDataHere />
                ) : (
                  allCompensation.map((compensation, index) => (
                    <Fragment key={index}>
                      <CompensationDashboard compensationBondNft={compensation} bondDataNft={bondingDataNfts} />
                    </Fragment>
                  ))
                )}
                {contractBonds.length > 0 && (
                  <Flex justifyContent={{ base: "center", md: "center" }} py="5">
                    <CustomPagination pageCount={pageCount} pageIndex={pageIndex} gotoPage={onGotoPage} disabled={hasPendingTransactions} />
                  </Flex>
                )}
              </Flex>
            </Flex>
          </Box>
        </Flex>
      ) : (
        navigate("/")
      )}
    </>
  );
};
