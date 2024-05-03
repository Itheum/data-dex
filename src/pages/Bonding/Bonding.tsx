import React, { Fragment, useEffect, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Bond, BondContract, Compensation, DataNft } from "@itheum/sdk-mx-data-nft/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
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
  const [compensationDataNfts, setCompensationDataNfts] = useState<Array<DataNft>>([]);
  const [contractBonds, setContractBonds] = useState<Bond[]>([]);
  const [totalAmountBondedForThisPage, setTotalAmountBondedForThisPage] = useState<number>(0);
  const [allCompensation, setAllCompensation] = useState<Compensation[]>([]);
  const navigate = useNavigate();

  // pagination
  const [bondingPageCount, setBondingPageCount] = useState(0);
  const [compensationPageCount, setCompensationPageCount] = useState(0);
  const pageSize = 8;
  const { bondingPageNumber, compensationPageNumber } = useParams();
  const bondingPageIndex = bondingPageNumber ? Number(bondingPageNumber) : 0;
  const compensationPageIndex = compensationPageNumber ? Number(compensationPageNumber) : 0;

  const setPageIndexBonding = (newPageIndex: number) => {
    navigate(`/bonding${newPageIndex > 0 ? "/" + newPageIndex : "/" + 0}/compensation/${compensationPageIndex}`);
  };

  const setPageIndexCompensation = (newPageIndex: number) => {
    navigate(`/bonding/${bondingPageIndex}/compensation${newPageIndex > 0 ? "/" + newPageIndex : "/" + 0}`);
  };

  const onGotoPageBonding = useThrottle((newPageIndex: number) => {
    if (0 <= newPageIndex && newPageIndex < bondingPageCount) {
      setPageIndexBonding(newPageIndex);
    }
  });

  const onGotoPageCompensation = useThrottle((newPageIndex: number) => {
    console.log("newPageIndex", newPageIndex);
    if (0 <= newPageIndex && newPageIndex < compensationPageCount) {
      setPageIndexCompensation(newPageIndex);
    }
  });

  const checkIfUserIsAdmin = () => {
    const splittedAddresses = bondContractAdminDevnet.split(",").map((wallet: string) => wallet.trim());
    if (!address) return false;
    const adminAddress: any = IS_DEVNET ? splittedAddresses : bondContractAdminMainnet;
    return adminAddress.includes(address) || address === adminAddress;
  };

  useEffect(() => {
    (async () => {
      const totalNumberOfBonds = await bondContract.viewTotalBonds();
      setBondingPageCount(Math.ceil(totalNumberOfBonds / pageSize));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const totalNumberOfCompensation = await bondContract.viewTotalCompensations();
      console.log("totalNumberOfCompensation", totalNumberOfCompensation);
      setCompensationPageCount(Math.ceil(totalNumberOfCompensation / pageSize));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const pagedBonds = await bondContract.viewPagedBonds(bondingPageIndex * pageSize, (bondingPageIndex + 1) * pageSize - 1);
      let _totalAmountBondedForThisPage = 0;
      pagedBonds.forEach((bond) => {
        _totalAmountBondedForThisPage += BigNumber(bond.bondAmount)
          .dividedBy(10 ** 18)
          .toNumber();
      });

      const dataNfts: DataNft[] = await DataNft.createManyFromApi(pagedBonds.map((bond) => ({ nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier })));
      setTotalAmountBondedForThisPage(_totalAmountBondedForThisPage);
      setContractBonds(pagedBonds);
      // console.log(pagedBonds, dataNfts);
      setBondingDataNfts(dataNfts);
    })();
  }, [hasPendingTransactions, bondingPageIndex]);

  useEffect(() => {
    (async () => {
      const itemsForCompensation: Array<CompensationNftsType> = [];
      const _contractBonds = await bondContract.viewAllBonds();
      _contractBonds.map((bond) => {
        itemsForCompensation.push({ nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier });
      });
      if (_contractBonds.length === 0) {
        return;
      }
      const pagedCompensation = await bondContract.viewPagedCompensations(compensationPageIndex * pageSize, (compensationPageIndex + 1) * pageSize - 1);
      const dataNfts: DataNft[] = await DataNft.createManyFromApi(
        pagedCompensation.map((bond) => ({ nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier }))
      );
      setCompensationDataNfts(dataNfts.reverse());
      console.log(pagedCompensation, dataNfts);
      setAllCompensation(pagedCompensation);
    })();
  }, [hasPendingTransactions, compensationPageIndex]);

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
                      <CustomPagination
                        pageCount={bondingPageCount}
                        pageIndex={bondingPageIndex}
                        gotoPage={onGotoPageBonding}
                        disabled={hasPendingTransactions}
                      />
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

                {contractBonds.length > 0 && (
                  <Flex justifyContent={{ base: "center", md: "center" }} py="5">
                    <CustomPagination
                      pageCount={bondingPageCount}
                      pageIndex={bondingPageIndex}
                      gotoPage={onGotoPageBonding}
                      disabled={hasPendingTransactions}
                    />
                  </Flex>
                )}
              </Flex>
            </Flex>
          </Box>
          <Box border="1px solid" borderColor="#00C79740" rounded="3xl" px={10} py={5} bg="#1b1b1b50" overflowY="scroll" h="70rem" mb={10}>
            <Flex justifyContent="space-between" alignItems="center" px={10}>
              <Flex flexDirection="column" justifyContent="center" w="full">
                <Text fontSize="1.75rem" fontFamily="Clash-Medium" textColor="teal.200">
                  Compensation Module
                </Text>
                <Text fontSize="1.5rem" fontFamily="Clash-Regular" textColor="teal.200">
                  Slashes and Penalties
                </Text>
                {allCompensation.length > 0 && (
                  <Flex justifyContent={{ base: "center", md: "center" }} py="5">
                    <CustomPagination
                      pageCount={compensationPageCount}
                      pageIndex={compensationPageIndex}
                      gotoPage={onGotoPageCompensation}
                      disabled={hasPendingTransactions}
                    />
                  </Flex>
                )}
                {allCompensation.length === 0 ? (
                  <NoDataHere />
                ) : (
                  allCompensation.map((compensation, index) => (
                    <Fragment key={index}>
                      <CompensationDashboard compensationBondNft={compensation} bondDataNft={compensationDataNfts} />
                    </Fragment>
                  ))
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
